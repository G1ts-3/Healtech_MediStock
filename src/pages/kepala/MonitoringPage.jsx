import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, ChevronDown, Search, SortAsc, SortDesc } from 'lucide-react';
import DatePickerButton from '../../components/common/DatePickerButton';

export default function MonitoringPage() {
  const { medicines, getStockStatus, getFEFOStatus, getDaysUntilStockout, suppliers } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [filterCategory, setFilterCategory] = useState('semua');
  const [sortField, setSortField] = useState('daysLeft');
  const [sortDir, setSortDir] = useState('asc');

  const categories = [...new Set(medicines.map(m => m.category))];

  let filtered = medicines.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'semua' || getStockStatus(m) === filterStatus;
    const matchCategory = filterCategory === 'semua' || m.category === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  // Sort
  filtered = [...filtered].sort((a, b) => {
    let valA, valB;
    if (sortField === 'daysLeft') {
      valA = getDaysUntilStockout(a);
      valB = getDaysUntilStockout(b);
    } else if (sortField === 'stock') {
      valA = a.currentStock;
      valB = b.currentStock;
    } else if (sortField === 'name') {
      valA = a.name;
      valB = b.name;
    }
    if (typeof valA === 'string') return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    return sortDir === 'asc' ? valA - valB : valB - valA;
  });

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = sortDir === 'asc' ? SortAsc : SortDesc;

  const getStatusBadge = (status) => {
    if (status === 'kritis') return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-error"><span className="w-2 h-2 rounded-full bg-error" />Kritis</span>;
    if (status === 'menipis') return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700"><span className="w-2 h-2 rounded-full bg-warning" />Menipis</span>;
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-success"><span className="w-2 h-2 rounded-full bg-success" />Aman</span>;
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Monitoring Stok</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau seluruh status persediaan obat dan estimasi waktu habis.</p>
        </div>
        <DatePickerButton />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari obat..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
        >
          <option value="semua">Semua Status</option>
          <option value="kritis">Kritis</option>
          <option value="menipis">Menipis</option>
          <option value="aman">Aman</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
        >
          <option value="semua">Semua Kategori</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Kode</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 cursor-pointer select-none" onClick={() => toggleSort('name')}>
                <span className="flex items-center gap-1">Nama Obat {sortField === 'name' && <SortIcon className="w-3.5 h-3.5" />}</span>
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Kategori</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 cursor-pointer select-none" onClick={() => toggleSort('stock')}>
                <span className="flex items-center gap-1">Stok {sortField === 'stock' && <SortIcon className="w-3.5 h-3.5" />}</span>
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 cursor-pointer select-none" onClick={() => toggleSort('daysLeft')}>
                <span className="flex items-center gap-1">Est. Habis {sortField === 'daysLeft' && <SortIcon className="w-3.5 h-3.5" />}</span>
              </th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status Stok</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Supplier</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(med => {
              const status = getStockStatus(med);
              const daysLeft = getDaysUntilStockout(med);
              const supplier = suppliers.find(s => s.id === med.supplier);

              return (
                <tr key={med.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${status === 'kritis' ? 'bg-red-50/30' : ''}`}>
                  <td className="px-6 py-4 text-sm text-gray-500">{med.id}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-text">{med.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{med.category}</td>
                  <td className="px-4 py-4">
                    <div>
                      <span className="text-sm font-medium text-text">{med.currentStock} {med.unit}</span>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className={`h-1.5 rounded-full transition-all ${status === 'kritis' ? 'bg-error' : status === 'menipis' ? 'bg-warning' : 'bg-success'}`}
                          style={{ width: `${Math.min((med.currentStock / med.maxStock) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-sm font-bold ${daysLeft <= 3 ? 'text-error' : daysLeft <= 7 ? 'text-warning' : 'text-success'}`}>
                      {daysLeft} hari
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">{getStatusBadge(status)}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{supplier?.name || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
