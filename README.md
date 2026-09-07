# Installer DigitalOcean & RDP Windows (Web · Node.js · Vercel)

Website untuk:

1. **DigitalOcean via API** — buat **1–10 droplet** sekaligus dan **hapus droplet**, memakai Personal Access Token milik user (token tidak disimpan di server).
2. **Installer RDP Windows** — cukup masukkan **IP VPS + password root + pilih Windows**, lalu installer dijalankan di VPS lewat SSH.

Dibuat dengan Node.js (serverless functions) dan siap **deploy ke Vercel**.

---

## Cara kerja (penting)

Instalasi RDP butuh **40–90 menit**, jauh melebihi batas waktu fungsi serverless
(Vercel maks 60 detik). Karena itu prosesnya dibuat **detached**:

- `POST /api/rdp/start` menyambung SSH, mengunggah skrip installer, lalu
  **menyalakannya lepas dari sesi SSH** (`setsid nohup`) dan langsung balik dalam
  beberapa detik. Skrip berjalan sendiri di VPS.
- `POST /api/rdp/status` dipanggil frontend tiap ~10 detik: SSH singkat untuk
  membaca file status/log yang ditulis skrip, lalu menampilkan progres.

Membuat/menghapus droplet DigitalOcean hanyalah panggilan API cepat, jadi
langsung cocok untuk serverless.

RAM/CPU/disk untuk VM Windows **dideteksi otomatis di VPS** (sisa RAM dikurangi
1 GB untuk host, sisa disk dikurangi 5 GB), sehingga user cukup memasukkan
IP + password + versi Windows.

---

## Struktur

```
api/
  meta.js            GET daftar region/size/image/windows + flag sandi akses
  do/validate.js     POST cek token DigitalOcean
  do/create.js       POST buat 1-10 droplet
  do/list.js         POST daftar droplet (+ pantau IP)
  do/delete.js       POST hapus 1 droplet
  rdp/start.js       POST nyalakan installer RDP (detached)
  rdp/status.js      POST baca progres installer
lib/
  digitalocean.js    klien API DigitalOcean
  ssh.js             koneksi SSH (deteksi port, retry, exec)
  windows.js         daftar versi Windows
  rdpBootstrap.js    skrip installer detached + perintah polling
  http.js            helper JSON + gerbang akses
public/
  index.html, style.css, app.js   antarmuka web
vercel.json          maxDuration 60 detik untuk /api
```

---

## Deploy ke Vercel

### Lewat GitHub (disarankan)
1. Push folder ini ke sebuah repo GitHub.
2. Di Vercel: **Add New → Project → Import** repo tersebut.
3. Framework Preset: **Other** (biarkan default). Vercel otomatis mengenali
   `api/` sebagai serverless functions dan `public/` sebagai file statis.
4. **Deploy.**

### Lewat CLI
```bash
npm i -g vercel
cd web-do-rdp
vercel        # ikuti prompt
vercel --prod # untuk production
```

### Environment Variables (Settings → Environment Variables)
Semua **opsional**:

| Variabel          | Fungsi                                                                 |
|-------------------|------------------------------------------------------------------------|
| `ACCESS_PASSWORD` | **Sangat disarankan.** Jika di-set, halaman minta sandi ini sebelum bisa dipakai. Tanpa ini, siapa pun yang tahu URL bisa memakai alat. |
| `RDP_SCRIPT_BASE` | Base URL script installer RDP (default `https://reemote.biz.id`).      |

Setelah mengubah env var, **redeploy** agar berlaku.

---

## Menjalankan lokal
```bash
npm install
npm run dev      # = vercel dev (butuh Vercel CLI login)
```
> Menjalankan lokal butuh Vercel CLI karena rute `/api` dilayani oleh runtime Vercel.

---

## Catatan & keamanan

- **Token DigitalOcean & password VPS tidak disimpan** di server — dikirim per
  permintaan dari browser ke fungsi serverless, lalu dilupakan.
- **Selalu set `ACCESS_PASSWORD`.** Alat ini bisa membuat/menghapus droplet dan
  menjalankan perintah di VPS mana pun — jangan biarkan terbuka publik.
- Password root droplet yang dibuat lewat fitur DigitalOcean **ditampilkan sekali**
  setelah pembuatan (DigitalOcean tidak pernah mengembalikan password root lewat
  API — kami menyetelnya sendiri via cloud-init). Simpan baik-baik.
- Login RDP hasil instalasi: alamat `IP:3389`, user `Administrator`, password =
  password RDP yang kamu isi (default: sama dengan password VPS).
- `ssh2` kadang gagal meng-compile dependensi native opsional (`cpu-features`) di
  lingkungan build — ini **tidak masalah**, `ssh2` otomatis memakai implementasi
  JS murni.
