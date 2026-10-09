/* ================================================================
   T4n OS — script.js
   ----------------------------------------------------------------
   File     : assets/script.js
   Fungsi   : Seluruh interaktivitas website T4n OS

   DAFTAR MODUL:
   01. Konfigurasi Global (CONFIG)   — ubah nilai di sini saja
   02. Preloader / Boot Sequence     — 4 fase (log → gelap → logo → out)
   03. Terminal Typing Animation     — tinggi tetap + auto-scroll
   04. Navigasi Mobile (Hamburger)   — #menu-toggle, .nav-links
   05. Nav Link Aktif Saat Scroll    — .nav-links a
   06. Tombol Back to Top            — #back-to-top
   07. Lightbox Gallery              — .gallery-item, #lightbox
   08. Modal Download ISO            — .download-btn, #download-modal

   CARA MAINTAIN:
   - Ganti link download → CONFIG.downloadLinks
   - Ganti pesan boot    → CONFIG.bootMessages
   - Ganti isi terminal  → CONFIG.terminalSequence
   - Atur kecepatan      → CONFIG bagian "Kecepatan Animasi"

   CHANGELOG:
   [v2] Preloader : logo muncul SETELAH log fade-out (tidak menimpa)
   [v2] Terminal  : auto-scroll, ukuran tidak berubah saat mengetik
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
  typeSpeed: 70, // Kecepatan ketik terminal (per karakter)
  linePause: 600, // Jeda setelah command selesai diketik

  /* --- Link Download ISO ---
       Ganti '#' dengan URL rilis asli.
       ⚠️ Key HARUS sama dengan data-version pada tombol di HTML. */
  downloadLinks: {
    BASE: "#", // contoh: 'https://dl.t4nlabs.web.id/t4nos-base.iso'
    XFCE: "#", // contoh: 'https://dl.t4nlabs.web.id/t4nos-xfce.iso'
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
       cmd    : perintah yang diketik (efek ketik per karakter)
       output : baris hasil yang muncul setelah command selesai.
       Baris berawalan '[ OK ]' otomatis diwarnai hijau. */
  terminalSequence: [
    {
      cmd: "let-x -S t4n-repo",
      output: [
        "[*] Syncing VUR repository...",
        "[ OK ] t4n-repo synchronized.",
      ],
    },
    {
      cmd: "sudo xbps-install -S base-system",
      output: [
        "[*] Resolving dependencies...",
        "[ OK ] 124 packages installed.",
      ],
    },
    {
      cmd: "uname -rmo",
      output: ["6.6.x_x x86_64 GNU/Linux"],
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
   [v2] Terminal memakai height TETAP (lihat .terminal-body di CSS).
   - Ukuran jendela TIDAK berubah saat mengetik → layout stabil
   - Saat konten melebihi tinggi, baris lama otomatis naik ke atas
     via scrollToEnd() — persis perilaku terminal Linux asli
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

  /* Ketik command per karakter + kursor berkedip */
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

  /* Cetak output command (baris [ OK ] otomatis hijau) */
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

  /* Jalankan step berikutnya dalam urutan */
  const next = () => {
    if (cmdIndex >= CONFIG.terminalSequence.length) return; // Selesai
    const step = CONFIG.terminalSequence[cmdIndex++];
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
   08. MODAL DOWNLOAD ISO
   ----------------------------------------------------------------
   Klik tombol .download-btn → modal dengan link ISO sesuai
   versi (dideteksi dari atribut data-version pada tombol).
   ================================================================ */
function initDownloadModal() {
  const modal = document.getElementById("download-modal");
  const titleEl = document.getElementById("modal-title");
  const linksEl = document.getElementById("modal-links");
  if (!modal || !titleEl || !linksEl) return;

  document.querySelectorAll(".download-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const version = btn.dataset.version; // 'BASE' / 'XFCE' / dst.
      const url = CONFIG.downloadLinks[version] || "#";

      titleEl.textContent = `T4n OS ${version} Edition`;
      linksEl.innerHTML = `
                <a href="${url}" class="btn btn-block" ${url !== "#" ? "download" : ""}>
                    <i class="fas fa-download"></i>&nbsp; Direct Download (ISO)
                </a>
                <p style="margin-top:12px; font-size:.8rem; color:var(--text-muted);">
                    Verify after download:<br>
                    <code style="color:var(--forest-light);">sha256sum t4nos-${version.toLowerCase()}*.iso</code>
                </p>`;

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
