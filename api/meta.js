const { DO_REGIONS, DO_SIZES, DO_IMAGES } = require('../lib/digitalocean');
const { WINDOWS_VERSIONS } = require('../lib/windows');
const { sendJson } = require('../lib/http');

// Publik: hanya daftar pilihan (tidak sensitif) + apakah halaman butuh sandi akses.
module.exports = async (req, res) => {
  if (req.method !== 'GET') return sendJson(res, 405, { ok: false, error: 'METHOD' });
  sendJson(res, 200, {
    ok: true,
    accessRequired: false,
    regions: DO_REGIONS,
    sizes: DO_SIZES,
    images: DO_IMAGES,
    windows: WINDOWS_VERSIONS
  });
};
