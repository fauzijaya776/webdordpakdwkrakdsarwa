/**
 * Daftar versi Windows yang bisa dipasang installer RDP.
 * minRam / minDisk = kebutuhan minimal (GB) agar instalasi realistis berhasil.
 * Angka `id` HARUS sama dengan pilihan menu di script installer RDP.
 */
const WINDOWS_VERSIONS = [
  // Windows Desktop
  { id: 1,  name: 'Windows 11 Pro',           category: 'desktop', minRam: 4, minDisk: 25 },
  { id: 2,  name: 'Windows 11 Enterprise',    category: 'desktop', minRam: 4, minDisk: 25 },
  { id: 17, name: 'Windows 11 LTSC',          category: 'desktop', minRam: 4, minDisk: 25 },
  { id: 3,  name: 'Windows 10 Pro',           category: 'desktop', minRam: 2, minDisk: 20 },
  { id: 4,  name: 'Windows 10 LTSC',          category: 'desktop', minRam: 2, minDisk: 20 },
  { id: 5,  name: 'Windows 10 Enterprise',    category: 'desktop', minRam: 2, minDisk: 20 },
  { id: 6,  name: 'Windows 8.1 Pro',          category: 'desktop', minRam: 2, minDisk: 16 },
  { id: 7,  name: 'Windows 8.1 Enterprise',   category: 'desktop', minRam: 2, minDisk: 16 },
  { id: 8,  name: 'Windows 7 Enterprise',     category: 'desktop', minRam: 2, minDisk: 16 },
  { id: 9,  name: 'Windows Vista Enterprise', category: 'desktop', minRam: 1, minDisk: 15 },
  { id: 10, name: 'Windows XP Professional',  category: 'desktop', minRam: 1, minDisk: 10 },

  // Windows Server
  { id: 16, name: 'Windows Server 2025',      category: 'server',  minRam: 4, minDisk: 25 },
  { id: 11, name: 'Windows Server 2022',      category: 'server',  minRam: 4, minDisk: 25 },
  { id: 12, name: 'Windows Server 2019',      category: 'server',  minRam: 2, minDisk: 20 },
  { id: 13, name: 'Windows Server 2016',      category: 'server',  minRam: 2, minDisk: 20 },
  { id: 14, name: 'Windows Server 2012',      category: 'server',  minRam: 2, minDisk: 16 },
  { id: 15, name: 'Windows Server 2008',      category: 'server',  minRam: 1, minDisk: 15 },
  { id: 18, name: 'Windows Server 2003',      category: 'server',  minRam: 1, minDisk: 10 }
];

function findVersion(id) {
  return WINDOWS_VERSIONS.find((v) => v.id === Number(id)) || null;
}

module.exports = { WINDOWS_VERSIONS, findVersion };
