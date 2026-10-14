/* ================================================================
   T4n OS — script.js
   ----------------------------------------------------------------
   File     : assets/script.js
   Fungsi   : Seluruh interaktivitas website T4n OS

   DAFTAR MODUL:
   01. Konfigurasi Global (CONFIG)   — ubah nilai di sini saja
   02. Preloader / Boot Sequence     — 4 fase (log → gelap → logo → out)
   03. Terminal Typing Animation     — tinggi tetap + auto-scroll
                                       + animasi password
   04. Navigasi Mobile (Hamburger)   — #menu-toggle, .nav-links
   05. Nav Link Aktif Saat Scroll    — .nav-links a
   06. Tombol Back to Top            — #back-to-top
   07. Lightbox Gallery              — .gallery-item, #lightbox
   08. Modal Download ISO            — .download-btn, #download-modal
                                       (multi-mirror: Direct,
                                        SourceForge, Google Drive)

   CARA MAINTAIN:
   - Ganti link download → CONFIG.downloadLinks
       • Setiap versi = daftar mirror (urutan array = urutan tombol)
       • url "#" → otomatis jadi tombol disabled "Coming Soon"
   - Ganti pesan boot    → CONFIG.bootMessages
   - Ganti isi terminal  → CONFIG.terminalSequence
       • Step command : { cmd: "...", output: [...] }
       • Step password: { password: { prompt, value }, output: [...] }
   - Atur kecepatan      → CONFIG bagian "Kecepatan Animasi"

   CHANGELOG:
   [v2.0] Preloader : logo muncul SETELAH log fade-out (tidak menimpa)
   [v2.0] Terminal  : auto-scroll, ukuran tetap saat mengetik
   [v2.0] Terminal  : animasi ketik password — diketik satu per satu
                      dan tampil apa adanya (tanpa penyamaran)
   [v2.0] Modal ISO : dukungan multi-mirror per versi (Direct,
                      SourceForge, Google Drive) — mirror yang belum
                      tersedia tampil sebagai tombol Coming Soon
   ================================================================ */

"use strict";

/* ================================================================
   01. KONFIGURASI GLOBAL
   ----------------------------------------------------------------
   Semua nilai yang sering berubah dikumpulkan di satu tempat
   agar mudah di-maintain tanpa menyentuh logika program.
   ================================================================ */
