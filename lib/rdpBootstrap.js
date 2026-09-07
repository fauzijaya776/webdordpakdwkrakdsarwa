/**
 * Membangun perintah shell untuk instalasi RDP yang berjalan DETACHED di VPS.
 *
 * Kenapa detached: instalasi RDP butuh 40-90 menit — jauh melebihi batas waktu
 * fungsi serverless (Vercel maks 60 detik). Jadi endpoint /api/rdp/start hanya
 * mengunggah + menyalakan skrip (setsid nohup) lalu langsung balik dalam
 * beberapa detik. Skrip berjalan sendiri di VPS dan menulis progres ke file;
 * endpoint /api/rdp/status membacanya lewat SSH singkat tiap beberapa detik.
 */

const REMOTE_DIR = '/root/.rdpweb';
const LOG = `${REMOTE_DIR}/install.log`;
const STATUS = `${REMOTE_DIR}/install.status`;
const STEP = `${REMOTE_DIR}/install.step`;
const PID = `${REMOTE_DIR}/install.pid`;

const DEFAULT_SCRIPT_BASE = (process.env.RDP_SCRIPT_BASE || 'https://reemote.biz.id').replace(/\/+$/, '');

/** Persentase & label untuk tiap penanda langkah, dipakai frontend. */
const STEP_INFO = {
  apt:     { percent: 5,  note: 'Menunggu VPS siap (apt lock)' },
  swap:    { percent: 12, note: 'Menyiapkan memori tambahan (swap)' },
  unduh:   { percent: 18, note: 'Mengunduh script installer' },
  install: { percent: 25, note: 'Instalasi Windows berjalan' }
};

/**
 * Isi run.sh — dijalankan DI VPS. Catatan gaya: memakai $VAR (bukan ${VAR})
 * untuk variabel shell supaya tidak bentrok dengan interpolasi template JS;
 * hanya ${...} milik JS yang tersubstitusi di sini.
 */
function buildRunScript({ windowsId, scriptBase = DEFAULT_SCRIPT_BASE }) {
  const base = String(scriptBase).replace(/\/+$/, '');
  return `#!/bin/bash
export DEBIAN_FRONTEND=noninteractive
mkdir -p ${REMOTE_DIR}
: > ${LOG}
exec >> ${LOG} 2>&1
set_step() { echo "STEP=$1" > ${STEP}; }

# ---------- 1. Tunggu apt/dpkg lock lepas (maks ~180 detik) ----------
set_step apt
for i in $(seq 1 60); do
  BUSY=0
  for L in /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock /var/lib/apt/lists/lock; do
    if command -v fuser >/dev/null 2>&1; then fuser "$L" >/dev/null 2>&1 && BUSY=1; fi
  done
  pgrep -x apt >/dev/null 2>&1 && BUSY=1
  pgrep -x apt-get >/dev/null 2>&1 && BUSY=1
  pgrep -f unattended-upgr >/dev/null 2>&1 && BUSY=1
  [ "$BUSY" = "0" ] && break
  sleep 3
done

# ---------- 2. Swap + overcommit (bantalan agar RAM bisa dipakai penuh) ----------
set_step swap
SWAP_ACTIVE=$(swapon --show=NAME --noheadings 2>/dev/null | wc -l)
if [ "$SWAP_ACTIVE" -eq 0 ]; then
  if [ ! -f /swapfile ]; then
    fallocate -l 4G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=4096 status=none 2>/dev/null
  fi
  chmod 600 /swapfile 2>/dev/null
  mkswap /swapfile >/dev/null 2>&1
  swapon /swapfile >/dev/null 2>&1
  grep -q '^/swapfile' /etc/fstab 2>/dev/null || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
sysctl -w vm.swappiness=10 >/dev/null 2>&1
sysctl -w vm.overcommit_memory=1 >/dev/null 2>&1

# ---------- 3. Pilih & unduh script installer ----------
set_step unduh
ARCH=$(uname -m)
if echo "$ARCH" | grep -qiE 'aarch64|arm64|armv'; then ISARM=1; else ISARM=0; fi
if [ -e /dev/kvm ]; then KVM=1; else KVM=0; fi
if [ "$ISARM" = "1" ]; then
  [ "$KVM" = "1" ] && SCRIPT_NAME=arm.sh || SCRIPT_NAME=armn.sh
else
  [ "$KVM" = "1" ] && SCRIPT_NAME=rdp.sh || SCRIPT_NAME=rdpn.sh
fi
SCRIPT_URL="${base}/$SCRIPT_NAME"
echo "SCRIPT_URL=$SCRIPT_URL"
if ! command -v curl >/dev/null 2>&1; then
  apt-get update -qq >/dev/null 2>&1; apt-get install -y -qq curl >/dev/null 2>&1
fi
DL_OK=0
if command -v curl >/dev/null 2>&1; then
  curl -fsSL --retry 3 --retry-delay 2 --max-time 180 -o ${REMOTE_DIR}/rdp.sh "$SCRIPT_URL" && DL_OK=1
elif command -v wget >/dev/null 2>&1; then
  wget -q --tries=3 --timeout=180 -O ${REMOTE_DIR}/rdp.sh "$SCRIPT_URL" && DL_OK=1
fi
if [ "$DL_OK" != "1" ] || [ ! -s ${REMOTE_DIR}/rdp.sh ]; then
  echo "ERR=DOWNLOAD_FAILED url=$SCRIPT_URL"
  echo "INSTALL_EXIT=91" > ${STATUS}
  exit 0
fi
if head -c 1024 ${REMOTE_DIR}/rdp.sh | grep -qiE '<(!doctype|html|head|body|title)'; then
  echo "ERR=DOWNLOAD_HTML url=$SCRIPT_URL"
  echo "INSTALL_EXIT=92" > ${STATUS}
  exit 0
fi
chmod +x ${REMOTE_DIR}/rdp.sh

# ---------- 4. Deteksi spesifikasi VPS (RAM/CPU/disk untuk VM Windows) ----------
set_step install
CPU=$(nproc 2>/dev/null || echo 1)
MEMMB=$(free -m 2>/dev/null | awk '/^Mem:/{print $2}')
[ -z "$MEMMB" ] && MEMMB=1024
RAM=$(( (MEMMB - 1024) / 1024 ))
[ "$RAM" -lt 1 ] && RAM=1
DISKG=$(df -BG --output=avail / 2>/dev/null | tail -1 | tr -dc '0-9')
[ -z "$DISKG" ] && DISKG=20
STORAGE=$(( DISKG - 5 ))
[ "$STORAGE" -lt 10 ] && STORAGE=10
echo "SPEC CPU=$CPU RAM=$RAM STORAGE=$STORAGE MEM_MB=$MEMMB DISK_G=$DISKG"

PW=$(cat ${REMOTE_DIR}/rdp_pw)
cat > ${REMOTE_DIR}/answers.txt << ANS_EOF
${windowsId}
$RAM
$CPU
$STORAGE
$PW
ANS_EOF

# ---------- 5. Jalankan installer (baca jawaban dari answers.txt) ----------
cd /root
bash ${REMOTE_DIR}/rdp.sh < ${REMOTE_DIR}/answers.txt
RC=$?
echo "INSTALL_EXIT=$RC" > ${STATUS}
rm -f ${REMOTE_DIR}/answers.txt ${REMOTE_DIR}/rdp_pw
`;
}

