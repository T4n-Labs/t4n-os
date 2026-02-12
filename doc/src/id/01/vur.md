# Void User Repository (VUR)

VUR adalah singkatan dari **Void User Repository**.

Ini adalah konsep repositori yang digerakkan oleh komunitas, terinspirasi oleh Arch User Repository (AUR),
tetapi dirancang khusus untuk Void Linux dan T4n OS.

---

## Tujuan

- Menyediakan templat yang dikelola komunitas
- Memperluas repositori resmi
- Memungkinkan ketersediaan perangkat lunak yang lebih cepat

---

## Struktur

VUR berisi:

- core → templat terkait sistem
- extra → perangkat lunak tambahan
- multilib → templat dukungan 32-bit

---

## Contoh Penggunaan

Kloning repositori VUR:

```bash
git clone https://github.com/t4n-tech/vur.git
cd vur
```

Membangun paket:

```bash
./xbps-src pkg nama-paket
```

VUR memungkinkan kontribusi komunitas sambil menjaga integritas sistem.