const CONFIG = {
  /* --- Kecepatan Animasi (milidetik) --- */
  bootLineDelay: 350, // Jeda antar baris log boot (Fase 1)
  logHoldTime: 500, // Jeda log selesai → log fade-out (Fase 2)
  logoDelay: 400, // Jeda layar gelap → logo T4n OS muncul (Fase 3)
  logoHoldTime: 1600, // Lama logo tampil → preloader hilang (Fase 4)
  typeSpeed: 70, // Kecepatan ketik command terminal (per karakter)
  linePause: 600, // Jeda setelah command/output selesai
  passwordSpeed: 110, // Kecepatan ketik password (per karakter)

  /* --- Link Download ISO (MULTI-MIRROR) ---
       Setiap versi berisi DAFTAR mirror; urutan array = urutan
       tombol di modal. ⚠️ Key HARUS sama dengan data-version
       pada tombol di HTML.

       Properti per mirror:
         label   : teks tombol
         icon    : class Font Awesome
         url     : link download. Isi "#" bila mirror belum ada
                   → otomatis tampil sebagai tombol disabled
                     "Coming Soon" (tidak perlu hapus/tambah kode)
         download: (opsional) true → atribut `download` dipasang,
                   hanya untuk link file ISO langsung (server sendiri).
                   Untuk SourceForge/GDrive JANGAN diisi true. */
  /* --- Link Download ISO (MULTI-MIRROR) --- */
  downloadLinks: {
    BASE: [
      {
        label: "Direct Download (ISO)",
        icon: "fas fa-download",
        url: "#", // ← isi URL .iso di server sendiri bila sudah ada
        download: true,
      },
      {
        label: "SourceForge",
        icon: "fas fa-server",
        url: "https://sourceforge.net/projects/t4n-os/",
      },
      {
        label: "Google Drive",
        icon: "fab fa-google-drive",
        url: "https://drive.google.com/drive/folders/1n46pLVusTyGlu3k04HpDBTO6E1t7j7ud?usp=drive_link",
      },
      {
        label: "Torrent",
        icon: "fas fa-globe",
        url: "#",
      },
    ],
    XFCE: [
      {
        label: "Direct Download (ISO)",
        icon: "fas fa-download",
        url: "#", // ← isi URL .iso di server sendiri bila sudah ada
        download: true,
      },
      {
        label: "SourceForge",
        icon: "fas fa-server",
        url: "https://sourceforge.net/projects/t4n-os/",
      },
      {
        label: "Google Drive",
        icon: "fab fa-google-drive",
        url: "https://drive.google.com/drive/folders/1n46pLVusTyGlu3k04HpDBTO6E1t7j7ud?usp=drive_link",
      },
      {
        label: "Torrent",
        icon: "fas fa-globe",
        url: "#",
      },
    ],
  },

  /* --- Pesan Boot Sequence (Preloader) ---
       Baris yang mengandung '[ OK ]' otomatis jadi hijau. */
  bootMessages: [
    "T4n OS Bootloader v1.0 — Void Linux",
    "Loading Linux kernel .......... [ OK ]",
    "Starting runit init ........... [ OK ]",
    "Mounting filesystems .......... [ OK ]",
    "Detecting hardware ............ [ OK ]",
    "Starting XBPS package manager . [ OK ]",
    "Starting Let-X (VUR helper) ... [ OK ]",
    "Reached target: Default.",
  ],

  /* --- Animasi Terminal di Hero ---
       Dua jenis step yang didukung:

       1) STEP COMMAND (efek ketik per karakter):
          { cmd: "uname -r", output: ["6.18 x86_64 GNU/Linux"] }

       2) STEP PASSWORD (mengetik password ala sudo):
          { password: { prompt, value },
            output: ["[ OK ] Authentication successful."] }
          - prompt : teks prompt (langsung tampil, tidak diketik)
          - value  : password yang "diketik" → tampil PENUH,
                     tidak disembunyikan; jumlah karakter yang
                     diketik mengikuti panjang string ini

       Baris output berawalan '[ OK ]' otomatis diwarnai hijau. */
  terminalSequence: [
    {
      cmd: "let-x -S",
      output: ["[*] Root privileges required..."],
    },
    {
      // Step password: diketik satu per satu & terlihat penuh
      password: {
        prompt: "[sudo] password for t4nlabs:",
        value: "t4nlabs",
      },
      output: [
        "[OK] Authentication successful.",
        "[*] Syncing VUR repository...",
        "[*] t4n-repo synchronized...",
        "[ OK ] 41 packages available.",
        "[ OK ] 871 packages available.",
      ],
    },
    {
      cmd: "uname -rmo",
      output: ["6.18 x86_64 GNU/Linux"],
    },
    {
      cmd: "fastfetch",
      output: [
        "  os     : T4n OS (Void Linux)",
        "  init   : runit",
        "  pkg    : xbps + let-x (VUR)",
        "  uptime : community driven ♥",
      ],
    },
  ],
};

/* ================================================================
   02. PRELOADER / BOOT SEQUENCE (4 Fase)
   ----------------------------------------------------------------
   Urutan (total ± 5.3 detik dengan default CONFIG):

     Fase 1  ▸ Log boot dicetak baris demi baris
     Fase 2  ▸ "Reached target: Default." tampil → log FADE-OUT
              → layar gelap bersih sesaat
     Fase 3  ▸ Logo "T4n OS" muncul sendirian di tengah
              (TIDAK menimpa log, karena log sudah hilang)
     Fase 4  ▸ Preloader fade-out → website tampil +
              animasi terminal hero dimulai

   Timing Fase 2-4 dihitung OTOMATIS dari jumlah bootMessages,
   jadi menambah baris log tidak perlu mengubah angka manual.
   ================================================================ */
