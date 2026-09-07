const {
  createDroplets, findRegion, findSize, findImage, genPassword, describeError
} = require('../../lib/digitalocean');
const { handler, readJson, sendJson } = require('../../lib/http');

/**
 * POST { token, count(1-10), region, size, image, namePrefix?, rootPassword? }
 * -> { ok, droplets:[{id,name,status}], rootPassword, region, size, image }
 *
 * Hanya MEMBUAT droplet lalu balik cepat (tidak menunggu IP). Frontend
 * memantau IP lewat /api/do/list. Password root diseragamkan untuk 1 batch
 * dan dikembalikan ke user (DigitalOcean tidak pernah memberi password root).
 */
module.exports = handler('POST', async (req, res) => {
  const body = await readJson(req);
  const token = String(body.token || '').trim();
  const count = Math.max(1, Math.min(10, parseInt(body.count, 10) || 1));
  const region = String(body.region || '');
  const size = String(body.size || '');
  const image = String(body.image || 'ubuntu-22-04-x64');
  const prefix = (String(body.namePrefix || 'rdp').toLowerCase().replace(/[^a-z0-9-]/g, '') || 'rdp').slice(0, 20);

  if (!token) return sendJson(res, 400, { ok: false, error: 'INPUT:Token wajib diisi.' });
  if (!findRegion(region)) return sendJson(res, 400, { ok: false, error: 'INPUT:Region tidak dikenal.' });
  if (!findSize(size)) return sendJson(res, 400, { ok: false, error: 'INPUT:Ukuran droplet tidak dikenal.' });
  if (!findImage(image)) return sendJson(res, 400, { ok: false, error: 'INPUT:Image OS tidak dikenal.' });

  const rootPassword = String(body.rootPassword || '').trim() || genPassword(16);

  const stamp = Date.now().toString(36).slice(-4);
  const names = Array.from({ length: count }, (_, i) => `${prefix}-${stamp}-${i + 1}`);

  try {
    const droplets = await createDroplets({ token, names, region, size, image, rootPassword });
    sendJson(res, 200, {
      ok: true,
      droplets,
      rootPassword,
      region,
      size,
      image,
      count: droplets.length
    });
  } catch (error) {
    sendJson(res, 400, { ok: false, error: describeError(error) });
  }
});
