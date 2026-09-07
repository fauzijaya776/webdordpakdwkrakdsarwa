/**
 * Klien API DigitalOcean untuk website installer.
 *
 * Buyer/user memasukkan Personal Access Token miliknya sendiri lewat halaman
 * web. Droplet dibuat/dihapus di akun user itu — server ini tidak menyimpan
 * token. Referensi: https://docs.digitalocean.com/reference/api/reference/
 */
const axios = require('axios');

const API_BASE = 'https://api.digitalocean.com/v2';

/** Region, diurut mendekati Indonesia lebih dulu (latency terbaik). */
const DO_REGIONS = [
  { slug: 'sgp1', name: '🇸🇬 Singapore' },
  { slug: 'blr1', name: '🇮🇳 Bangalore' },
  { slug: 'syd1', name: '🇦🇺 Sydney' },
  { slug: 'fra1', name: '🇩🇪 Frankfurt' },
  { slug: 'ams3', name: '🇳🇱 Amsterdam' },
  { slug: 'lon1', name: '🇬🇧 London' },
  { slug: 'nyc1', name: '🇺🇸 New York 1' },
  { slug: 'nyc3', name: '🇺🇸 New York 3' },
  { slug: 'sfo3', name: '🇺🇸 San Francisco' },
  { slug: 'tor1', name: '🇨🇦 Toronto' }
];

/** Ukuran droplet Basic. `ram` (GB) untuk menandai kecocokan RDP; `priceUsd` perkiraan/bulan. */
const DO_SIZES = [
  { slug: 's-1vcpu-512mb-10gb', name: '1 vCPU · 512MB · 10GB SSD', ram: 0.5, priceUsd: 4 },
  { slug: 's-1vcpu-1gb',        name: '1 vCPU · 1GB · 25GB SSD',   ram: 1,   priceUsd: 6 },
  { slug: 's-1vcpu-2gb',        name: '1 vCPU · 2GB · 50GB SSD',   ram: 2,   priceUsd: 12 },
  { slug: 's-2vcpu-2gb',        name: '2 vCPU · 2GB · 60GB SSD',   ram: 2,   priceUsd: 18 },
  { slug: 's-2vcpu-4gb',        name: '2 vCPU · 4GB · 80GB SSD',   ram: 4,   priceUsd: 24 },
  { slug: 's-4vcpu-8gb',        name: '4 vCPU · 8GB · 160GB SSD',  ram: 8,   priceUsd: 48 }
];

/** Image OS. Default Ubuntu 22.04 — paling cocok kalau nanti dipasang RDP. */
const DO_IMAGES = [
  { slug: 'ubuntu-22-04-x64', name: 'Ubuntu 22.04 LTS' },
  { slug: 'ubuntu-24-04-x64', name: 'Ubuntu 24.04 LTS' },
  { slug: 'ubuntu-20-04-x64', name: 'Ubuntu 20.04 LTS' },
  { slug: 'debian-12-x64',    name: 'Debian 12' }
];

const findRegion = (slug) => DO_REGIONS.find((r) => r.slug === slug) || null;
const findSize = (slug) => DO_SIZES.find((s) => s.slug === slug) || null;
const findImage = (slug) => DO_IMAGES.find((i) => i.slug === slug) || null;

function client(token) {
  return axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    timeout: 30000
  });
}

/** Ubah error axios/DigitalOcean jadi pesan berkode "KODE:penjelasan". */
function describeError(error) {
  if (error && error.response) {
    const status = error.response.status;
    const data = error.response.data || {};
    const msg = data.message || data.id || '';
    if (status === 401) return 'DO_AUTH:Token DigitalOcean tidak valid atau sudah dicabut.';
    if (status === 403) return 'DO_FORBIDDEN:Token tidak punya izin menulis (butuh scope "write"), atau akun belum diverifikasi.';
    if (status === 404) return 'DO_NOTFOUND:Resource tidak ditemukan di DigitalOcean.';
    if (status === 422) return `DO_INVALID:${msg || 'Parameter droplet ditolak DigitalOcean.'}`;
    if (status === 429) return 'DO_RATELIMIT:Terlalu banyak permintaan ke DigitalOcean. Tunggu sebentar lalu coba lagi.';
    return `DO_HTTP_${status}:${msg || 'Permintaan ke DigitalOcean gagal.'}`;
  }
  if (error && error.code === 'ECONNABORTED') return 'DO_TIMEOUT:DigitalOcean tidak merespons tepat waktu.';
  return `DO_NETWORK:${(error && error.message) || 'Gagal menghubungi DigitalOcean.'}`;
}

