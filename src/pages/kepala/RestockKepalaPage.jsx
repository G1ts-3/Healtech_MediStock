import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, ChevronDown, Check, X, MessageSquare, Search } from 'lucide-react';
import DatePickerButton from '../../components/common/DatePickerButton';

export default function RestockKepalaPage() {
  const { medicines, restockRequests, updateRestockStatus, getDaysUntilStockout, getStockStatus, getFEFOStatus } = useApp();
  const [filterStatus, setFilterStatus] = useState('menunggu');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('category');
  const [sortDir, setSortDir] = useState('asc');
  const [noteModal, setNoteModal] = useState(null);
  const [noteText, setNoteText] = useState('');

  const filtered = restockRequests
    .filter(r => {
      if (filterStatus !== 'semua' && r.status !== filterStatus) return false;
      const med = medicines.find(m => m.id === r.medicineId);
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const medName = (med?.name || '').toLowerCase();
        const medCat = (med?.category || '').toLowerCase();
        const medCode = (med?.id || '').toLowerCase();
        const reqId = r.id.toLowerCase();
        if (!medName.includes(q) && !medCat.includes(q) && !medCode.includes(q) && !reqId.includes(q)) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      const medA = medicines.find(m => m.id === a.medicineId);
      const medB = medicines.find(m => m.id === b.medicineId);

      let valA, valB;
      if (sortField === 'category') {
        valA = (medA?.category || '').toLowerCase();
        valB = (medB?.category || '').toLowerCase();
        return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (sortField === 'name') {
        valA = (medA?.name || '').toLowerCase();
        valB = (medB?.name || '').toLowerCase();
        return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (sortField === 'fefoStatus') {
        const order = { kritis: 0, warning: 1, aman: 2 };
        valA = medA ? (order[getFEFOStatus?.(medA)] ?? 2) : 2;
        valB = medB ? (order[getFEFOStatus?.(medB)] ?? 2) : 2;
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }
      if (sortField === 'stockStatus') {
        const order = { kritis: 0, menipis: 1, aman: 2 };
        valA = medA ? (order[getStockStatus(medA)] ?? 2) : 2;
        valB = medB ? (order[getStockStatus(medB)] ?? 2) : 2;
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }
      if (sortField === 'stock') {
        valA = medA ? Number(medA.currentStock) : 0;
        valB = medB ? Number(medB.currentStock) : 0;
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }
      if (sortField === 'expiryDate') {
        valA = medA ? new Date(medA.expiryDate).getTime() : 0;
        valB = medB ? new Date(medB.expiryDate).getTime() : 0;
        return sortDir === 'asc' ? valA - valB : valB - valA;
      }
      if (sortField === 'id') {
        valA = a.id.toLowerCase();
        valB = b.id.toLowerCase();
        return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      const urgencyOrder = { kritis: 0, menipis: 1, normal: 2 };
      return (urgencyOrder[a.urgency] || 2) - (urgencyOrder[b.urgency] || 2);
    });

  const handleApprove = (requestId) => {
    updateRestockStatus(requestId, 'disetujui', noteText || 'Disetujui oleh Kepala Farmasi');
    setNoteModal(null);
    setNoteText('');
  };

  const handleReject = (requestId) => {
    if (!noteText.trim()) {
      setNoteModal({ id: requestId, action: 'reject' });
      return;
    }
    updateRestockStatus(requestId, 'ditolak', noteText);
    setNoteModal(null);
    setNoteText('');
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Persetujuan Restock</h1>
          <p className="text-sm text-gray-500 mt-1">Setujui atau tolak permintaan restock berdasarkan tingkat urgensi dan kategori obat.</p>
        </div>
        <DatePickerButton />
      </div>

      <div className="flex gap-2 flex-wrap">
        {['menunggu', 'disetujui', 'ditolak', 'semua'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === tab
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className="ml-1.5 text-xs opacity-70">
              ({tab === 'semua' ? restockRequests.length : restockRequests.filter(r => r.status === tab).length})
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
            <option value="category-asc">Urutkan: Kategori (A - Z)</option>
            <option value="category-desc">Urutkan: Kategori (Z - A)</option>
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
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">ID</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Obat</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Qty</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Diajukan</th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Urgensi</th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">Tidak ada data yang sesuai filter</td></tr>
            ) : (
              filtered.map(req => {
                const med = medicines.find(m => m.id === req.medicineId);
                const daysLeft = med ? getDaysUntilStockout(med) : '-';

                return (
                  <tr key={req.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${req.urgency === 'kritis' ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">{req.id}</td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-text">{med?.name || req.medicineId}</p>
                      <p className="text-xs text-gray-400">
                        {med?.category ? `${med.category} • ` : ''}Sisa stok: {med?.currentStock || 0} {med?.unit || ''} • Est. habis: {daysLeft} hari
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-text">{req.requestedQty}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{new Date(req.createdAt).toLocaleDateString('id-ID')}</td>
                    <td className="px-4 py-4 text-center">
                      {(() => {
                        const currentUrgency = med ? getStockStatus(med) : req.urgency;
                        return (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            currentUrgency === 'kritis' ? 'bg-red-100 text-error' :
                            currentUrgency === 'menipis' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-success'
                          }`}>
                            {currentUrgency}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        req.status === 'menunggu' ? 'bg-yellow-100 text-yellow-700' :
                        req.status === 'disetujui' ? 'bg-green-100 text-success' :
                        'bg-red-100 text-error'
                      }`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {req.status === 'menunggu' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-success text-white text-xs font-medium rounded-lg hover:bg-success/90 transition-colors shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Setuju
                          </button>
                          <button
                            onClick={() => setNoteModal({ id: req.id, action: 'reject' })}
                            className="flex items-center gap-1 px-3 py-1.5 bg-error text-white text-xs font-medium rounded-lg hover:bg-error/90 transition-colors shadow-sm"
                          >
                            <X className="w-3.5 h-3.5" />
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">{req.notes}</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>

      {noteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-bold text-text">
                {noteModal.action === 'reject' ? 'Alasan Penolakan' : 'Catatan'}
              </h3>
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Tulis catatan atau alasan..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light h-24 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setNoteModal(null); setNoteText(''); }}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (noteModal.action === 'reject') {
                    updateRestockStatus(noteModal.id, 'ditolak', noteText || 'Ditolak oleh Kepala Farmasi');
                  } else {
                    handleApprove(noteModal.id);
                  }
                  setNoteModal(null);
                  setNoteText('');
                }}
                className={`flex-1 py-2.5 text-white text-sm font-medium rounded-lg transition-colors shadow-md ${
                  noteModal.action === 'reject' ? 'bg-error hover:bg-error/90' : 'bg-success hover:bg-success/90'
                }`}
              >
                {noteModal.action === 'reject' ? 'Tolak' : 'Setujui'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
