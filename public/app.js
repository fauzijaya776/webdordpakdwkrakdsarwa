'use strict';

/* ============ i18n ============ */
const I18N = {
  id: {
    gateTitle: '🔒 Masuk',
    gateDesc: 'Halaman ini dilindungi. Masukkan kata sandi akses.',
    gatePh: 'Kata sandi akses',
    gateBtn: 'Masuk',
    gateWrong: 'Kata sandi salah.',
    title: '☁️ Installer DigitalOcean & RDP Windows',
    subtitle: 'Buat/hapus droplet lewat API DigitalOcean, lalu pasang RDP Windows di VPS mana pun.',
    tabDo: 'DigitalOcean',
    tabRdp: 'Installer RDP',
    doTokenTitle: '1. Token DigitalOcean',
    doTokenHint: 'Buat token di <b>API → Tokens</b> (scope <b>Write</b>). Token tidak disimpan di server, hanya dipakai untuk permintaanmu.',
    doCheckBtn: 'Cek Token',
    doCreateTitle: '2. Buat Droplet',
    doCount: 'Jumlah droplet (1–10)',
    doRegion: 'Region',
    doSize: 'Ukuran',
    doImage: 'Image OS',
    doPrefix: 'Nama (prefix)',
    doRootPw: 'Password root (opsional)',
    doRootPwPh: 'kosongkan = acak otomatis',
    doCreateBtn: 'Buat Droplet',
    doListTitle: '3. Daftar & Hapus Droplet',
    doRefreshBtn: 'Muat Droplet',
    doOnlyTag: 'hanya buatan alat ini',
    rdpTitle: 'Pasang RDP Windows',
    rdpHint: 'Masukkan IP VPS, password root, dan pilih versi Windows. Proses berjalan di VPS sekitar <b>40–90 menit</b>; halaman akan memantau progresnya.',
    rdpHost: 'IP VPS',
    rdpPass: 'Password root VPS',
    rdpPassPh: 'password SSH root',
    rdpWin: 'Versi Windows',
    rdpAdv: 'Opsi lanjutan',
    rdpPort: 'Port SSH (opsional)',
    rdpPortPh: 'auto-deteksi',
    rdpUser: 'User SSH',
    rdpWinPw: 'Password RDP Windows (opsional)',
    rdpWinPwPh: 'kosongkan = sama dgn password VPS',
    rdpStartBtn: 'Mulai Install',
    footer: '⚠️ Alat teknis. Jaga URL & sandi akses tetap rahasia — siapa pun yang bisa membukanya bisa membuat/menghapus droplet dan menjalankan installer.',
    // dynamic
    copyLabel: 'salin',
    copied: 'Disalin',
    checking: 'Mengecek...',
    tokenValid: (email, status) => email
      ? `✓ Token valid — <b>${email}</b> (status: ${status || '?'})`
      : '✓ Token valid (scope terbatas ke droplet — cukup untuk buat/hapus droplet).',
    fillToken: 'Isi token DigitalOcean dulu.',
    creating: 'Membuat...',
    created: (n, pw, ipHint) => `<div class="box">✓ ${n} droplet dibuat.<br>Password root (untuk semua): ${pw}<br><span class="hint">${ipHint}</span></div>`,
    createdToast: (n) => `${n} droplet dibuat`,
    ipHint: 'Droplet butuh ±1 menit untuk dapat IP. Klik "Muat Droplet" di bawah untuk melihat IP-nya.',
    loading: 'Memuat...',
    noDroplets: 'Belum ada droplet.',
    waitingIp: 'menunggu IP…',
    monitoring: (n) => `↻ memantau ${n} droplet baru...`,
    confirmDelete: (name, id) => `Hapus droplet "${name}" (id ${id})? Tindakan ini permanen.`,
    deleting: 'Menghapus...',
    deleteBtn: 'Hapus',
    deletedToast: (name) => `Droplet ${name} dihapus`,
    deleteFailed: (msg) => 'Gagal: ' + msg,
    fillIpPass: 'Isi IP dan password VPS.',
    connecting: 'Menyambung...',
    startConnecting: 'Menyambung ke VPS & menyalakan installer...',
    launched: (win) => `Installer dinyalakan (${win}). Memantau progres...`,
    runningToast: 'Installer berjalan di VPS',
    doneOk: '✓ Selesai! Windows siap.',
    doneToast: 'Instalasi RDP selesai 🎉',
    retrying: (msg) => '⏳ ' + msg + ' (mencoba lagi)',
    rdpConn: (host, pw, win) => `KONEKSI RDP:\n  Alamat  : ${host}:3389\n  User    : Administrator\n  Password: ${pw}\n\nWindows: ${win}\n(Gunakan aplikasi Remote Desktop / Microsoft Remote Desktop.)`,
    // progress notes
    noteApt: 'Menunggu VPS siap (apt lock)',
    noteSwap: 'Menyiapkan memori tambahan (swap)',
    noteUnduh: 'Mengunduh script installer',
    noteInstall: (n) => `Instalasi Windows berjalan (${n} baris log)`,
    notePrep: 'Menyiapkan...',
    noteGone: 'Proses tidak terlihat berjalan (mungkin VPS reboot). Menunggu...',
    noteUnreachable: 'VPS belum bisa dihubungi (normal saat instalasi/reboot). Mencoba lagi...',
    failDl: 'Gagal: VPS tidak bisa mengunduh script installer (cek koneksi keluar VPS).',
    failHtml: 'Gagal: URL script membalas halaman web, bukan script.',
    failExit: (c) => `Gagal: installer berhenti dengan kode ${c}. Lihat log terakhir.`,
    loadFail: (m) => 'Gagal memuat: ' + m
  },
  en: {
    gateTitle: '🔒 Sign in',
    gateDesc: 'This page is protected. Enter the access password.',
    gatePh: 'Access password',
    gateBtn: 'Sign in',
    gateWrong: 'Wrong password.',
    title: '☁️ DigitalOcean & Windows RDP Installer',
    subtitle: 'Create/delete droplets via the DigitalOcean API, then install Windows RDP on any VPS.',
    tabDo: 'DigitalOcean',
    tabRdp: 'RDP Installer',
    doTokenTitle: '1. DigitalOcean Token',
    doTokenHint: 'Create a token under <b>API → Tokens</b> (<b>Write</b> scope). Your token is never stored on the server; it is only used for your requests.',
    doCheckBtn: 'Check Token',
    doCreateTitle: '2. Create Droplet',
    doCount: 'Number of droplets (1–10)',
    doRegion: 'Region',
    doSize: 'Size',
    doImage: 'OS Image',
    doPrefix: 'Name (prefix)',
    doRootPw: 'Root password (optional)',
    doRootPwPh: 'leave blank = auto-generated',
    doCreateBtn: 'Create Droplet',
    doListTitle: '3. List & Delete Droplets',
    doRefreshBtn: 'Load Droplets',
    doOnlyTag: 'only created by this tool',
    rdpTitle: 'Install Windows RDP',
    rdpHint: 'Enter the VPS IP, root password, and pick a Windows version. It runs on the VPS for about <b>40–90 minutes</b>; this page will track the progress.',
    rdpHost: 'VPS IP',
    rdpPass: 'VPS root password',
    rdpPassPh: 'SSH root password',
    rdpWin: 'Windows version',
    rdpAdv: 'Advanced options',
    rdpPort: 'SSH port (optional)',
    rdpPortPh: 'auto-detect',
    rdpUser: 'SSH user',
    rdpWinPw: 'Windows RDP password (optional)',
    rdpWinPwPh: 'leave blank = same as VPS password',
    rdpStartBtn: 'Start Install',
    footer: '⚠️ Technical tool. Keep the URL & access password secret — anyone who can open it can create/delete droplets and run the installer.',
    // dynamic
    copyLabel: 'copy',
    copied: 'Copied',
    checking: 'Checking...',
    tokenValid: (email, status) => email
      ? `✓ Token valid — <b>${email}</b> (status: ${status || '?'})`
      : '✓ Token valid (scope limited to droplets — enough to create/delete droplets).',
    fillToken: 'Enter your DigitalOcean token first.',
    creating: 'Creating...',
    created: (n, pw, ipHint) => `<div class="box">✓ ${n} droplet(s) created.<br>Root password (for all): ${pw}<br><span class="hint">${ipHint}</span></div>`,
    createdToast: (n) => `${n} droplet(s) created`,
    ipHint: 'Droplets need ~1 minute to get an IP. Click "Load Droplets" below to see them.',
    loading: 'Loading...',
    noDroplets: 'No droplets yet.',
    waitingIp: 'waiting for IP…',
    monitoring: (n) => `↻ monitoring ${n} new droplet(s)...`,
    confirmDelete: (name, id) => `Delete droplet "${name}" (id ${id})? This is permanent.`,
    deleting: 'Deleting...',
    deleteBtn: 'Delete',
    deletedToast: (name) => `Droplet ${name} deleted`,
    deleteFailed: (msg) => 'Failed: ' + msg,
    fillIpPass: 'Enter the VPS IP and password.',
    connecting: 'Connecting...',
    startConnecting: 'Connecting to VPS & starting the installer...',
    launched: (win) => `Installer started (${win}). Tracking progress...`,
    runningToast: 'Installer running on the VPS',
    doneOk: '✓ Done! Windows is ready.',
    doneToast: 'RDP installation complete 🎉',
    retrying: (msg) => '⏳ ' + msg + ' (retrying)',
    rdpConn: (host, pw, win) => `RDP CONNECTION:\n  Address : ${host}:3389\n  User    : Administrator\n  Password: ${pw}\n\nWindows: ${win}\n(Use Remote Desktop / Microsoft Remote Desktop.)`,
    noteApt: 'Waiting for the VPS to be ready (apt lock)',
    noteSwap: 'Setting up extra memory (swap)',
    noteUnduh: 'Downloading the installer script',
    noteInstall: (n) => `Windows install in progress (${n} log lines)`,
    notePrep: 'Preparing...',
    noteGone: 'Process not visible (VPS may be rebooting). Waiting...',
    noteUnreachable: 'VPS not reachable yet (normal during install/reboot). Retrying...',
    failDl: 'Failed: the VPS could not download the installer script (check the VPS outbound connection).',
    failHtml: 'Failed: the script URL returned a web page, not a script.',
    failExit: (c) => `Failed: installer stopped with code ${c}. Check the last log lines.`,
    loadFail: (m) => 'Load failed: ' + m
  }
};