function initPreloader() {
  const preloader = document.getElementById("preloader");
  const bootLog = document.getElementById("boot-log");
  const bootLogo = document.getElementById("boot-logo");
  if (!preloader || !bootLog) return;

  // Kursor kedip adalah elemen terakhir; log disisipkan sebelum kursor
  const cursor = bootLog.querySelector(".cursor-block");

  /* ---- FASE 1: Cetak log boot satu per satu ---- */
  CONFIG.bootMessages.forEach((msg, i) => {
    setTimeout(
      () => {
        const line = document.createElement("span");
        line.className =
          "log-line" + (msg.includes("[ OK ]") ? " log-success" : "");
        line.textContent = msg;
        bootLog.insertBefore(line, cursor);
      },
      CONFIG.bootLineDelay * (i + 1),
    );
  });

  /* Waktu total log selesai dicetak (dihitung otomatis) */
  const logDone = CONFIG.bootMessages.length * CONFIG.bootLineDelay;

  /* ---- FASE 2: Log fade-out → layar gelap bersih ---- */
  setTimeout(() => {
    bootLog.classList.add("fade-out");
  }, logDone + CONFIG.logHoldTime);

  /* ---- FASE 3: Logo T4n OS muncul SETELAH layar bersih ---- */
  setTimeout(
    () => {
      bootLogo?.classList.add("visible");
    },
    logDone + CONFIG.logHoldTime + CONFIG.logoDelay,
  );

  /* ---- FASE 4: Preloader hilang → mulai animasi terminal ---- */
  setTimeout(
    () => {
      preloader.classList.add("fade-out");
      initTerminal();
    },
    logDone + CONFIG.logHoldTime + CONFIG.logoDelay + CONFIG.logoHoldTime,
  );
}

/* ================================================================
   03. TERMINAL TYPING ANIMATION (Hero Section)
   ----------------------------------------------------------------
   - Terminal memakai height TETAP (lihat .terminal-body di CSS).
     Ukuran jendela TIDAK berubah saat mengetik → layout stabil.
   - Saat konten melebihi tinggi, baris lama otomatis naik ke atas
     via scrollToEnd() — persis perilaku terminal Linux asli.

   - Dukungan STEP PASSWORD:
     typePassword() : prompt tampil → karakter dari `value` diketik
       satu per satu dan terlihat penuh (tanpa penyamaran) →
       selesai, jeda "verifikasi" → lanjut ke output.
     Urutan & isi step dikendalikan CONFIG.terminalSequence (modul 01).
   ================================================================ */
function initTerminal() {
  const output = document.getElementById("terminal-output");
  if (!output) return;

  /* Auto-scroll ke baris terbaru.
       Dipanggil setiap ada baris/karakter baru agar terminal
       selalu menampilkan aktivitas terakhir. */
  const scrollToEnd = () => {
    output.scrollTop = output.scrollHeight;
  };

  let cmdIndex = 0;

  /* ---- A. Ketik command per karakter + kursor berkedip ---- */
  const typeCommand = (command, done) => {
    const line = document.createElement("span");
    line.className = "cmd-line";

    const prefix = document.createElement("span");
    prefix.className = "cmd-prefix";
    prefix.textContent = "t4nlabs@t4nos:~$";

    const text = document.createElement("span");
    const cursor = document.createElement("span");
    cursor.className = "cursor";

    line.append(prefix, text, cursor);
    output.appendChild(line);
    scrollToEnd();

    let i = 0;
    const typing = setInterval(() => {
      text.textContent += command[i++];
      scrollToEnd();
      if (i >= command.length) {
        clearInterval(typing);
        // Jeda sebelum output muncul, kursor dihapus
        setTimeout(() => {
          cursor.remove();
          done();
        }, CONFIG.linePause);
      }
    }, CONFIG.typeSpeed);
  };

  /* ---- B. Animasi ketik password (tampil apa adanya) ----
       Cara kerja:
       1. Prompt (mis. "[sudo] password for t4nlabs:") langsung tampil
       2. Setiap karakter dari `value` diketik SATU PER SATU dan
          TERLIHAT penuh — tidak ada penyamaran/bullet
       3. Selesai → jeda sesaat (linePause) sebagai "verifikasi"
          → lanjut ke output berikutnya
       Catatan: tanpa kursor berkedip, sama seperti input sudo asli. */
  const typePassword = ({ prompt = "Password:", value = "password" }, done) => {
    /* Satu baris berisi prompt + password yang diketik */
    const line = document.createElement("span");
    line.className = "cmd-line";

    const promptEl = document.createElement("span");
    promptEl.className = "cmd-password-prompt"; // styling opsional di CSS
    promptEl.textContent = prompt;

    const textEl = document.createElement("span");
    textEl.className = "cmd-password"; // styling opsional di CSS

    line.append(promptEl, " ", textEl); // spasi antara prompt & password
    output.appendChild(line);
    scrollToEnd();

    /* Ketik karakter satu per satu.
       Jeda acak (±0.6x–1.4x passwordSpeed) agar terasa seperti
       manusia mengetik. Ingin jeda TETAP? Ganti baris `const delay`
       menjadi: const delay = CONFIG.passwordSpeed; */
    let i = 0;
    const typeChar = () => {
      textEl.textContent += value[i++];
      scrollToEnd();

      if (i >= value.length) {
        // Semua karakter selesai → jeda "verifikasi" → lanjut output
        setTimeout(done, CONFIG.linePause);
        return;
      }

      const delay = CONFIG.passwordSpeed * (0.6 + Math.random() * 0.8);
      setTimeout(typeChar, delay);
    };

    typeChar(); // mulai mengetik dari karakter pertama
  };

  /* ---- C. Cetak output command (baris [ OK ] otomatis hijau) ---- */
  const printOutput = (lines, done) => {
    lines.forEach((text) => {
      const out = document.createElement("span");
      out.className =
        "cmd-line" + (text.startsWith("[ OK ]") ? " cmd-success" : "");
      out.textContent = text;
      output.appendChild(out);
    });
    scrollToEnd();
    setTimeout(done, CONFIG.linePause);
  };

  /* ---- D. Jalankan step berikutnya dalam urutan ----
       Mendukung 2 jenis step (lihat dokumentasi CONFIG):
       - step.password ada → animasi password dulu → output
       - selain itu        → animasi ketik command → output */
  const next = () => {
    if (cmdIndex >= CONFIG.terminalSequence.length) return; // Selesai
    const step = CONFIG.terminalSequence[cmdIndex++];

    if (step.password) {
      // Step password: ketik value → output (output boleh kosong)
      typePassword(step.password, () => printOutput(step.output || [], next));
      return;
    }

    // Step command biasa
    typeCommand(step.cmd, () => printOutput(step.output, next));
  };

  next();
}

