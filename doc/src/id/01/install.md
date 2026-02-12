# Panduan Instalasi

Panduan ini menjelaskan cara menginstal T4n OS.

---

## Persyaratan

- CPU 64-bit
- RAM minimal 2GB
- Penyimpanan 20GB
- Drive USB (untuk instalasi live)

---

## Langkah 1 – Unduh ISO

Unduh ISO terbaru dari:

Halaman resmi SourceForge.

---

## Langkah 2 – Buat USB Bootable

Menggunakan Linux:

```bash
sudo dd if=t4n-os.iso of=/dev/sdX bs=4M status=progress
```

Ganti /dev/sdX dengan perangkat USB Anda.

## Langkah 3 – Boot dan Instal

- Boot dari USB
- Ikuti petunjuk di layar
- Partisi disk
- Instal sistem dasar
- Reboot

Setelah instalasi, perbarui sistem:

```bash
sudo xbps-install -Syu
```