/**
 * Perintah yang dikirim endpoint /start lewat SSH: menulis password + run.sh,
 * lalu menyalakan run.sh secara detached dan langsung balik.
 * Heredoc dikutip ('...') supaya isi TIDAK diekspansi shell luar.
 */
function buildLaunchCommand({ windowsId, rdpPassword, scriptBase }) {
  const runScript = buildRunScript({ windowsId, scriptBase });
  return `
mkdir -p ${REMOTE_DIR}
rm -f ${STATUS} ${STEP} ${PID}
cat > ${REMOTE_DIR}/rdp_pw << 'RDPWEB_PW_EOF'
${rdpPassword}
RDPWEB_PW_EOF
chmod 600 ${REMOTE_DIR}/rdp_pw
cat > ${REMOTE_DIR}/run.sh << 'RDPWEB_RUN_EOF'
${runScript}
RDPWEB_RUN_EOF
chmod +x ${REMOTE_DIR}/run.sh
setsid nohup bash ${REMOTE_DIR}/run.sh > /dev/null 2>&1 &
echo $! > ${PID}
sleep 2
if [ -f ${STATUS} ]; then
  echo "LAUNCH=FINISHED_EARLY"
elif kill -0 "$(cat ${PID} 2>/dev/null)" 2>/dev/null; then
  echo "LAUNCH=OK"
else
  echo "LAUNCH=UNKNOWN"
fi
echo "LAUNCH_DONE=1"
`.trim();
}

/** Perintah untuk membaca status instalasi (SSH singkat, dipanggil berkala). */
const POLL_COMMAND = `
if [ -f ${STATUS} ]; then
  echo "STATE=DONE"; cat ${STATUS}
else
  if pgrep -f '${REMOTE_DIR}/run.sh' >/dev/null 2>&1 || pgrep -f '${REMOTE_DIR}/rdp.sh' >/dev/null 2>&1; then
    echo "STATE=RUNNING"
  else
    echo "STATE=GONE"
  fi
fi
cat ${STEP} 2>/dev/null
echo "LOG_LINES=$(wc -l < ${LOG} 2>/dev/null || echo 0)"
echo "---LOGTAIL---"
tail -n 8 ${LOG} 2>/dev/null
`.trim();

module.exports = {
  REMOTE_DIR, LOG, STATUS, STEP, PID,
  DEFAULT_SCRIPT_BASE,
  STEP_INFO,
  buildRunScript,
  buildLaunchCommand,
  POLL_COMMAND
};
