MediStock HUB — Sistem Manajemen Inventory & Restock Obat Farmasi

**oleh Tim Ikutajalah**

**Anggota Tim**
1	Muhammad Akmal Ali	Ketua
2	Raghid Muhammad Arjono	Anggota
3	Rafly Putra Sanjaya	Anggota

----------------------

**Penjelasan proyek**
MediStock HUB merupakan platform berbasis web yang dirancang untuk membantu pengelolaan inventory dan restock obat farmasi secara lebih efektif dan terintegrasi.

Sistem ini membantu mendeteksi kondisi stok obat yang berisiko habis secara lebih awal melalui prediksi kebutuhan stok, pengelolaan FEFO (First Expired, First Out), serta notifikasi otomatis. Dengan adanya sistem ini, proses pemantauan stok, pengajuan restock, distribusi, hingga persetujuan dapat dilakukan dalam satu alur kerja digital.

--------

**Role**

Admin Farmasi — mengelola data obat, memantau stok, mengajukan restock, dan melihat penggunaan obat.
Gudang Utama — memproses pengiriman dan penerimaan obat serta melakukan verifikasi stok fisik.
Kepala Farmasi — memantau kondisi persediaan dan melakukan persetujuan atau penolakan terhadap permintaan restock.

---------------

**Fitur Utama**
- Multi-Role Dashboard untuk Admin Farmasi, Gudang Utama, dan Kepala Farmasi.
- FEFO Management untuk memprioritaskan obat berdasarkan tanggal kedaluwarsa.
- Clinical Alert Mode untuk memberikan peringatan ketika stok obat berada pada kondisi kritis.
- Smart Restock Calculator untuk menghitung kebutuhan restock secara otomatis.
- Pencarian dan Sorting berdasarkan nama, kode, kategori, stok, status stok, dan tanggal kedaluwarsa.
- Ekspor Data inventory ke file Microsoft Excel.

-----------------------------

**Teknologi yang Digunakan**
Node.js — Runtime environment
npm — Package manager
React.js — Framework/library untuk antarmuka aplikasi
JavaScript — Bahasa pemrograman
HTML & CSS — Struktur dan styling antarmuka

---------------------------------------

**Instalasi dan Menjalankan Aplikasi**
1. Prasyarat

Pastikan perangkat memiliki:

Node.js versi 18 atau lebih baru
npm atau yarn
Git

Untuk memastikan Node.js dan npm terpasang:

node --version
npm --version

2. Clone Repository

Clone repository MediStock HUB menggunakan Git:

git clone https://github.com/G1ts-3/Healtech_MediStock.git

Kemudian masuk ke direktori project:

cd Healtech_MediStock

3. Checkout Branch

Gunakan branch main:

git checkout main

4. Install Dependencies

Install seluruh dependency yang dibutuhkan oleh aplikasi:

npm install

5. Jalankan Development Server

Jalankan aplikasi menggunakan:

npm run dev

Setelah server berhasil dijalankan, terminal akan menampilkan alamat lokal aplikasi.

Biasanya aplikasi dapat diakses melalui:

http://localhost:5173

Buka alamat tersebut menggunakan browser.

----------------------

**Struktur Direktori**
Healtech_MediStock/
├── src/
│   ├── components/       # Komponen UI yang dapat digunakan kembali
│   ├── context/          # State management dan logic aplikasi
│   ├── data/             # Data obat, distribusi, restock, dan supplier
│   ├── pages/            # Halaman aplikasi berdasarkan role pengguna
│   ├── App.jsx           # Routing dan layout utama aplikasi
│   └── main.jsx          # Entry point aplikasi
├── package.json
└── README.md