/** Pesan error server berdasarkan kode, untuk mode EN. */
const ERR_EN = {
  INPUT: 'Invalid or missing input.',
  UNAUTHORIZED: 'Wrong or missing access password.',
  METHOD: 'Method not allowed.',
  DO_AUTH: 'DigitalOcean token is invalid or has been revoked.',
  DO_FORBIDDEN: 'Token lacks write permission (needs "write" scope), or the account is unverified.',
  DO_NOTFOUND: 'Resource not found on DigitalOcean.',
  DO_INVALID: 'DigitalOcean rejected the droplet parameters.',
  DO_RATELIMIT: 'Too many requests to DigitalOcean. Wait a moment and try again.',
  DO_TIMEOUT: 'DigitalOcean did not respond in time.',
  DO_NETWORK: 'Could not reach DigitalOcean.',
  SSH_AUTH: 'Wrong username or password.',
  SSH_TIMEOUT: 'No response from the VPS.',
  SSH_REFUSED: 'The VPS refused the connection.',
  SSH_DNS: 'IP/host not found.',
  SSH_RESET: 'The VPS forcibly closed the connection.',
  SSH_HANDSHAKE: 'The VPS and server could not agree on an encryption algorithm.',
  SSH_NOPORT: 'No open SSH port found on the VPS. Make sure the IP is correct and the VPS is on.',
  SSH_ERROR: 'Failed to connect to the VPS.',
  LAUNCH_FAILED: 'The installer failed to start on the VPS.'
};

