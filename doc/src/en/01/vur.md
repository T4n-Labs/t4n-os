# Void User Repository (VUR)

VUR stands for **Void User Repository**.

It is a community-driven repository concept inspired by Arch User Repository (AUR),
but designed specifically for Void Linux and T4n OS.

---

## Purpose

- Provide community-maintained templates
- Extend official repositories
- Allow faster software availability

---

## Structure

VUR contains:

- core → system-related templates
- extra → additional software
- multilib → 32-bit support templates

---

## Example Usage

Clone VUR repository:

```bash
git clone https://github.com/t4n-tech/vur.git
cd vur
```

Build package:

```bash
./xbps-src pkg package-name
```

VUR allows community contribution while maintaining system integrity.
