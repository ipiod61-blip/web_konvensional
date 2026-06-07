# Aplikasi Bakti Jaya - Sistem Manajemen Toko Bahan Bangunan

Proyek ini adalah sistem informasi kasir dan manajemen untuk toko bahan bangunan Bakti Jaya. Terdiri dari *frontend* menggunakan React (Vite) dan *backend* menggunakan Node.js (Express) + MySQL.

## Persyaratan
- Node.js (v18+)
- MySQL (v8+)

## Instalasi dan Menjalankan Proyek

### 1. Database
1. Pastikan server MySQL berjalan.
2. Edit file `backend/.env` sesuai kredensial MySQL Anda (DB_USER, DB_PASSWORD).
3. Masuk ke folder `backend` dan jalankan script inisialisasi:
   ```bash
   cd backend
   node init_db.js
   ```
   *Ini akan otomatis membuat database `bakti_jaya`, tabel-tabelnya, dan memasukkan data dummy (karyawan, supplier, barang).*

### 2. Menjalankan Backend Server
1. Buka terminal baru dan masuk ke folder `backend`.
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Jalankan server (mode development):
   ```bash
   npm run dev
   ```
   *Server backend akan berjalan di http://localhost:5000.*

### 3. Menjalankan Frontend
1. Buka terminal baru dan masuk ke folder `frontend`.
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Jalankan aplikasi frontend:
   ```bash
   npm run dev
   ```
   *Frontend akan berjalan di port yang disediakan Vite (biasanya http://localhost:5173).*

## Akun Login Dummy
Setelah Anda menjalankan `node init_db.js`, dua akun telah dibuat:
1. **Kasir**
   - Username: `kasir`
   - Password: `kasir123`
2. **Manajemen**
   - Username: `manajemen`
   - Password: `manajemen123`

## Fitur Tersedia
- **Login**: Autentikasi JWT yang membedakan *Role* Kasir & Manajemen.
- **Kasir**:
  - Melihat Stok Barang secara real-time.
  - Melakukan transaksi (keranjang belanja) dengan pengurangan stok otomatis menggunakan MySQL Transaction secara atomik.
- **Manajemen**:
  - Mengubah harga barang.
  - Melihat laporan rekapitulasi data (Dashboard).
  - Membuat Surat Permintaan (Purchase Request).
  - Menerima Barang Masuk dari Supplier berdasarkan Surat Permintaan (dengan penambahan stok otomatis).
