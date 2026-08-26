import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, ChevronDown, Plus, FileSpreadsheet, Trash2, Eye, X, Search, SortAsc, SortDesc, ArrowUpDown } from 'lucide-react';
import DatePickerButton from '../../components/common/DatePickerButton';

export default function DataObatPage() {
  const { medicines, addMedicine, updateMedicine, deleteMedicine, getStockStatus, getFEFOStatus, suppliers } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [detailMedicine, setDetailMedicine] = useState(null);

  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const today = new Date();
  const dateStr = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const filtered = medicines.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let valA, valB;
    if (sortField === 'name') {
      valA = a.name.toLowerCase();
      valB = b.name.toLowerCase();
      return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (sortField === 'id') {
      valA = a.id.toLowerCase();
      valB = b.id.toLowerCase();
      return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (sortField === 'stock') {
      valA = Number(a.currentStock);
      valB = Number(b.currentStock);
      return sortDir === 'asc' ? valA - valB : valB - valA;
    }
    if (sortField === 'stockStatus') {
      const order = { kritis: 0, menipis: 1, aman: 2 };
      valA = order[getStockStatus(a)] ?? 2;
      valB = order[getStockStatus(b)] ?? 2;
      return sortDir === 'asc' ? valA - valB : valB - valA;
    }
    if (sortField === 'expiryDate') {
      valA = new Date(a.expiryDate).getTime();
      valB = new Date(b.expiryDate).getTime();
      return sortDir === 'asc' ? valA - valB : valB - valA;
    }
    if (sortField === 'fefoStatus') {
      const fefoOrder = { kritis: 0, warning: 1, aman: 2 };
      valA = fefoOrder[getFEFOStatus(a)] ?? 2;
      valB = fefoOrder[getFEFOStatus(b)] ?? 2;
      return sortDir === 'asc' ? valA - valB : valB - valA;
    }
    return 0;
  });

  // style buat xls
  const handleExportCSV = () => {
    const headers = [
      'Kode Obat',
      'Nama Obat',
      'Kategori Obat',
      'No Batch',
      'Stok Sisa',
      'Satuan',
      'Status Stok',
      'Stok Minimum',
      'Stok Maksimum',
      'Pemakaian Harian',
      'Harga Satuan (Rp)',
      'Tanggal Kadaluarsa',
      'Status FEFO'
    ];

    let tableHTML = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"/><style>
      table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
      th { background-color: #185FA5; color: #ffffff; border: 1px solid #cccccc; padding: 10px; text-align: left; font-weight: bold; }
      td { border: 1px solid #cccccc; padding: 8px; text-align: left; }
      tr:nth-child(even) { background-color: #f8fafc; }
    </style></head><body><table><thead><tr>`;

    headers.forEach(h => {
      tableHTML += `<th>${h}</th>`;
    });
    tableHTML += `</tr></thead><tbody>`;

    sorted.forEach(med => {
      tableHTML += `<tr>
        <td>${med.id}</td>
        <td>${med.name}</td>
        <td>${med.category}</td>
        <td>${med.batchNumber}</td>
        <td>${med.currentStock}</td>
        <td>${med.unit}</td>
        <td>${getStockStatus(med).toUpperCase()}</td>
        <td>${med.minStock}</td>
        <td>${med.maxStock}</td>
        <td>${med.dailyUsage}</td>
        <td>${med.unitPrice}</td>
        <td>${med.expiryDate}</td>
        <td>${getFEFOStatus(med).toUpperCase()}</td>
      </tr>`;
    });

    tableHTML += `</tbody></table></body></html>`;

    const blob = new Blob(['\uFEFF' + tableHTML], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Data_Obat_MediStock_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortDir === 'asc'
      ? <SortAsc className="w-3.5 h-3.5 text-primary font-bold" />
      : <SortDesc className="w-3.5 h-3.5 text-primary font-bold" />;
  };

  const getFEFOLabel = (status) => {
    if (status === 'kritis') return { text: 'KRITIS', cls: 'bg-red-100 text-error' };
    if (status === 'warning') return { text: 'WARNING', cls: 'bg-yellow-100 text-yellow-700' };
    return { text: 'Aman', cls: 'bg-green-100 text-success' };
  };

  const handleAdd = () => {
    setEditingMedicine(null);
    setShowModal(true);
  };

  const handleEdit = (med) => {
    setEditingMedicine(med);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    deleteMedicine(id);
    setDeleteConfirm(null);
  };

  const handleSave = (formData) => {
    if (editingMedicine) {
      updateMedicine(editingMedicine.id, formData);
    } else {
      addMedicine({
        ...formData,
        monthlyUsageHistory: Array(12).fill(Math.floor(formData.dailyUsage * 30)),
      });
    }
    setShowModal(false);
    setEditingMedicine(null);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Monitoring Stok</h1>
          <div className="mt-2">
            <h2 className="text-lg font-bold text-text">Monitoring Persediaan Obat & FEFO Priority</h2>
            <p className="text-sm text-gray-500">Pantau status persediaan dan tingkat prioritas kadaluarsa secara terintegrasi.</p>
          </div>
        </div>
        <DatePickerButton />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Total Jenis Obat</p>
          <p className="text-2xl font-bold text-text">{medicines.length.toLocaleString('id-ID')} <span className="text-sm font-normal text-gray-400">Item</span></p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1"><span className="w-2.5 h-2.5 rounded-full bg-success" /><p className="text-xs text-success font-medium">Stok Aman</p></div>
          <p className="text-2xl font-bold text-text">{medicines.filter(m => getStockStatus(m) === 'aman').length.toLocaleString('id-ID')} <span className="text-sm font-normal text-gray-400">Item</span></p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1"><span className="w-2.5 h-2.5 rounded-full bg-warning" /><p className="text-xs text-warning font-medium">Menipis / Warning</p></div>
          <p className="text-2xl font-bold text-text">{medicines.filter(m => getStockStatus(m) === 'menipis').length.toLocaleString('id-ID')} <span className="text-sm font-normal text-gray-400">Item</span></p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1"><span className="w-2.5 h-2.5 rounded-full bg-error" /><p className="text-xs text-error font-medium">Kadaluarsa</p></div>
          <p className="text-2xl font-bold text-text">{medicines.filter(m => getFEFOStatus(m) === 'kritis').length.toLocaleString('id-ID')} <span className="text-sm font-normal text-gray-400">Item</span></p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama obat, kode, kategori..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
            />
          </div>
          <select
            value={`${sortField}-${sortDir}`}
            onChange={(e) => {
              const [field, dir] = e.target.value.split('-');
              setSortField(field);
              setSortDir(dir);
            }}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-light shrink-0 cursor-pointer"
          >
            <option value="name-asc">Urutkan: Nama (A - Z)</option>
            <option value="name-desc">Urutkan: Nama (Z - A)</option>
            <option value="fefoStatus-asc">Urutkan: Status FEFO (Kritis Dahulu)</option>
            <option value="stockStatus-asc">Urutkan: Status Stok (Kritis Dahulu)</option>
            <option value="stock-asc">Urutkan: Stok (Terkecil)</option>
            <option value="stock-desc">Urutkan: Stok (Terbanyak)</option>
            <option value="expiryDate-asc">Urutkan: Exp Date (Terdekat)</option>
            <option value="id-asc">Urutkan: Kode Obat</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-secondary text-white text-sm font-medium rounded-lg hover:bg-secondary/90 transition-colors shadow-sm">
            <FileSpreadsheet className="w-4 h-4" />
            Konversi xlsx
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-text text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Obat
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3 cursor-pointer select-none group" onClick={() => handleSort('id')}>
                <div className="flex items-center gap-1.5">Kode Obat {renderSortIcon('id')}</div>
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 cursor-pointer select-none group" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1.5">Nama Obat {renderSortIcon('name')}</div>
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">No Batch</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 cursor-pointer select-none group" onClick={() => handleSort('stock')}>
                <div className="flex items-center gap-1.5">Stok Sisa {renderSortIcon('stock')}</div>
              </th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 cursor-pointer select-none group" onClick={() => handleSort('stockStatus')}>
                <div className="flex items-center justify-center gap-1.5">Status Stok {renderSortIcon('stockStatus')}</div>
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 cursor-pointer select-none group" onClick={() => handleSort('expiryDate')}>
                <div className="flex items-center gap-1.5">Exp Date {renderSortIcon('expiryDate')}</div>
              </th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 cursor-pointer select-none group" onClick={() => handleSort('fefoStatus')}>
                <div className="flex items-center justify-center gap-1.5">Status FEFO {renderSortIcon('fefoStatus')}</div>
              </th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((med) => {
              const stockStatus = getStockStatus(med);
              const fefoStatus = getFEFOStatus(med);
              const fefo = getFEFOLabel(fefoStatus);
              const expDate = new Date(med.expiryDate);
              const expDateStr = expDate.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
              const expColor = fefoStatus === 'kritis' ? 'text-error' : fefoStatus === 'warning' ? 'text-warning' : 'text-success';

              return (
                <tr key={med.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">{med.id}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-text">{med.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{med.batchNumber}</td>
                  <td className="px-4 py-4 text-sm font-medium text-text">{med.currentStock} {med.unit}</td>
                  <td className="px-4 py-4 text-center">
                    {stockStatus === 'kritis' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-error">
                        <span className="w-2 h-2 rounded-full bg-error" />Kritis
                      </span>
                    ) : stockStatus === 'menipis' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        <span className="w-2 h-2 rounded-full bg-warning" />Menipis
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-success">
                        <span className="w-2 h-2 rounded-full bg-success" />Aman
                      </span>
                    )}
                  </td>
                  <td className={`px-4 py-4 text-sm font-semibold ${expColor}`}>{expDateStr}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${fefo.cls}`}>
                      <span className={`w-2 h-2 rounded-full ${fefoStatus === 'kritis' ? 'bg-error' : fefoStatus === 'warning' ? 'bg-warning' : 'bg-success'}`} />
                      {fefo.text}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => setDetailMedicine(med)}
                      className="text-sm text-primary hover:text-primary-dark font-medium hover:underline transition-colors"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detailMedicine && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setDetailMedicine(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-text">Detail Obat</h3>
              <button onClick={() => setDetailMedicine(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              {[
                ['Kode', detailMedicine.id],
                ['Nama', detailMedicine.name],
                ['Kategori', detailMedicine.category],
                ['Batch', detailMedicine.batchNumber],
                ['Stok', `${detailMedicine.currentStock} ${detailMedicine.unit}`],
                ['Status Stok', getStockStatus(detailMedicine).toUpperCase()],
                ['Min Stok', detailMedicine.minStock],
                ['Maks Stok', detailMedicine.maxStock],
                ['Pemakaian Harian', `${detailMedicine.dailyUsage} ${detailMedicine.unit}/hari`],
                ['Kadaluarsa', new Date(detailMedicine.expiryDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })],
                ['Harga Satuan', `Rp ${detailMedicine.unitPrice.toLocaleString('id-ID')}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-medium text-text">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => { handleEdit(detailMedicine); setDetailMedicine(null); }} className="flex-1 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors">
                Edit
              </button>
              <button onClick={() => { setDeleteConfirm(detailMedicine.id); setDetailMedicine(null); }} className="flex-1 py-2 bg-error text-white text-sm font-medium rounded-lg hover:bg-error/90 transition-colors">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <MedicineFormModal
          medicine={editingMedicine}
          suppliers={suppliers}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingMedicine(null); }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && deleteConfirm !== 'bulk' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-error" />
            </div>
            <h3 className="text-lg font-bold text-text mb-2">Hapus Obat?</h3>
            <p className="text-sm text-gray-500 mb-5">Data obat yang dihapus tidak dapat dikembalikan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">Batal</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2 bg-error text-white text-sm font-medium rounded-lg hover:bg-error/90 transition-colors">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Medicine Form Modal Component */
function MedicineFormModal({ medicine, suppliers, onSave, onClose }) {
  const [form, setForm] = useState({
    name: medicine?.name || '',
    category: medicine?.category || 'Analgesik',
    unit: medicine?.unit || 'Tablet',
    currentStock: medicine?.currentStock || 0,
    minStock: medicine?.minStock || 100,
    maxStock: medicine?.maxStock || 1000,
    dailyUsage: medicine?.dailyUsage || 10,
    seasonalMultiplier: medicine?.seasonalMultiplier || 1.0,
    expiryDate: medicine?.expiryDate || '',
    batchNumber: medicine?.batchNumber || '',
    supplier: medicine?.supplier || 'SUP-001',
    unitPrice: medicine?.unitPrice || 0,
  });
  const [errors, setErrors] = useState({});

  const categories = ['Analgesik', 'Antibiotik', 'Kardiovaskular', 'Antidiabetik', 'Gastrointestinal', 'Antihistamin', 'Kortikosteroid', 'Vitamin', 'Respiratori', 'Sedatif', 'Antiemetik', 'Diuretik', 'Antifungal'];
  const units = ['Tablet', 'Kapsul', 'Strip', 'Botol', 'Vial', 'Pcs'];

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nama obat wajib diisi';
    if (!form.batchNumber.trim()) errs.batchNumber = 'No batch wajib diisi';
    if (!form.expiryDate) errs.expiryDate = 'Tanggal kadaluarsa wajib diisi';
    if (form.currentStock < 0) errs.currentStock = 'Stok tidak valid';
    if (form.unitPrice <= 0) errs.unitPrice = 'Harga harus lebih dari 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        ...form,
        currentStock: Number(form.currentStock),
        minStock: Number(form.minStock),
        maxStock: Number(form.maxStock),
        dailyUsage: Number(form.dailyUsage),
        seasonalMultiplier: Number(form.seasonalMultiplier),
        unitPrice: Number(form.unitPrice),
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-text">{medicine ? 'Edit Obat' : 'Tambah Obat Baru'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nama Obat *</label>
              <input value={form.name} onChange={(e) => handleChange('name', e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light ${errors.name ? 'border-error' : 'border-gray-200'}`} />
              {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Kategori</label>
              <select value={form.category} onChange={(e) => handleChange('category', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">No Batch *</label>
              <input value={form.batchNumber} onChange={(e) => handleChange('batchNumber', e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light ${errors.batchNumber ? 'border-error' : 'border-gray-200'}`} />
              {errors.batchNumber && <p className="text-xs text-error mt-1">{errors.batchNumber}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Satuan</label>
              <select value={form.unit} onChange={(e) => handleChange('unit', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light">
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Stok Saat Ini</label>
              <input type="number" value={form.currentStock} onChange={(e) => handleChange('currentStock', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Stok Minimum</label>
              <input type="number" value={form.minStock} onChange={(e) => handleChange('minStock', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal Kadaluarsa *</label>
              <input type="date" value={form.expiryDate} onChange={(e) => handleChange('expiryDate', e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light ${errors.expiryDate ? 'border-error' : 'border-gray-200'}`} />
              {errors.expiryDate && <p className="text-xs text-error mt-1">{errors.expiryDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Pemakaian Harian</label>
              <input type="number" value={form.dailyUsage} onChange={(e) => handleChange('dailyUsage', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Harga Satuan (Rp) *</label>
              <input type="number" value={form.unitPrice} onChange={(e) => handleChange('unitPrice', e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light ${errors.unitPrice ? 'border-error' : 'border-gray-200'}`} />
              {errors.unitPrice && <p className="text-xs text-error mt-1">{errors.unitPrice}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Supplier</label>
              <select value={form.supplier} onChange={(e) => handleChange('supplier', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light">
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">Batal</button>
            <button type="submit" className="flex-1 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-md">{medicine ? 'Simpan Perubahan' : 'Tambah Obat'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
