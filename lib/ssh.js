const net = require('net');
const { Client } = require('ssh2');

/**
 * Port SSH yang paling umum dipakai, diurut dari yang paling sering.
 * Dipakai saat user hanya memasukkan IP tanpa port.
 */
const COMMON_SSH_PORTS = [22, 2222, 22022, 2022, 2200, 22222, 8022, 222, 50022];

const BANNER_TIMEOUT_MS = 5000;
const READY_TIMEOUT_MS = 30000;
const KEEPALIVE_INTERVAL_MS = 15000;
const KEEPALIVE_COUNT_MAX = 20;

/** Cek satu port: buka koneksi TCP dan tunggu banner "SSH-..". */
function probeSSHPort(host, port, timeout = BANNER_TIMEOUT_MS) {
  return new Promise((resolve) => {
    let settled = false;
    const done = (result) => {
      if (settled) return;
      settled = true;
      try { socket.end(); } catch (_) {}
      setTimeout(() => { try { socket.destroy(); } catch (_) {} }, 200);
      resolve(result);
    };

    const socket = net.createConnection({ host, port });
    socket.setTimeout(timeout);

    socket.on('data', (chunk) => {
      const adalahSSH = chunk.toString('utf8', 0, 32).startsWith('SSH-');
      if (adalahSSH) {
        try { socket.write('SSH-2.0-RDPWeb_PortCheck\r\n'); } catch (_) {}
      }
      done(adalahSSH);
    });

    socket.on('timeout', () => done(false));
    socket.on('error', () => done(false));
    socket.on('close', () => done(false));
  });
}

/** Cek apakah sebuah port TCP terbuka (tanpa memeriksa banner). */
function probeTcpPort(host, port, timeout = 5000) {
  return new Promise((resolve) => {
    let settled = false;
    const done = (result) => {
      if (settled) return;
      settled = true;
      try { socket.destroy(); } catch (_) {}
      resolve(result);
    };

    const socket = net.createConnection({ host, port });
    socket.setTimeout(timeout);
    socket.on('connect', () => done(true));
    socket.on('timeout', () => done(false));
    socket.on('error', () => done(false));
  });
}

/**
 * Cari port SSH yang aktif pada sebuah host.
 * Port 22 dicoba lebih dulu; sisanya diprobe pelan agar tidak dianggap pemindai port.
 */
async function detectSSHPort(host, extraPorts = []) {
  const candidates = [...new Set([...extraPorts, ...COMMON_SSH_PORTS])];

  if (candidates.includes(22) && (await probeSSHPort(host, 22))) {
    return 22;
  }

  const rest = candidates.filter((p) => p !== 22);
  const UKURAN_BATCH = 2;

  for (let i = 0; i < rest.length; i += UKURAN_BATCH) {
    const batch = rest.slice(i, i + UKURAN_BATCH);
    const hasil = await Promise.all(
      batch.map(async (port) => ({ port, open: await probeSSHPort(host, port) }))
    );
    for (const port of batch) {
      const hit = hasil.find((r) => r.port === port && r.open);
      if (hit) return port;
    }
    if (i + UKURAN_BATCH < rest.length) {
      await new Promise((r) => setTimeout(r, 150));
    }
  }
  return null;
}

const ALGORITMA_LAWAS = {
  serverHostKey: [
    'ssh-ed25519', 'ecdsa-sha2-nistp256', 'ecdsa-sha2-nistp384', 'ecdsa-sha2-nistp521',
    'rsa-sha2-512', 'rsa-sha2-256', 'ssh-rsa', 'ssh-dss'
  ],
  kex: [
    'curve25519-sha256', 'curve25519-sha256@libssh.org',
    'ecdh-sha2-nistp256', 'ecdh-sha2-nistp384', 'ecdh-sha2-nistp521',
    'diffie-hellman-group-exchange-sha256', 'diffie-hellman-group14-sha256',
    'diffie-hellman-group14-sha1', 'diffie-hellman-group1-sha1'
  ],
  cipher: [
    'aes128-gcm@openssh.com', 'aes256-gcm@openssh.com',
    'aes128-ctr', 'aes192-ctr', 'aes256-ctr', 'aes256-cbc', 'aes128-cbc', '3des-cbc'
  ]
};

function connect({ host, port = 22, username = 'root', password, readyTimeout = READY_TIMEOUT_MS, lawas = false }) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let settled = false;

    const fail = (err) => {
      if (settled) return;
      settled = true;
      try { conn.end(); } catch (_) {}
      reject(err);
    };

    conn.on('ready', () => {
      if (settled) return;
      settled = true;
      resolve(conn);
    });

    conn.on('error', (err) => fail(normalizeSSHError(err, port)));
    conn.on('close', () => fail(new Error('SSH_CLOSED_BEFORE_READY')));

    try {
      conn.connect({
        host,
        port,
        username,
        password,
        readyTimeout,
        keepaliveInterval: KEEPALIVE_INTERVAL_MS,
        keepaliveCountMax: KEEPALIVE_COUNT_MAX,
        tryKeyboard: false,
        ...(lawas ? { algorithms: ALGORITMA_LAWAS } : {})
      });
    } catch (err) {
      fail(err);
    }
  });
}