let LANG = 'id';
try { LANG = localStorage.getItem('lang') || 'id'; } catch (_) {}

function t(key, ...args) {
  const dict = I18N[LANG] || I18N.id;
  let v = dict[key];
  if (v === undefined) v = I18N.id[key];
  return typeof v === 'function' ? v(...args) : (v === undefined ? key : v);
}

/** Ubah "KODE:pesan" jadi teks sesuai bahasa. */
function localizeError(raw) {
  const s = String(raw || '');
  const i = s.indexOf(':');
  const code = i > 0 && i < 24 ? s.slice(0, i) : '';
  if (LANG === 'en' && code && ERR_EN[code]) return ERR_EN[code];
  return code ? s.slice(i + 1) : s;
}

function applyStaticI18n() {
  document.querySelectorAll('[data-i18n]').forEach((e) => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach((e) => { e.innerHTML = t(e.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-ph]').forEach((e) => { e.setAttribute('placeholder', t(e.dataset.i18nPh)); });
  document.documentElement.lang = LANG;
  document.querySelectorAll('.lang').forEach((b) => b.classList.toggle('active', b.dataset.lang === LANG));
}

function setLang(l) {
  LANG = l;
  try { localStorage.setItem('lang', l); } catch (_) {}
  applyStaticI18n();
  renderMetaSelects();
  refreshWindowsOptions();
}

/* ---------- util ---------- */
const $ = (sel) => document.querySelector(sel);
const el = (tag, attrs = {}, html = '') => {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => (k === 'class' ? (n.className = v) : n.setAttribute(k, v)));
  if (html) n.innerHTML = html;
  return n;
};
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function toast(msg) {
  const el2 = $('#toast');
  el2.textContent = msg;
  el2.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (el2.hidden = true), 2600);
}

/** POST JSON ke /api; melempar Error dengan pesan MENTAH (berkode) bila gagal. */
async function api(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });
  let data = {};
  try { data = await res.json(); } catch (_) {}
  if (!res.ok || data.ok === false) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function copyable(text) {
  return `<span class="mono">${esc(text)}</span><span class="copy" data-copy="${esc(text)}">${t('copyLabel')}</span>`;
}
document.addEventListener('click', (e) => {
  const c = e.target.closest('[data-copy]');
  if (c) { navigator.clipboard.writeText(c.getAttribute('data-copy')).then(() => toast(t('copied'))); }
});