/* ================================================================
   04. NAVIGASI MOBILE (Hamburger Menu)
   ----------------------------------------------------------------
   Buka/tutup drawer menu + ganti ikon (bars ↔ times).
   Menu otomatis tertutup saat link diklik.
   ================================================================ */
function initMobileNav() {
  const toggle = document.getElementById("menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (!toggle || !navLinks) return;

  const ICON_OPEN = '<i class="fas fa-bars"></i>'; // Hamburger
  const ICON_CLOSE = '<i class="fas fa-times"></i>'; // X

  toggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("active");
    toggle.innerHTML = isOpen ? ICON_CLOSE : ICON_OPEN;
    toggle.setAttribute("aria-expanded", isOpen);
  });

  // Tutup menu otomatis setelah salah satu link diklik
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      toggle.innerHTML = ICON_OPEN;
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ================================================================
   05. NAV LINK AKTIF SAAT SCROLL
   ----------------------------------------------------------------
   Menandai link navigasi (.active) sesuai section yang
   sedang terlihat di layar.
   ================================================================ */
function initActiveNav() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");
  if (!sections.length || !navLinks.length) return;

  const update = () => {
    let currentId = "";
    const trigger = window.scrollY + 120; // Offset agar akurat

    sections.forEach((sec) => {
      if (trigger >= sec.offsetTop) currentId = sec.id;
    });

    navLinks.forEach((link) => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === "#" + currentId,
      );
    });
  };

  window.addEventListener("scroll", update, { passive: true });
  update(); // Panggil sekali saat load
}

/* ================================================================
   06. TOMBOL BACK TO TOP
   ----------------------------------------------------------------
   Muncul setelah scroll ±400px, klik → kembali ke atas.
   ================================================================ */
function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;

  const toggle = () => btn.classList.toggle("show", window.scrollY > 400);

  window.addEventListener("scroll", toggle, { passive: true });
  btn.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
}

/* ================================================================
   07. LIGHTBOX GALLERY
   ----------------------------------------------------------------
   Klik gambar gallery → tampil fullscreen + navigasi
   prev/next (tombol & keyboard). Loop melingkar.
   ================================================================ */
