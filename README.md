<div align="center">
  <img src="assets/logo.png" alt="MangNotch Logo" width="96" height="96" style="border-radius: 22px;" />
  <h1>MangNotch 「 マン・ノッチ 」</h1>
  <p><strong>Interactive Living Notch &amp; Desktop Companion for Windows</strong><br/>Dirancang dengan estetika <em>MangNime Dusk</em> menggunakan Rust, Tauri v2, dan Win32 Native API.</p>

  <p>
    <img src="https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-0078D6?style=for-the-badge&logo=windows" alt="Windows" />
    <img src="https://img.shields.io/badge/Backend-Rust-DEA584?style=for-the-badge&logo=rust" alt="Rust" />
    <img src="https://img.shields.io/badge/Framework-Tauri%20v2-FFC131?style=for-the-badge&logo=tauri" alt="Tauri v2" />
    <img src="https://img.shields.io/badge/License-MIT-FFB7C5?style=for-the-badge" alt="License" />
  </p>
</div>

---

## ✨ Tentang MangNotch

**MangNotch** mengubah area tepi atas layar Windows menjadi ruang interaktif yang hidup tanpa menghalangi alur kerjamu. Berjalan sangat ringan di *background* dan dikendalikan penuh lewat *System Tray*, MangNotch menyatukan kontrol musik, lirik *real-time*, *file shelf* instan, dan asisten produktivitas dalam satu *living island* berestetika **MangNime Dusk**.

---

## 🚀 Fitur Utama

- 🎵 **Windows GSMTC Media & Synced Lyrics (LRCLIB):**
  Mendeteksi lagu yang sedang diputar di Spotify, Browser (YouTube/Web), atau pemutar media Windows secara otomatis. Dilengkapi ekstraksi warna sampul album dinamis untuk efek gradasi latar belakang dan lirik berjalan *real-time*.
- 🎶 **Compact Idle Lyrics Bar:**
  Saat membuka mode lirik dan menggeser kursor keluar dari Notch, tampilan otomatis menyusut menjadi 1 baris lirik ringkas dengan sampul & judul lagu di sisi kiri.
- 🧠 **Smart Proximity Auto-Shrink:**
  Memindai posisi tab browser (*Chrome, Edge, Brave, Firefox*) dan jendela aktif menggunakan `WM_NCHITTEST`. Jika deretan tab atau tombol `+` menyentuh area Notch, Notch otomatis menyusut ke garis tipis **6px** sehingga tab di bawahnya tetap bebas diklik.
- 📂 **Native OLE File Shelf (Drag-In & Drag-Out):**
  Tarik file dari Windows Explorer ke dalam Shelf untuk disimpan sementara, klik untuk membuka langsung tanpa *security warning popup*, atau tarik keluar (*drag-out*) langsung ke WhatsApp, Discord, dan aplikasi lainnya.
- 🍅 **Pomodoro Timer & Water Wave Tank:**
  Dilengkapi pengatur waktu fokus/istirahat, visualisasi tangki air bergelombang, dan synthesizer suara *chime* lembut berbasis Web Audio API (dengan opsi toggle On/Off terpisah).
- 🐾 **3 Karakter Maskot & Tema Warna:**
  Pilih antara **MangCat (Cyber-Neko)**, **PitVisor (Telemetry HUD)**, atau **Kitsune Spirit Orbs** dengan 5 palet cahaya (*MangNime Dusk, Matcha Emerald, Racing Red, Sunset, Ice Blue*).
- 🎮 **True Fullscreen Auto-Hide & Headless Tray Startup:**
  Hilang 100% (`SW_HIDE`) saat bermain game atau menonton video *fullscreen* (`F11`), serta berjalan senyap saat *startup* tanpa memunculkan jendela pengaturan sebelum dipanggil lewat *System Tray*.

---

## 🛠️ Cara Instalasi & Menjalankan dari Source Code

### 1. Unduh Installer Siap Pakai
Unduh file installer `.exe` terbaru melalui halaman [**GitHub Releases**](https://github.com/MANG-CODER/MangNotch/releases).

### 2. Build Sendiri dari Source Code
Pastikan di perangkatmu sudah terinstal **Node.js** dan **Rust (`rustup`)**.

```
# 1. Clone repositori
git clone [https://github.com/MANG-CODER/MangNotch.git](https://github.com/MANG-CODER/MangNotch.git)
cd mangnotch

# 2. Instal dependensi CLI
npm install

# 3. Jalankan dalam mode development
npm run tauri dev

# 4. Build menjadi file Installer (.exe / .msi)
npm run tauri build
```

👤 Pengembang
Dikembangkan oleh Vestiapani sebagai bagian dari ekosistem kreatif MangNime.

🌐 Landing Page: mangnime.my.id/mangnotch

💻 GitHub: @vestiapani


---

### Cara Menjalankan & Deploy ke GitHub Pages
1. Buat folder baru untuk web kamu, masukkan `index.html`, `style.css`, `script.js`, `README.md`, dan salin `logo.png` dari `src-tauri/icons/logo.png`[cite: 3] ke `assets/logo.png`.
2. Klik dua kali `index.html` atau gunakan ekstensi **Live Server** di VS Code untuk mengetes simulatornya secara langsung.
3. Setelah kamu *push* ke GitHub, pastikan URL di tombol **Landing Page** dan **GitHub Repo** pada file `src/control.html` aplikasi MangNotch kamu sudah sesuai dengan URL repositori GitHub milikmu.