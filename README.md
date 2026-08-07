# 🏥 Healtech MediStock — Sistem Manajemen Inventory & Restock Obat Farmasi

**Healtech MediStock** adalah platform sistem informasi manajemen persediaan obat cerdas (*Smart Pharmacy Inventory & Restock Calculator*) yang dirancang untuk mengoptimalkan pengelolaan stok obat, pemantauan tanggal kadaluarsa berbasis **FEFO (First Expired, First Out)**, pelacakan distribusi antar unit, dan perhitungan otomatis kebutuhan restock obat di rumah sakit maupun apotek.

---

## 🌟 Fitur Utama

### 📊 1. Multi-Role Dashboard
- **Admin Farmasi**: Manajemen data obat, pengajuan restock cerdas, pelacakan distribusi, dan analisis pemakaian obat.
- **Gudang Utama**: Pemrosesan pengiriman & penerimaan distribusi obat, verifikasi stok fisik, dan konfirmasi barang diterima.
- **Kepala Farmasi**: Monitoring tingkat persediaan secara komprehensif, penyetujuan/penolakan permintaan restock (*Approve/Reject*), dan audit log aktivitas.

### ⚠️ 2. FEFO Priority & Clinical Alert Mode
- **FEFO Management**: Pengelompokan obat berdasarkan tanggal kadaluarsa (**KRITIS** < 30 hari, **WARNING** < 90 hari, **AMAN**) untuk mencegah obat kadaluarsa sebelum terpakai.
- **Clinical Alert Mode**: Notifikasi audio & visual waktu-nyata (*realtime*) untuk persediaan obat dalam kondisi kritis (stok $\le$ 30% dari stok minimum).

### 🧮 3. Smart Restock Calculator
- Perhitungan kuantitas restock otomatis berdasarkan kebutuhan konsumsi harian (*Daily Usage*), batas minimum (*Min Stock*), dan batas maksimum (*Max Stock*).
- Penambahan stok otomatis ke data persediaan begitu pengajuan restock disetujui (*Disetujui*) atau distribusi diterima (*Diterima*).

### 📅 4. Header Kalender Interaktif
- Pemilih tanggal (*DatePickerButton*) terintegrasi di seluruh header halaman untuk pemantauan data berdasarkan tanggal yang dipilih dengan tombol reset 1-klik ke **Hari Ini**.

### 🔍 5. Pengurutan (Sorting) & Pencarian Canggih
- Pencarian cepat realtime berdasarkan Nama Obat, Kode Obat, maupun Kategori.
- Pengurutan multi-kolom (*Sort by Name, Stock, Stock Status, Expiry Date, FEFO Status*) melalui klik header tabel maupun dropdown Quick-Sort.

### 📥 6. Ekspor Data ke Excel (.xls)
- Fitur **Konversi xlsx** 100% Client-Side untuk mendownload data persediaan obat langsung ke file Microsoft Excel (`.xls`) dengan kolom terpisah rapi, header berwarna, dan lebar kolom otomatis.

---

## 🛠️ Teknologi & Framework

| Komponen | Teknologi |
| :--- | :--- |
| **Frontend Framework** | React 19 + Vite 8 |
| **Styling** | Tailwind CSS v4 |
| **Icons** | Lucide React |
| **Routing** | React Router v7 |
| **Charts & Analytics** | Recharts |
| **State Management** | React Context API + LocalStorage Persistence |

---

## 🚀 Panduan Memulai (Getting Started)

### Prasyarat
- [Node.js](https://nodejs.org/) (Versi 18 atau lebih baru)
- `npm` atau `yarn`

### Instalasi & Menjalankan Aplikasi

1. **Clone Repository**
   ```bash
   git clone https://github.com/G1ts-3/Healtech_MediStock.git
   cd Healtech_MediStock
   ```

2. **Checkout ke Branch Perubahan Terbaru**
   ```bash
   git checkout akmal
   ```

3. **Install Dependensi**
   ```bash
   npm install
   ```

4. **Jalankan Development Server**
   ```bash
   npm run dev
   ```

5. **Buka di Browser**
   Buka alamat local di browser Anda (misalnya `http://localhost:5173`).

---

## 📁 Struktur Direktori Project

```
Healtech_MediStock/
├── src/
│   ├── components/       # Komponen UI reusable (Navbar, Sidebar, DatePickerButton, dsb.)
│   ├── context/          # AppContext (State Management, Auto-Sync & Restock Logic)
│   ├── data/             # Mock Data (Obat, Distribusi, Restock, Supplier)
│   ├── pages/            # Halaman Web per Role (Admin, Gudang, Kepala Farmasi)
│   ├── App.jsx           # Routing & Layout Utama
│   └── main.jsx          # Entry point aplikasi
├── package.json
└── README.md
```

---

## 📝 Lisensi
Dikembangkan untuk sistem pengelolaan inventaris farmasi **Healtech MediStock**. Hak Cipta © 2026.