/* ---------- tab & bahasa ---------- */
document.querySelectorAll('.tab').forEach((tb) => {
  tb.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((x) => x.classList.remove('active'));
    tb.classList.add('active');
    $('#tab-' + tb.dataset.tab).classList.add('active');
  });
});
document.querySelectorAll('.lang').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));

/* ---------- muat meta ---------- */
let META = null;
function refreshWindowsOptions() {
  if (!META) return;
  const winSel = $('#rdp-win');
  const prev = winSel.value;
  winSel.innerHTML = '';
  const groups = { desktop: LANG === 'en' ? 'Windows Desktop' : 'Windows Desktop', server: 'Windows Server' };
  const ramWord = LANG === 'en' ? 'GB RAM min' : 'min GB RAM';
  Object.entries(groups).forEach(([cat, gname]) => {
    const og = el('optgroup', { label: gname });
    META.windows.filter((w) => w.category === cat).forEach((w) => {
      og.appendChild(el('option', { value: w.id }, `${esc(w.name)} (${w.minRam} ${ramWord})`));
    });
    winSel.appendChild(og);
  });
  if (prev) winSel.value = prev;
  else { const def = META.windows.find((w) => /Server 2022/.test(w.name)); if (def) winSel.value = def.id; }
}

function renderMetaSelects() {
  if (!META) return;
  const fill = (sel, arr, val, label) => {
    const s = $(sel);
    const prev = s.value;
    s.innerHTML = '';
    arr.forEach((o) => s.appendChild(el('option', { value: o[val] }, esc(label(o)))));
    if (prev) s.value = prev;
  };
  const perMonth = LANG === 'en' ? '/mo' : '/bln';
  fill('#do-region', META.regions, 'slug', (o) => o.name);
  fill('#do-size', META.sizes, 'slug', (o) => `${o.name} · ~$${o.priceUsd}${perMonth}`);
  fill('#do-image', META.images, 'slug', (o) => o.name);
}

async function loadMeta() {
  const res = await fetch('/api/meta');
  META = await res.json();
  renderMetaSelects();
  refreshWindowsOptions();
}

