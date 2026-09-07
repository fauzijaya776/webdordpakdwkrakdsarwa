const { deleteDroplet, describeError } = require('../../lib/digitalocean');
const { handler, readJson, sendJson } = require('../../lib/http');

/**
 * POST { token, id } -> { ok, id }
 * Menghapus satu droplet. (POST, bukan DELETE, agar body token mudah dikirim
 * dan tidak nyangkut di log URL.)
 */
module.exports = handler('POST', async (req, res) => {
  const body = await readJson(req);
  const token = String(body.token || '').trim();
  const id = parseInt(body.id, 10);
  if (!token) return sendJson(res, 400, { ok: false, error: 'INPUT:Token wajib diisi.' });
  if (!id) return sendJson(res, 400, { ok: false, error: 'INPUT:ID droplet tidak valid.' });
  try {
    const result = await deleteDroplet(token, id);
    sendJson(res, 200, result);
  } catch (error) {
    sendJson(res, 400, { ok: false, error: describeError(error) });
  }
});
