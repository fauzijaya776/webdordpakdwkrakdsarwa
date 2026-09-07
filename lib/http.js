/**
 * Helper kecil untuk fungsi serverless: baca body JSON, kirim JSON, dan
 * gerbang akses opsional (ACCESS_PASSWORD).
 */

/** Baca & parse body JSON dari request Node (Vercel tidak selalu mengisi req.body). */
function readJson(req) {
  return new Promise((resolve) => {
    const b = req.body;
    // Vercel sudah mem-parse body JSON jadi objek.
    if (b && typeof b === 'object') return resolve(b);
    // Kadang body datang sebagai string mentah.
    if (typeof b === 'string' && b.length) {
      try { return resolve(JSON.parse(b)); } catch (_) { return resolve({}); }
    }
    // Selain itu, baca dari stream.
    let raw = '';
    let done = false;
    const finish = (v) => { if (done) return; done = true; resolve(v); };
    req.on('data', (c) => { raw += c; if (raw.length > 1e6) req.destroy(); });
    req.on('end', () => { if (!raw) return finish({}); try { finish(JSON.parse(raw)); } catch (_) { finish({}); } });
    req.on('error', () => finish({}));
  });
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

/**
 * Kalau ACCESS_PASSWORD di-set, minta header x-access-password cocok.
 * Return true kalau boleh lanjut; kalau tidak, sudah mengirim 401.
 */
function requireAccess(req, res) {
  const expected = process.env.ACCESS_PASSWORD;
  if (!expected) return true; // tidak diaktifkan
  const given = req.headers['x-access-password'];
  if (given && String(given) === String(expected)) return true;
  sendJson(res, 401, { ok: false, error: 'UNAUTHORIZED:Kata sandi akses salah atau belum dimasukkan.' });
  return false;
}

/** Bungkus handler: hanya izinkan method tertentu, tangani error jadi JSON rapi. */
function handler(methods, fn) {
  const allowed = Array.isArray(methods) ? methods : [methods];
  return async (req, res) => {
    if (!allowed.includes(req.method)) {
      return sendJson(res, 405, { ok: false, error: `METHOD:Hanya ${allowed.join('/')} yang diterima.` });
    }
    if (!requireAccess(req, res)) return;
    try {
      await fn(req, res);
    } catch (err) {
      const msg = String((err && err.message) || err || 'Kesalahan tak terduga');
      sendJson(res, 500, { ok: false, error: msg });
    }
  };
}

module.exports = { readJson, sendJson, requireAccess, handler };