/** Validasi token dengan memanggil endpoint akun. */
async function validateToken(token) {
  try {
    const res = await client(token).get('/account');
    const acc = (res.data && res.data.account) || {};
    return { ok: true, email: acc.email, status: acc.status };
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }
}

/**
 * Password root acak yang memenuhi aturan umum VPS: ada simbol, huruf besar,
 * huruf kecil, angka, dan diakhiri huruf. Karakter aman untuk YAML cloud-init.
 */
function genPassword(length = 16) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#%^&*_-+=.?';
  const letters = upper + lower;
  const all = upper + lower + digits + symbols;
  const pick = (set) => set[Math.floor(Math.random() * set.length)];

  const body = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  const bodyLen = Math.max(4, length - 1);
  while (body.length < bodyLen) body.push(pick(all));
  const shuffled = body.sort(() => Math.random() - 0.5).join('');
  return shuffled + pick(letters);
}

/** cloud-init untuk memasang password root yang KITA tentukan + izinkan login password. */
function buildCloudInit(rootPassword) {
  return [
    '#cloud-config',
    'disable_root: false',
    'ssh_pwauth: true',
    'chpasswd:',
    '  expire: false',
    '  list: |',
    `    root:${rootPassword}`,
    'runcmd:',
    "  - sed -ri 's/^#?PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config",
    "  - sed -ri 's/^#?PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config",
    '  - bash -c \'for f in /etc/ssh/sshd_config.d/*.conf; do [ -e "$f" ] && sed -ri "s/^#?PasswordAuthentication.*/PasswordAuthentication yes/; s/^#?PermitRootLogin.*/PermitRootLogin yes/" "$f"; done\'',
    '  - bash -c \'systemctl restart ssh 2>/dev/null || systemctl restart sshd 2>/dev/null || service ssh restart 2>/dev/null || true\'',
    ''
  ].join('\n');
}

/**
 * Buat 1-10 droplet sekaligus. Selalu memakai field `names` (array) agar
 * satu panggilan API cukup untuk banyak droplet.
 * @returns {Promise<Array<{id:number,name:string,status:string}>>}
 */
async function createDroplets({ token, names, region, size, image, rootPassword }) {
  const body = {
    names,
    region,
    size,
    image,
    backups: false,
    ipv6: true,
    monitoring: false,
    user_data: buildCloudInit(rootPassword),
    tags: ['rdpweb']
  };
  const res = await client(token).post('/droplets', body);
  const data = res.data || {};
  const droplets = data.droplets || (data.droplet ? [data.droplet] : []);
  return droplets.map((d) => ({ id: d.id, name: d.name, status: d.status }));
}

function publicIpv4(droplet) {
  const v4 = (droplet && droplet.networks && droplet.networks.v4) || [];
  const pub = v4.find((n) => n.type === 'public');
  return pub ? pub.ip_address : null;
}

/** Ambil detail satu droplet. */
async function getDroplet(token, id) {
  const res = await client(token).get(`/droplets/${id}`);
  return (res.data && res.data.droplet) || null;
}

/**
 * Daftar semua droplet di akun (opsional difilter tag). Mengembalikan ringkasan
 * yang aman ditampilkan di UI.
 */
async function listDroplets(token, { onlyTag } = {}) {
  const params = { per_page: 200 };
  if (onlyTag) params.tag_name = onlyTag;
  const res = await client(token).get('/droplets', { params });
  const droplets = (res.data && res.data.droplets) || [];
  return droplets.map((d) => ({
    id: d.id,
    name: d.name,
    status: d.status,
    ip: publicIpv4(d),
    region: d.region ? d.region.slug : null,
    size: d.size_slug,
    memoryMb: d.memory,
    vcpus: d.vcpus,
    diskGb: d.disk,
    createdAt: d.created_at,
    tags: d.tags || []
  }));
}

/** Hapus satu droplet. */
async function deleteDroplet(token, id) {
  await client(token).delete(`/droplets/${id}`);
  return { ok: true, id: Number(id) };
}

module.exports = {
  DO_REGIONS,
  DO_SIZES,
  DO_IMAGES,
  findRegion,
  findSize,
  findImage,
  validateToken,
  createDroplets,
  getDroplet,
  listDroplets,
  deleteDroplet,
  publicIpv4,
  buildCloudInit,
  genPassword,
  describeError
};
