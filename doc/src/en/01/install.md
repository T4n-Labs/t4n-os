# Installation Guide

This guide explains how to install T4n OS.

---

## Requirements

- 64-bit CPU
- Minimum 2GB RAM
- 20GB storage
- USB drive (for live install)

---

## Step 1 – Download ISO

Download the latest ISO from:

Official SourceForge page.

---

## Step 2 – Create Bootable USB

Using Linux:

```bash
sudo dd if=t4n-os.iso of=/dev/sdX bs=4M status=progress
```

Replace /dev/sdX with your USB device.

## Step 3 – Boot and Install

- Boot from USB
- Follow on-screen instructions
- Partition disk
- Install base system
- Reboot

After installation, update system:

```bash
sudo xbps-install -Syu
```