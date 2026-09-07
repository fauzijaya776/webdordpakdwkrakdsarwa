const { listDroplets, describeError } = require('../../lib/digitalocean');
const { handler, readJson, sendJson } = require('../../lib/http');

/**
 * POST { token, onlyTag? } -> { ok, droplets:[...] }
 * Dipakai untuk menampilkan daftar droplet + memantau IP droplet yang baru dibuat.
 * (POST agar token tidak nyangkut di log URL.)
 */
module.exports = handler('POST', async (req, res) => {
  const body = await readJson(req);
  const token = String(body.token || '').trim();
  if (!token) return sendJson(res, 400, { ok: false, error: 'INPUT:Token wajib diisi.' });
  try {
    const droplets = await listDroplets(token, { onlyTag: body.onlyTag || undefined });
    sendJson(res, 200, { ok: true, droplets });
  } catch (error) {
    sendJson(res, 400, { ok: false, error: describeError(error) });
  }
});