function normalizeSSHError(err, port) {
  const code = err && err.code;
  const msg = String((err && err.message) || err || '');

  if (code === 'ECONNREFUSED') return new Error(`SSH_REFUSED:Port ${port} menolak koneksi`);
  if (code === 'ETIMEDOUT' || code === 'ENETUNREACH' || code === 'EHOSTUNREACH' || /Timed out/i.test(msg)) {
    return new Error(`SSH_TIMEOUT:Tidak ada balasan dari VPS di port ${port}`);
  }
  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') return new Error('SSH_DNS:IP/host tidak ditemukan');
  if (/All configured authentication methods failed|Authentication failure/i.test(msg)) {
    return new Error('SSH_AUTH:Username atau password salah');
  }
  if (code === 'ECONNRESET' || code === 'EPIPE' || /ECONNRESET|socket hang up/i.test(msg)) {
    return new Error(`SSH_RESET:Koneksi diputus paksa oleh VPS di port ${port}`);
  }
  if (/Handshake failed|no matching|KEY_EXCHANGE_FAILED/i.test(msg)) {
    return new Error(`SSH_HANDSHAKE:VPS dan server tidak sepakat soal algoritma enkripsi (${msg})`);
  }
  if (msg === 'SSH_CLOSED_BEFORE_READY') {
    return new Error(`SSH_RESET:VPS menutup koneksi sebelum siap (port ${port})`);
  }
  return new Error(`SSH_ERROR:${msg || 'Gagal terhubung'}`);
}

function bolehDicobaLagi(error) {
  const m = String((error && error.message) || '');
  return /^SSH_RESET|^SSH_TIMEOUT|^SSH_HANDSHAKE|^SSH_ERROR/.test(m);
}

async function connectWithRetry(target, { percobaan = 3, onLog } = {}) {
  let terakhir;
  for (let ke = 1; ke <= percobaan; ke++) {
    try {
      const lawas = ke === percobaan && percobaan > 1;
      return await connect({ ...target, lawas });
    } catch (error) {
      terakhir = error;
      if (!bolehDicobaLagi(error)) throw error;
      if (ke === percobaan) break;
      const jeda = 2000 * ke;
      if (onLog) onLog(`Koneksi ke VPS gagal (${error.message}). Coba lagi ${ke + 1}/${percobaan} dalam ${jeda / 1000}s...`);
      await new Promise((r) => setTimeout(r, jeda));
    }
  }
  throw terakhir;
}

function exec(conn, command, { onLog, timeoutMs = 0 } = {}) {
  return new Promise((resolve, reject) => {
    conn.exec(command, { pty: false }, (err, stream) => {
      if (err) return reject(err);

      let stdout = '';
      let stderr = '';
      let finished = false;
      let timer = null;

      const finish = (payload) => {
        if (finished) return;
        finished = true;
        if (timer) clearTimeout(timer);
        resolve(payload);
      };

      if (timeoutMs > 0) {
        timer = setTimeout(() => {
          if (finished) return;
          finished = true;
          try { stream.close(); } catch (_) {}
          reject(new Error('EXEC_TIMEOUT'));
        }, timeoutMs);
      }

      stream.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        if (stdout.length > 200000) stdout = stdout.slice(-100000);
        if (onLog) onLog(text);
      });

      stream.stderr.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        if (stderr.length > 100000) stderr = stderr.slice(-50000);
        if (onLog) onLog(text);
      });

      stream.on('close', (code, signal) => {
        finish({ code: typeof code === 'number' ? code : null, signal: signal || null, stdout, stderr });
      });

      stream.on('error', (streamErr) => {
        if (finished) return;
        finished = true;
        if (timer) clearTimeout(timer);
        reject(streamErr);
      });
    });
  });
}

async function execOnce(target, command, options = {}) {
  const conn = await connectWithRetry(target, { percobaan: options.percobaan || 2 });
  try {
    return await exec(conn, command, options);
  } finally {
    try { conn.end(); } catch (_) {}
  }
}

function readField(output, key) {
  const match = String(output || '').match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : null;
}

module.exports = {
  COMMON_SSH_PORTS,
  connectWithRetry,
  bolehDicobaLagi,
  probeSSHPort,
  probeTcpPort,
  detectSSHPort,
  connect,
  exec,
  execOnce,
  readField,
  normalizeSSHError
};
