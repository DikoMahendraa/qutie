<div align="center">

# Qutie

**Quick Translate.** Select text in any app, press a shortcut, and read the translation right there.

Indonesian ⇄ English · Free · No account · No subscription · Open source

[![CI](https://github.com/DikoMahendraa/qutie/actions/workflows/ci.yml/badge.svg)](https://github.com/DikoMahendraa/qutie/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-d6336c.svg)](LICENSE)
![Platforms](https://img.shields.io/badge/platforms-macOS%20%7C%20Windows%20%7C%20Linux-6d667d)

[English](#english) · [Bahasa Indonesia](#bahasa-indonesia)

</div>

---

# English

## Why Qutie

Browser extensions can translate text on double-click, but they stop working the moment you leave the browser. In Slack, Notes, a PDF reader or a terminal, translating means opening a browser tab and pasting the text there.

Qutie runs quietly in the background and brings the same convenience to every app on your computer.

## Features

- Works in any app: Slack, Notes, VS Code, PDF readers, email clients and more.
- Global shortcut, fully customizable.
- Automatic direction: select Indonesian and get English, select English and get Indonesian.
- Small popup next to your cursor with a copy button. Press `Esc` or click away to dismiss it.
- Restores your clipboard after reading the selection, including images and rich text.
- Lives in the system tray and can start when you log in.
- No login, no API key, no subscription.
- Cross-platform: macOS, Windows and Linux.

## How it works

```
Select text  →  Press shortcut  →  Qutie copies the selection  →  Translates it  →  Shows the popup
```

1. You press the global shortcut.
2. Qutie saves your current clipboard, simulates a copy command in the app you are using, and reads the selected text.
3. Your original clipboard is restored right away.
4. The text is sent to the translation service. If it is not English, it is translated to English. If it is English, it is translated to Indonesian.
5. The result appears in a popup next to your cursor.

On Linux, Qutie reads the primary selection first, so most apps need no simulated copy at all.

## Installation

### Download a release

Download the latest build for your system from the [Releases](https://github.com/DikoMahendraa/qutie/releases) page.

| System | File |
| --- | --- |
| macOS (Apple Silicon and Intel) | `Qutie-x.y.z-mac-arm64.dmg` or `Qutie-x.y.z-mac-x64.dmg` |
| Windows | `Qutie-x.y.z-win-setup.exe` or `Qutie-x.y.z-win-portable.exe` |
| Linux | `Qutie-x.y.z-linux.AppImage` or `Qutie-x.y.z-linux-amd64.deb` |

Release builds are not code-signed, so your system will show a warning the first time you open Qutie. See [First launch](#first-launch).

### Run from source

Requirements: [Node.js](https://nodejs.org) 20.19 or newer, and Git.

```bash
git clone https://github.com/DikoMahendraa/qutie.git
cd qutie
npm install
npm run dev
```

To run a production build locally:

```bash
npm start
```

## First launch

### macOS

1. Open the `.dmg` and drag Qutie to Applications.
2. Because the app is not signed, right-click Qutie, choose **Open**, then confirm. You only need to do this once.
3. Grant **Accessibility** permission when asked: **System Settings → Privacy & Security → Accessibility → enable Qutie**. Qutie needs it to trigger the copy command in other apps.
4. Qutie has no Dock icon. Look for it in the menu bar.

If you run from source, grant the permission to the terminal app (or the editor) you started it from.

### Windows

1. Run the installer, or start the portable build directly.
2. If Windows SmartScreen appears, choose **More info → Run anyway**.
3. Qutie appears in the system tray. Open the hidden icons area if you do not see it.

### Linux

Install the helper tool that sends the copy command, then run the AppImage or install the `.deb`:

```bash
sudo apt install xdotool
chmod +x Qutie-*-linux.AppImage
./Qutie-*-linux.AppImage
```

The `.deb` package installs `xdotool` for you. Wayland users: see [Platform notes](#platform-notes).

## Usage

1. Select text in any app.
2. Press the shortcut. The default is **Alt + Shift + T** (**⌥⇧T** on macOS).
3. Read the translation in the popup, press **Copy** to copy it, and press `Esc` to close.

Click the tray icon to open settings, or use the tray menu to translate the current selection.

## Settings

| Setting | Description |
| --- | --- |
| Shortcut | Select the shortcut button, then press the keys you want. A shortcut needs at least one modifier key (Ctrl, Alt, Shift, or ⌘). Changes apply immediately. |
| Languages | Indonesian and English, detected automatically. |
| Start Qutie when I log in | Available on macOS and Windows. On Linux, add Qutie to your desktop's startup applications. |

Settings are stored in a small `settings.json` file:

| System | Location |
| --- | --- |
| macOS | `~/Library/Application Support/Qutie/settings.json` |
| Windows | `%APPDATA%\Qutie\settings.json` |
| Linux | `~/.config/Qutie/settings.json` |

## Translation service

Qutie uses the public Google Translate web endpoint (`translate.googleapis.com`). It is free and needs no key, which keeps Qutie simple to install and share.

Keep in mind:

- It is an unofficial endpoint. Google can change it, limit it or stop it at any time.
- Selected text is sent to Google to be translated. Do not use Qutie with confidential text.
- It is intended for personal, light usage.

The translator is a single small module (`src/main/translator.ts`), so replacing it with another provider is straightforward. See [Adding a translation provider](#adding-a-translation-provider).

## Platform notes

| Platform | Status | Notes |
| --- | --- | --- |
| macOS | Supported | Needs Accessibility permission. The copy command is sent through `osascript`. |
| Windows | Supported | The copy command is sent through PowerShell. |
| Linux (X11) | Supported | Reads the primary selection first. Falls back to `xdotool` for the copy command. |
| Linux (Wayland) | Limited | Global shortcuts and simulated keystrokes are restricted by Wayland. Install `wtype`, or run the app through XWayland. If it fails, select text and press `Ctrl + C` yourself, then press the shortcut. |

Good to know:

- Qutie waits a moment after you press the shortcut so your modifier keys are released before the copy command is sent. Keep the shortcut press short.
- Some shortcuts are claimed by other apps or by the system. If registration fails, Qutie tells you and keeps your previous shortcut.
- The translation of very long text is cut at 5,000 characters.

## Project structure

```
qutie/
├── src/
│   ├── main/               Electron main process
│   │   ├── index.ts        App lifecycle, IPC and the translate flow
│   │   ├── selection.ts    Reads the selected text and restores the clipboard
│   │   ├── translator.ts   Translation provider and language direction
│   │   ├── shortcuts.ts    Global shortcut registration
│   │   ├── settings-store.ts  Reads and writes settings.json
│   │   ├── windows.ts      Popup and settings windows
│   │   └── tray.ts         System tray icon and menu
│   ├── preload/            Secure bridge between main and renderer
│   ├── renderer/           React interface
│   │   └── src/
│   │       ├── popup/      Translation popup
│   │       └── settings/   Settings window and shortcut recorder
│   └── shared/             Types, constants and shortcut helpers
├── tests/                  Unit tests (Vitest)
├── resources/              App and tray icons
├── electron-builder.yml    Packaging configuration
└── .github/workflows/      CI and release automation
```

### Architecture

```
┌────────────┐  shortcut  ┌──────────────────────────────┐
│ Any app    │ ─────────▶ │ Main process                 │
│ (selection)│ ◀───────── │  selection.ts  → copy + read │
└────────────┘  copy cmd  │  translator.ts → HTTP        │
                          │  windows.ts    → popup       │
                          └──────────────┬───────────────┘
                                         │ IPC (preload)
                                ┌────────▼────────┐
                                │ React renderer  │
                                │ popup, settings │
                                └─────────────────┘
```

The renderer has no Node.js access. It runs with context isolation and a sandbox, and talks to the main process only through the small API exposed in `src/preload/index.ts`.

## Development

| Command | Description |
| --- | --- |
| `npm run dev` | Start the app with hot reload. |
| `npm run build` | Build the main, preload and renderer bundles. |
| `npm start` | Build and run the production bundle. |
| `npm run typecheck` | Type-check the whole project. |
| `npm test` | Run the unit tests. |
| `npm run dist` | Package installers for your current OS into `release/`. |
| `npm run dist:mac`, `dist:win`, `dist:linux` | Package for a specific OS. |

Code conventions:

- TypeScript in strict mode.
- No code comments. Names and structure carry the explanation, and this README carries the documentation.
- Keep the app simple. Qutie has no login, no accounts and no telemetry, and it should stay that way.

### Adding a translation provider

1. Open `src/main/translator.ts`.
2. Implement a function with the same shape as `requestTranslation`: it receives the text, a source language and a target language, and returns the translated text with the detected source language.
3. Use it inside `translate`, which decides the direction (non-English to English, English to Indonesian).
4. Add a test in `tests/translator.test.ts` that mocks `fetch`.

### Adding a language

The first version supports Indonesian and English only. To add more, extend `LanguageCode` in `src/shared/types.ts`, then update the direction logic in `translate` and add a language setting to the settings window.

## Releasing

1. Update `version` in `package.json`.
2. Create and push a tag:

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. The **Release** workflow builds macOS, Windows and Linux packages and attaches them to a GitHub Release.

To package locally, run `npm run dist`. The files appear in `release/`.

## Troubleshooting

**Nothing happens when I press the shortcut.**
Another app may be using the same shortcut. Open settings and choose a different one. On macOS, check that Accessibility permission is enabled.

**The popup says "No text selected".**
Qutie could not copy your selection. Make sure the text is highlighted and keep the shortcut press short. Some apps, such as remote desktop clients and certain games, block simulated copy commands.

**The popup says it could not reach the translation service.**
Check your internet connection. If you are online, the free endpoint may be temporarily limiting requests. Try again in a minute.

**macOS says Qutie cannot be opened because the developer cannot be verified.**
Right-click the app, choose **Open**, then confirm. You can also run `xattr -dr com.apple.quarantine /Applications/Qutie.app`.

**Linux says "Install xdotool".**
Run `sudo apt install xdotool`, or the equivalent for your distribution.

**My clipboard changed after translating.**
Qutie restores the clipboard after every translation. If you see a difference, please open an issue and tell us which app and content type you were using.

## FAQ

**Is it really free?**
Yes. There is no account, no API key and no subscription.

**Does it work offline?**
No. Translation needs an internet connection.

**Does Qutie collect data?**
Qutie has no telemetry and no account system. The text you translate is sent to the translation service, as described in [Translation service](#translation-service).

**Why not translate automatically when I double-click?**
A global double-click listener would trigger in every app, all the time. The shortcut keeps you in control. It may come as an optional feature later.

**Can I translate other languages?**
Not yet. Indonesian and English come first, and more languages are planned.

## Roadmap

- More languages
- Optional offline translation
- Additional translation providers
- Optional translate-on-select mode

## Contributing

Contributions are welcome.

1. Fork the repository and create a branch.
2. Make your change, following the [code conventions](#development).
3. Run `npm run typecheck` and `npm test`.
4. Open a pull request that explains what changed and why.

Bug reports are most useful when they include your operating system, how you started Qutie, and the app where the problem happened.

## License

[MIT](LICENSE)

---

# Bahasa Indonesia

## Kenapa Qutie

Extension browser bisa menerjemahkan teks lewat klik dua kali, tetapi berhenti bekerja begitu kamu keluar dari browser. Di Slack, Notes, pembaca PDF, atau terminal, menerjemahkan berarti membuka tab browser dan menempelkan teksnya.

Qutie berjalan diam-diam di latar belakang dan membawa kemudahan yang sama ke semua aplikasi di komputermu.

## Fitur

- Bekerja di aplikasi apa pun: Slack, Notes, VS Code, pembaca PDF, aplikasi email, dan lainnya.
- Shortcut global yang bisa kamu atur sendiri.
- Arah terjemahan otomatis: pilih teks Indonesia, hasilnya Inggris. Pilih teks Inggris, hasilnya Indonesia.
- Popup kecil di dekat kursor dengan tombol salin. Tekan `Esc` atau klik di luar untuk menutup.
- Clipboard dikembalikan setelah teks terpilih dibaca, termasuk gambar dan teks berformat.
- Berjalan di system tray dan bisa menyala otomatis saat login.
- Tanpa login, tanpa API key, tanpa langganan.
- Lintas platform: macOS, Windows, dan Linux.

## Cara kerja

```
Pilih teks  →  Tekan shortcut  →  Qutie menyalin pilihan  →  Menerjemahkan  →  Menampilkan popup
```

1. Kamu menekan shortcut global.
2. Qutie menyimpan isi clipboard, mensimulasikan perintah salin di aplikasi yang sedang kamu pakai, lalu membaca teks yang terpilih.
3. Isi clipboard asli langsung dikembalikan.
4. Teks dikirim ke layanan terjemahan. Jika bukan bahasa Inggris, diterjemahkan ke Inggris. Jika bahasa Inggris, diterjemahkan ke Indonesia.
5. Hasilnya muncul di popup dekat kursor.

Di Linux, Qutie membaca primary selection lebih dulu, jadi sebagian besar aplikasi tidak membutuhkan simulasi salin.

## Instalasi

### Unduh rilis

Unduh versi terbaru untuk sistemmu dari halaman [Releases](https://github.com/DikoMahendraa/qutie/releases).

| Sistem | Berkas |
| --- | --- |
| macOS (Apple Silicon dan Intel) | `Qutie-x.y.z-mac-arm64.dmg` atau `Qutie-x.y.z-mac-x64.dmg` |
| Windows | `Qutie-x.y.z-win-setup.exe` atau `Qutie-x.y.z-win-portable.exe` |
| Linux | `Qutie-x.y.z-linux.AppImage` atau `Qutie-x.y.z-linux-amd64.deb` |

Build rilis belum ditandatangani (code-signing), jadi sistemmu akan menampilkan peringatan saat pertama kali membuka Qutie. Lihat [Pertama kali dibuka](#pertama-kali-dibuka).

### Jalankan dari source

Kebutuhan: [Node.js](https://nodejs.org) 20.19 atau lebih baru, dan Git.

```bash
git clone https://github.com/DikoMahendraa/qutie.git
cd qutie
npm install
npm run dev
```

Untuk menjalankan build produksi secara lokal:

```bash
npm start
```

## Pertama kali dibuka

### macOS

1. Buka `.dmg` lalu seret Qutie ke Applications.
2. Karena aplikasi belum ditandatangani, klik kanan Qutie, pilih **Open**, lalu konfirmasi. Ini hanya perlu dilakukan sekali.
3. Berikan izin **Accessibility** saat diminta: **System Settings → Privacy & Security → Accessibility → aktifkan Qutie**. Izin ini dibutuhkan agar Qutie bisa memicu perintah salin di aplikasi lain.
4. Qutie tidak punya ikon Dock. Cari di menu bar.

Jika dijalankan dari source, berikan izin ke aplikasi terminal (atau editor) tempat kamu menjalankannya.

### Windows

1. Jalankan installer, atau langsung buka versi portable.
2. Jika muncul Windows SmartScreen, pilih **More info → Run anyway**.
3. Qutie muncul di system tray. Buka area ikon tersembunyi jika tidak terlihat.

### Linux

Pasang alat bantu pengirim perintah salin, lalu jalankan AppImage atau pasang `.deb`:

```bash
sudo apt install xdotool
chmod +x Qutie-*-linux.AppImage
./Qutie-*-linux.AppImage
```

Paket `.deb` memasang `xdotool` untukmu. Pengguna Wayland: lihat [Catatan platform](#catatan-platform).

## Cara pakai

1. Pilih teks di aplikasi apa pun.
2. Tekan shortcut. Bawaannya **Alt + Shift + T** (**⌥⇧T** di macOS).
3. Baca terjemahan di popup, tekan **Copy** untuk menyalin, dan tekan `Esc` untuk menutup.

Klik ikon tray untuk membuka pengaturan, atau gunakan menu tray untuk menerjemahkan teks yang sedang dipilih.

## Pengaturan

| Pengaturan | Keterangan |
| --- | --- |
| Shortcut | Klik tombol shortcut, lalu tekan kombinasi tombol yang kamu mau. Shortcut butuh minimal satu tombol modifier (Ctrl, Alt, Shift, atau ⌘). Perubahan langsung berlaku. |
| Languages | Indonesia dan Inggris, terdeteksi otomatis. |
| Start Qutie when I log in | Tersedia di macOS dan Windows. Di Linux, tambahkan Qutie ke startup applications desktopmu. |

Pengaturan disimpan di berkas kecil `settings.json`:

| Sistem | Lokasi |
| --- | --- |
| macOS | `~/Library/Application Support/Qutie/settings.json` |
| Windows | `%APPDATA%\Qutie\settings.json` |
| Linux | `~/.config/Qutie/settings.json` |

## Layanan terjemahan

Qutie memakai endpoint web publik Google Translate (`translate.googleapis.com`). Gratis dan tanpa key, sehingga Qutie mudah dipasang dan dibagikan.

Yang perlu kamu ketahui:

- Ini endpoint tidak resmi. Google bisa mengubah, membatasi, atau menghentikannya kapan saja.
- Teks yang dipilih dikirim ke Google untuk diterjemahkan. Jangan gunakan Qutie untuk teks rahasia.
- Ditujukan untuk pemakaian pribadi yang ringan.

Penerjemahnya hanya satu modul kecil (`src/main/translator.ts`), jadi menggantinya dengan penyedia lain cukup mudah. Lihat [Menambah penyedia terjemahan](#menambah-penyedia-terjemahan).

## Catatan platform

| Platform | Status | Catatan |
| --- | --- | --- |
| macOS | Didukung | Butuh izin Accessibility. Perintah salin dikirim lewat `osascript`. |
| Windows | Didukung | Perintah salin dikirim lewat PowerShell. |
| Linux (X11) | Didukung | Membaca primary selection lebih dulu. Memakai `xdotool` sebagai cadangan untuk perintah salin. |
| Linux (Wayland) | Terbatas | Shortcut global dan simulasi keystroke dibatasi oleh Wayland. Pasang `wtype`, atau jalankan aplikasi lewat XWayland. Jika gagal, pilih teks dan tekan `Ctrl + C` sendiri, lalu tekan shortcut. |

Perlu diketahui:

- Qutie menunggu sebentar setelah kamu menekan shortcut agar tombol modifier sempat dilepas sebelum perintah salin dikirim. Tekan shortcut dengan singkat.
- Sebagian shortcut dipakai aplikasi lain atau sistem. Jika pendaftaran gagal, Qutie memberi tahu dan tetap memakai shortcut sebelumnya.
- Teks yang sangat panjang dipotong pada 5.000 karakter.

## Struktur project

Strukturnya sama dengan bagian [Project structure](#project-structure) di atas. Renderer tidak punya akses Node.js. Ia berjalan dengan context isolation dan sandbox, dan hanya berbicara dengan proses utama lewat API kecil di `src/preload/index.ts`.

## Pengembangan

| Perintah | Keterangan |
| --- | --- |
| `npm run dev` | Jalankan aplikasi dengan hot reload. |
| `npm run build` | Build bundle main, preload, dan renderer. |
| `npm start` | Build lalu jalankan bundle produksi. |
| `npm run typecheck` | Cek tipe seluruh project. |
| `npm test` | Jalankan unit test. |
| `npm run dist` | Buat installer untuk OS yang sedang dipakai ke folder `release/`. |
| `npm run dist:mac`, `dist:win`, `dist:linux` | Buat paket untuk OS tertentu. |

Konvensi kode:

- TypeScript dengan mode strict.
- Tanpa komentar di kode. Penamaan dan struktur yang menjelaskan, dan README ini yang menjadi dokumentasi.
- Jaga aplikasi tetap sederhana. Qutie tidak punya login, akun, ataupun telemetri, dan sebaiknya tetap begitu.

### Menambah penyedia terjemahan

1. Buka `src/main/translator.ts`.
2. Buat fungsi dengan bentuk yang sama seperti `requestTranslation`: menerima teks, bahasa sumber, dan bahasa tujuan, lalu mengembalikan teks terjemahan beserta bahasa sumber yang terdeteksi.
3. Pakai di dalam `translate`, yang menentukan arah (non-Inggris ke Inggris, Inggris ke Indonesia).
4. Tambahkan test di `tests/translator.test.ts` dengan mock `fetch`.

### Menambah bahasa

Versi pertama hanya mendukung Indonesia dan Inggris. Untuk menambah bahasa, perluas `LanguageCode` di `src/shared/types.ts`, ubah logika arah di `translate`, lalu tambahkan pengaturan bahasa di jendela settings.

## Merilis versi baru

1. Ubah `version` di `package.json`.
2. Buat dan push tag:

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

3. Workflow **Release** akan membuat paket macOS, Windows, dan Linux lalu melampirkannya ke GitHub Release.

Untuk membuat paket secara lokal, jalankan `npm run dist`. Hasilnya ada di `release/`.

## Pemecahan masalah

**Tidak terjadi apa-apa saat menekan shortcut.**
Mungkin aplikasi lain memakai shortcut yang sama. Buka pengaturan dan pilih shortcut lain. Di macOS, pastikan izin Accessibility sudah aktif.

**Popup menampilkan "No text selected".**
Qutie tidak berhasil menyalin pilihanmu. Pastikan teks tersorot dan tekan shortcut dengan singkat. Sebagian aplikasi, seperti klien remote desktop dan beberapa game, memblokir perintah salin hasil simulasi.

**Popup menyebut tidak bisa menjangkau layanan terjemahan.**
Periksa koneksi internetmu. Jika sudah online, endpoint gratis mungkin sedang membatasi permintaan. Coba lagi satu menit kemudian.

**macOS menyatakan Qutie tidak bisa dibuka karena pengembangnya tidak terverifikasi.**
Klik kanan aplikasi, pilih **Open**, lalu konfirmasi. Kamu juga bisa menjalankan `xattr -dr com.apple.quarantine /Applications/Qutie.app`.

**Linux meminta "Install xdotool".**
Jalankan `sudo apt install xdotool`, atau perintah setara untuk distribusimu.

**Clipboard saya berubah setelah menerjemahkan.**
Qutie mengembalikan clipboard setelah setiap terjemahan. Jika kamu melihat perbedaan, silakan buka issue dan sebutkan aplikasi serta jenis kontennya.

## FAQ

**Benar-benar gratis?**
Ya. Tanpa akun, tanpa API key, tanpa langganan.

**Bisa dipakai offline?**
Tidak. Terjemahan membutuhkan koneksi internet.

**Apakah Qutie mengumpulkan data?**
Qutie tidak punya telemetri dan tidak punya sistem akun. Teks yang kamu terjemahkan dikirim ke layanan terjemahan, seperti dijelaskan di [Layanan terjemahan](#layanan-terjemahan).

**Kenapa tidak otomatis menerjemahkan saat klik dua kali?**
Pendengar klik dua kali global akan aktif di semua aplikasi, setiap saat. Shortcut membuatmu tetap memegang kendali. Fitur ini mungkin hadir nanti sebagai opsi.

**Bisa menerjemahkan bahasa lain?**
Belum. Indonesia dan Inggris lebih dulu, bahasa lain direncanakan.

## Roadmap

- Lebih banyak bahasa
- Terjemahan offline opsional
- Penyedia terjemahan tambahan
- Mode terjemahkan-saat-memilih opsional

## Berkontribusi

Kontribusi sangat diterima.

1. Fork repositori dan buat branch.
2. Kerjakan perubahanmu dengan mengikuti [konvensi kode](#pengembangan).
3. Jalankan `npm run typecheck` dan `npm test`.
4. Buka pull request yang menjelaskan apa yang berubah dan alasannya.

Laporan bug paling berguna jika menyertakan sistem operasi, cara kamu menjalankan Qutie, dan aplikasi tempat masalah terjadi.

## Lisensi

[MIT](LICENSE)