/* ============ DIGITALOCEAN ============ */
function doToken() { return $('#do-token').value.trim(); }

$('#do-check').addEventListener('click', async () => {
  const box = $('#do-account');
  const token = doToken();
  if (!token) return (box.innerHTML = `<span class="err">${t('fillToken')}</span>`);
  box.textContent = t('checking');
  try {
    const r = await api('/api/do/validate', { token });
    box.className = 'status ok';
    box.innerHTML = t('tokenValid', esc(r.email || ''), esc(r.status || ''));
  } catch (err) {
    box.className = 'status';
    box.innerHTML = `<span class="err">✗ ${esc(localizeError(err.message))}</span>`;
  }
});

$('#do-create').addEventListener('click', async () => {
  const token = doToken();
  const out = $('#do-create-result');
  if (!token) return (out.innerHTML = `<span class="err">${t('fillToken')}</span>`);
  const btn = $('#do-create');
  btn.disabled = true; btn.textContent = t('creating');
  out.innerHTML = '';
  try {
    const r = await api('/api/do/create', {
      token,
      count: parseInt($('#do-count').value, 10) || 1,
      region: $('#do-region').value,
      size: $('#do-size').value,
      image: $('#do-image').value,
      namePrefix: $('#do-prefix').value,
      rootPassword: $('#do-rootpw').value
    });
    out.className = 'result ok';
    out.innerHTML = t('created', r.count, copyable(r.rootPassword), t('ipHint'));
    toast(t('createdToast', r.count));
    setTimeout(() => refreshDroplets(true), 1500);
  } catch (err) {
    out.className = 'result';
    out.innerHTML = `<span class="err">✗ ${esc(localizeError(err.message))}</span>`;
  } finally {
    btn.disabled = false; btn.textContent = t('doCreateBtn');
  }
});

let autoTimer = null;
async function refreshDroplets(auto) {
  const token = doToken();
  const list = $('#do-list');
  if (!token) return (list.innerHTML = `<span class="err">${t('fillToken')}</span>`);
  if (!auto) list.innerHTML = t('loading');
  try {
    const r = await api('/api/do/list', { token, onlyTag: $('#do-onlytag').checked ? 'rdpweb' : undefined });
    if (!r.droplets.length) { list.innerHTML = `<span class="hint">${t('noDroplets')}</span>`; stopAuto(); return; }
    list.innerHTML = '';
    let pending = 0;
    r.droplets.forEach((d) => {
      if (!d.ip || d.status !== 'active') pending++;
      const ipHtml = d.ip ? copyable(d.ip) : `<span class="badge new">${t('waitingIp')}</span>`;
      const badge = d.status === 'active' ? '<span class="badge active">active</span>' : `<span class="badge new">${esc(d.status)}</span>`;
      const row = el('div', { class: 'dp' });
      row.innerHTML =
        `<div class="info"><b>${esc(d.name)}</b> ${badge}<br>` +
        `IP: ${ipHtml}<br>` +
        `<span class="meta">${esc(d.region || '')} · ${esc(d.size || '')} · ${d.vcpus}vCPU/${Math.round(d.memoryMb / 1024)}GB/${d.diskGb}GB · id ${d.id}</span></div>`;
      const del = el('button', { class: 'danger' }, t('deleteBtn'));
      del.addEventListener('click', () => deleteDroplet(d, del));
      row.appendChild(del);
      list.appendChild(row);
    });
    if (pending > 0) { $('#do-auto').textContent = t('monitoring', pending); startAuto(); }
    else { $('#do-auto').textContent = ''; stopAuto(); }
  } catch (err) {
    list.innerHTML = `<span class="err">✗ ${esc(localizeError(err.message))}</span>`;
    stopAuto();
  }
}
function startAuto() { if (!autoTimer) autoTimer = setInterval(() => refreshDroplets(true), 8000); }
function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