function initLightbox() {
  const lightbox = document.getElementById("lightbox");
  const imgEl = document.getElementById("lightbox-img");
  if (!lightbox || !imgEl) return;

  const items = [...document.querySelectorAll(".gallery-item img")];
  let current = 0;

  /* Tampilkan gambar pada index (mendukung index negatif → loop) */
  const show = (index) => {
    current = (index + items.length) % items.length;
    imgEl.src = items[current].src;
    imgEl.alt = items[current].alt;
  };

  const open = (i) => {
    show(i);
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden"; // Kunci scroll background
  };

  const close = () => {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  };

  // Klik thumbnail → buka
  items.forEach((img, i) => {
    img.parentElement.addEventListener("click", () => open(i));
  });

  // Kontrol tutup & navigasi
  lightbox.querySelector(".lightbox-close")?.addEventListener("click", close);
  document
    .getElementById("lightbox-prev")
    ?.addEventListener("click", () => show(current - 1));
  document
    .getElementById("lightbox-next")
    ?.addEventListener("click", () => show(current + 1));

  // Klik area gelap di luar gambar → tutup
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });

  // Dukungan keyboard: ESC tutup, ←/→ navigasi
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
}

/* ================================================================
   08. MODAL DOWNLOAD ISO (MULTI-MIRROR)
   ----------------------------------------------------------------
   Klik tombol .download-btn → modal berisi DAFTAR tombol mirror
   sesuai versi (dari CONFIG.downloadLinks[version]):

     - url terisi     → tombol <a> aktif
         • download: true → atribut `download` (untuk file ISO langsung)
         • selain itu     → buka di tab baru (SourceForge, GDrive, dll)
     - url "#"        → tombol disabled "Coming Soon" (span, bukan link)
     - daftar kosong  → pesan "belum tersedia"

   Di bawah daftar selalu tampil petunjuk verifikasi sha256sum.
   ================================================================ */
function initDownloadModal() {
  const modal = document.getElementById("download-modal");
  const titleEl = document.getElementById("modal-title");
  const linksEl = document.getElementById("modal-links");
  if (!modal || !titleEl || !linksEl) return;

  document.querySelectorAll(".download-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const version = btn.dataset.version; // 'BASE' / 'XFCE' / dst.
      const mirrors = CONFIG.downloadLinks[version] || [];

      titleEl.textContent = `T4n OS ${version} Edition`;

      /* Susun HTML tombol untuk setiap mirror.
         Mirror dengan url "#" → tombol disabled (Coming Soon). */
      const buttons = mirrors
        .map((m) => {
          const available = m.url && m.url !== "#";

          // Mirror belum tersedia → span disabled, bukan link
          if (!available) {
            return `
              <span class="btn btn-block btn-disabled" aria-disabled="true">
                  <i class="${m.icon}"></i>&nbsp; ${m.label} - Coming Soon
              </span>`;
          }

          // Mirror aktif. `download: true` hanya untuk link file langsung;
          // mirror eksternal (SourceForge/GDrive) dibuka di tab baru.
          const attrs = m.download
            ? "download"
            : 'target="_blank" rel="noopener"';

          return `
              <a href="${m.url}" class="btn btn-block" ${attrs}>
                  <i class="${m.icon}"></i>&nbsp; ${m.label}
              </a>`;
        })
        .join("");

      /* Petunjuk verifikasi setelah download (selalu tampil) */
      const verify = `
            <p style="margin-top:12px; font-size:.8rem; color:var(--text-muted);">
                Verify after download:<br>
                <code style="color:var(--forest-light);">sha256sum t4nos-${version.toLowerCase()}*.iso</code>
            </p>`;

      /* Jika versi tidak punya mirror sama sekali → pesan fallback */
      linksEl.innerHTML =
        (buttons || "<p>Link download belum tersedia.</p>") + verify;

      modal.classList.add("active");
    });
  });

  const close = () => modal.classList.remove("active");

  modal.querySelector(".modal-close")?.addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

/* ================================================================
   INISIALISASI — semua modul dijalankan setelah DOM siap
   ================================================================ */
document.addEventListener("DOMContentLoaded", () => {
  initPreloader(); // 02 — memicu initTerminal() otomatis di Fase 4
  initMobileNav(); // 04
  initActiveNav(); // 05
  initBackToTop(); // 06
  initLightbox(); // 07
  initDownloadModal(); // 08
});
