const ssh = require('../../lib/ssh');
const { findVersion } = require('../../lib/windows');
const { buildLaunchCommand } = require('../../lib/rdpBootstrap');
const { handler, readJson, sendJson } = require('../../lib/http');

/**
 * POST { host, password, windowsId, port?, username?, rdpPassword? }
 *  -> { ok, host, port, username, windows, launch }
 *
 * Menyambung ke VPS, mengunggah installer, dan MENYALAKANNYA secara detached.
 * Balik cepat (beberapa detik). Progres dipantau lewat /api/rdp/status.
 *
 * `password`    = password root VPS (untuk login SSH).
 * `rdpPassword` = password login Windows/RDP nanti. Default: sama dengan password VPS.
 */
module.exports = handler('POST', async (req, res) => {
  const body = await readJson(req);
  const host = String(body.host || '').trim();
  const password = String(body.password || '');
  const username = String(body.username || 'root').trim() || 'root';
  const windowsId = parseInt(body.windowsId, 10);
  const rdpPassword = String(body.rdpPassword || '').trim() || password;
  let port = parseInt(body.port, 10) || 0;

  if (!host) return sendJson(res, 400, { ok: false, error: 'INPUT:IP/host VPS wajib diisi.' });
  if (!password) return sendJson(res, 400, { ok: false, error: 'INPUT:Password VPS wajib diisi.' });
  const win = findVersion(windowsId);
  if (!win) return sendJson(res, 400, { ok: false, error: 'INPUT:Versi Windows tidak dikenal.' });

  // Deteksi port SSH kalau tidak diberikan.
  if (!port) {
    port = await ssh.detectSSHPort(host);
    if (!port) return sendJson(res, 400, { ok: false, error: 'SSH_NOPORT:Tidak menemukan port SSH terbuka di VPS. Pastikan IP benar dan VPS menyala.' });
  }

  const target = { host, port, username, password };

  // Sambung dulu (retry) — sekaligus memverifikasi IP/password.
  let conn;
  try {
    conn = await ssh.connectWithRetry(target, { percobaan: 3 });
  } catch (error) {
    return sendJson(res, 400, { ok: false, error: String(error.message || error) });
  }

  try {
    const cmd = buildLaunchCommand({ windowsId: win.id, rdpPassword });
    const result = await ssh.exec(conn, cmd, { timeoutMs: 60000 });
    const launch = ssh.readField(result.stdout, 'LAUNCH');
    if (launch === 'UNKNOWN') {
      return sendJson(res, 500, { ok: false, error: 'LAUNCH_FAILED:Installer gagal dinyalakan di VPS.', raw: result.stdout.slice(-500) });
    }
    sendJson(res, 200, {
      ok: true,
      host,
      port,
      username,
      windows: win.name,
      windowsId: win.id,
      launch: launch || 'OK',
      message: 'Installer dinyalakan. Proses berjalan di VPS ~40-90 menit. Pantau lewat status.'
    });
  } catch (error) {
    sendJson(res, 500, { ok: false, error: String(error.message || error) });
  } finally {
    try { conn.end(); } catch (_) {}
  }
});