async function deleteDroplet(d, btn) {
  if (!confirm(t('confirmDelete', d.name, d.id))) return;
  btn.disabled = true; btn.textContent = t('deleting');
  try {
    await api('/api/do/delete', { token: doToken(), id: d.id });
    toast(t('deletedToast', d.name));
    refreshDroplets(true);
  } catch (err) {
    toast(t('deleteFailed', localizeError(err.message)));
    btn.disabled = false; btn.textContent = t('deleteBtn');
  }
}
$('#do-refresh').addEventListener('click', () => refreshDroplets(false));
$('#do-onlytag').addEventListener('change', () => refreshDroplets(false));

/* ============ INSTALLER RDP ============ */
let rdpPoll = null;

/** Bangun teks progres sesuai bahasa dari data terstruktur status. */
function buildNote(s) {
  if (s.state === 'UNREACHABLE') return t('noteUnreachable');
  if (s.state === 'GONE') return t('noteGone');
  if (s.done) {
    if (s.success) return t('doneOk');
    if (s.exitCode === 91) return t('failDl');
    if (s.exitCode === 92) return t('failHtml');
    return t('failExit', s.exitCode);
  }
  if (s.state === 'RUNNING' && s.step === 'install') return t('noteInstall', s.logLines || 0);
  const map = { apt: 'noteApt', swap: 'noteSwap', unduh: 'noteUnduh', install: 'noteInstall' };
  if (s.step && map[s.step]) return s.step === 'install' ? t('noteInstall', s.logLines || 0) : t(map[s.step]);
  return t('notePrep');
}

$('#rdp-start').addEventListener('click', async () => {
  const host = $('#rdp-host').value.trim();
  const password = $('#rdp-pass').value;
  const windowsId = parseInt($('#rdp-win').value, 10);
  if (!host || !password) return toast(t('fillIpPass'));

  const btn = $('#rdp-start');
  const panel = $('#rdp-panel');
  btn.disabled = true; btn.textContent = t('connecting');
  panel.hidden = false;
  setBar(3, t('startConnecting'));
  $('#rdp-log').textContent = '';
  stopRdpPoll();

  const target = {
    host, password, windowsId,
    port: parseInt($('#rdp-port').value, 10) || undefined,
    username: $('#rdp-user').value.trim() || 'root',
    rdpPassword: $('#rdp-winpw').value.trim() || undefined
  };

  try {
    const r = await api('/api/rdp/start', target);
    setBar(6, t('launched', r.windows));
    toast(t('runningToast'));
    const winPw = target.rdpPassword || password;
    startRdpPoll({ host, port: r.port, username: r.username, password, windows: r.windows, winPw });
  } catch (err) {
    setBar(0, '✗ ' + localizeError(err.message), true);
  } finally {
    btn.disabled = false; btn.textContent = t('rdpStartBtn');
  }
});

function startRdpPoll(ctx) {
  const doPoll = async () => {
    try {
      const s = await api('/api/rdp/status', { host: ctx.host, port: ctx.port, username: ctx.username, password: ctx.password });
      if (s.logTail) $('#rdp-log').textContent = s.logTail;
      const note = buildNote(s);
      if (s.state === 'UNREACHABLE') { $('#rdp-note').textContent = '⏳ ' + note; return; }
      if (s.percent != null) setBar(s.percent, note);
      else $('#rdp-note').textContent = note;
      if (s.done) {
        stopRdpPoll();
        if (s.success) {
          setBar(100, t('doneOk'));
          $('#rdp-log').textContent = t('rdpConn', ctx.host, ctx.winPw, ctx.windows);
          toast(t('doneToast'));
        } else {
          setBar(100, note, true);
        }
      }
    } catch (err) {
      $('#rdp-note').textContent = t('retrying', localizeError(err.message));
    }
  };
  doPoll();
  rdpPoll = setInterval(doPoll, 10000);
}
function stopRdpPoll() { if (rdpPoll) { clearInterval(rdpPoll); rdpPoll = null; } }

function setBar(pct, note, isErr) {
  $('#rdp-bar').style.width = Math.max(0, Math.min(100, pct)) + '%';
  $('#rdp-bar').style.background = isErr ? 'var(--err)' : 'linear-gradient(90deg, var(--accent), #57b0ff)';
  if (note != null) $('#rdp-note').textContent = note;
}

/* ---------- init ---------- */
applyStaticI18n();
loadMeta().catch((e) => toast(t('loadFail', e.message)));
