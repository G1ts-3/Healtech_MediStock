import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, ChevronDown, Check, X, MessageSquare } from 'lucide-react';
import DatePickerButton from '../../components/common/DatePickerButton';

export default function RestockKepalaPage() {
  const { medicines, restockRequests, updateRestockStatus, getDaysUntilStockout, getStockStatus, getRecommendedQty, suppliers } = useApp();
  const [filterStatus, setFilterStatus] = useState('menunggu');
  const [noteModal, setNoteModal] = useState(null);
  const [noteText, setNoteText] = useState('');

  const filtered = restockRequests
    .filter(r => filterStatus === 'semua' || r.status === filterStatus)
    .sort((a, b) => {
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
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Persetujuan Restock</h1>
          <p className="text-sm text-gray-500 mt-1">Setujui atau tolak permintaan restock berdasarkan tingkat urgensi.</p>
        </div>
        <DatePickerButton />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
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

      {/* Requests table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
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
              <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">Tidak ada data</td></tr>
            ) : (
              filtered.map(req => {
                const med = medicines.find(m => m.id === req.medicineId);
                const daysLeft = med ? getDaysUntilStockout(med) : '-';

                return (
                  <tr key={req.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${req.urgency === 'kritis' ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">{req.id}</td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-text">{med?.name || req.medicineId}</p>
                      <p className="text-xs text-gray-400">Sisa stok: {med?.currentStock || 0} {med?.unit || ''} • Est. habis: {daysLeft} hari</p>
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

      {/* Note modal for rejection */}
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
