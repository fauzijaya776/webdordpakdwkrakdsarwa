const { validateToken } = require('../../lib/digitalocean');
const { handler, readJson, sendJson } = require('../../lib/http');

// POST { token } -> { ok, email, status }
module.exports = handler('POST', async (req, res) => {
  const { token } = await readJson(req);
  if (!token) return sendJson(res, 400, { ok: false, error: 'INPUT:Token DigitalOcean wajib diisi.' });
  const result = await validateToken(String(token).trim());
  if (!result.ok) return sendJson(res, 400, result);
  sendJson(res, 200, result);
});
