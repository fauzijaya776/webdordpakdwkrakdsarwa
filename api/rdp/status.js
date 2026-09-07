const ssh = require('../../lib/ssh');
const { POLL_COMMAND, STEP_INFO } = require('../../lib/rdpBootstrap');
const { handler, readJson, sendJson } = require('../../lib/http');

/**
 * POST { host, port, password, username? }
 *  -> { ok, state, step, percent, note, logLines, logTail, exitCode?, done, success? }
 *
 * SSH singkat: baca file status/step/log yang ditulis skrip installer.
 */
module.exports = handler('POST', async (req, res) => {
  const body = await readJson(req);
  const host = String(body.host || '').trim();
  const password = String(body.password || '');
  const username = String(body.username || 'root').trim() || 'root';
  const port = parseInt(body.port, 10) || 22;

  if (!host || !password) return sendJson(res, 400, { ok: false, error: 'INPUT:host & password wajib diisi.' });

  const target = { host, port, username, password };

  let result;
  try {
    result = await ssh.execOnce(target, POLL_COMMAND, { timeoutMs: 45000, percobaan: 2 });
  } catch (error) {
    // VPS sering tidak bisa dihubungi sesaat saat instalasi (reboot / firewall).
    // Bukan berarti gagal — laporkan sebagai "unreachable" agar frontend tetap polling.
    return sendJson(res, 200, {
      ok: true,
      state: 'UNREACHABLE',
      percent: null,
      note: 'VPS belum bisa dihubungi (normal saat instalasi/reboot). Mencoba lagi...',
      done: false,
      error: String(error.message || error)
    });
  }

  const out = result.stdout || '';
  const state = ssh.readField(out, 'STATE') || 'UNKNOWN';
  const stepRaw = ssh.readField(out, 'STEP');
  const logLines = parseInt(ssh.readField(out, 'LOG_LINES') || '0', 10);
  const logTail = (out.split('---LOGTAIL---')[1] || '').trim();

  const stepInfo = stepRaw && STEP_INFO[stepRaw];
  let percent = stepInfo ? stepInfo.percent : 0;
  let note = stepInfo ? stepInfo.note : 'Menyiapkan...';

  if (state === 'DONE') {
    const exitCode = parseInt(ssh.readField(out, 'INSTALL_EXIT') || '-1', 10);
    const success = exitCode === 0;
    return sendJson(res, 200, {
      ok: true,
      state: 'DONE',
      done: true,
      success,
      exitCode,
      percent: 100,
      note: success ? 'Instalasi selesai. Windows siap dipakai lewat RDP.' : describeExit(exitCode),
      logLines,
      logTail
    });
  }

  if (state === 'RUNNING' && stepRaw === 'install') {
    // Perkiraan progres berbasis jumlah baris log (installer menulis banyak baris).
    percent = Math.min(95, 25 + Math.floor(logLines / 12));
    note = `Instalasi Windows berjalan (${logLines} baris log)`;
  }

  if (state === 'GONE') {
    note = 'Proses tidak terlihat berjalan (mungkin VPS sedang reboot). Menunggu...';
  }

  sendJson(res, 200, {
    ok: true,
    state,
    step: stepRaw || null,
    percent,
    note,
    logLines,
    logTail,
    done: false
  });
});

function describeExit(code) {
  if (code === 91) return 'Gagal: VPS tidak bisa mengunduh script installer (cek koneksi keluar VPS).';
  if (code === 92) return 'Gagal: URL script membalas halaman web, bukan script.';
  return `Gagal: installer berhenti dengan kode ${code}. Lihat log terakhir.`;
}
