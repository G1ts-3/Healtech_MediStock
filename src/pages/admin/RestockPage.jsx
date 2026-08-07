import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, ChevronDown, AlertTriangle, Volume2, VolumeX, Search, SendHorizonal } from 'lucide-react';
import DatePickerButton from '../../components/common/DatePickerButton';

export default function RestockPage() {
  const { medicines, getStockStatus, getDaysUntilStockout, getRecommendedQty, createRestockRequest, restockRequests, suppliers } = useApp();
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [seasonal, setSeasonal] = useState(false);
  const [requestQty, setRequestQty] = useState('');
  const [notes, setNotes] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const audioRef = useRef(null);

  const today = new Date();
  const dateStr = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const kritisItems = medicines.filter(m => getStockStatus(m) === 'kritis');

  // Clinical Alert Audio
  useEffect(() => {
    if (audioEnabled && kritisItems.length > 0) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const beep = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.value = 0.1;
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      };
      beep();
      const interval = setInterval(beep, 3000);
      return () => { clearInterval(interval); ctx.close(); };
    }
  }, [audioEnabled, kritisItems.length]);

  const handleSelect = (med) => {
    setSelectedMedicine(med);
    const rec = getRecommendedQty(med, seasonal);
    setRequestQty(Math.max(rec, 0).toString());
  };

  const handleSubmit = () => {
    if (!selectedMedicine || !requestQty) return;
    createRestockRequest(selectedMedicine.id, Number(requestQty), notes);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setSelectedMedicine(null);
    setRequestQty('');
    setNotes('');
  };

  const filteredMeds = medicines.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Permintaan Restock & Smart Calculator</h1>
          <p className="text-sm text-gray-500 mt-1">Hitung rekomendasi pengadaan barang secara otomatis dan kelola pengajuan ke Kepala Farmasi</p>
        </div>
        <DatePickerButton />
      </div>

      {/* Clinical Alert Banner */}
      {kritisItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 clinical-alert-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-error" />
              <div>
                <p className="text-sm font-semibold text-error">Clinical Alert Mode</p>
                <p className="text-xs text-red-600">{kritisItems.length} obat dalam kondisi stok KRITIS — segera lakukan restock!</p>
              </div>
            </div>
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-2 rounded-lg transition-colors ${audioEnabled ? 'bg-error text-white' : 'bg-red-100 text-error hover:bg-red-200'}`}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Success toast */}
      {showSuccess && (
        <div className="fixed top-6 right-6 bg-success text-white px-5 py-3 rounded-xl shadow-lg z-50 text-sm font-medium animate-[fadeIn_0.3s_ease]">
          ✓ Permintaan restock berhasil diajukan!
        </div>
      )}

      {/* Two-panel layout */}
      <div className="grid grid-cols-2 gap-6 items-start">
        {/* Left panel - Calculator */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 self-start">
          <h3 className="text-base font-bold text-primary border-b-2 border-primary pb-2 mb-5">Smart Restock Calculator</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pilih Obat</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari obat..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                />
              </div>
              {searchQuery && (
                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-100 rounded-lg">
                  {filteredMeds.map(m => (
                    <button
                      key={m.id}
                      onClick={() => { handleSelect(m); setSearchQuery(m.name); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-primary-light/10 transition-colors flex items-center justify-between ${
                        selectedMedicine?.id === m.id ? 'bg-primary-light/10' : ''
                      }`}
                    >
                      <span>{m.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        getStockStatus(m) === 'kritis' ? 'bg-red-100 text-error' :
                        getStockStatus(m) === 'menipis' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-success'
                      }`}>
                        {m.currentStock} {m.unit}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedMedicine && (
              <>
                {/* Scenario toggle */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Skenario Pemakaian</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSeasonal(false); setRequestQty(Math.max(getRecommendedQty(selectedMedicine, false), 0).toString()); }}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!seasonal ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      Normal
                    </button>
                    <button
                      onClick={() => { setSeasonal(true); setRequestQty(Math.max(getRecommendedQty(selectedMedicine, true), 0).toString()); }}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${seasonal ? 'bg-warning text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      Musiman (×{selectedMedicine.seasonalMultiplier})
                    </button>
                  </div>
                </div>

                {/* Calculation results */}
                <div className="bg-tertiary-light rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Stok Saat Ini</span>
                    <span className="font-semibold">{selectedMedicine.currentStock} {selectedMedicine.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Pemakaian/Hari</span>
                    <span className="font-semibold">{seasonal ? (selectedMedicine.dailyUsage * selectedMedicine.seasonalMultiplier).toFixed(1) : selectedMedicine.dailyUsage} {selectedMedicine.unit}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Estimasi Habis</span>
                    <span className={`font-bold ${getDaysUntilStockout(selectedMedicine, seasonal) <= 3 ? 'text-error' : getDaysUntilStockout(selectedMedicine, seasonal) <= 7 ? 'text-warning' : 'text-success'}`}>
                      {getDaysUntilStockout(selectedMedicine, seasonal)} hari
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-blue-200 pt-3">
                    <span className="text-gray-500">Rekomendasi Restock</span>
                    <span className="font-bold text-primary">{Math.max(getRecommendedQty(selectedMedicine, seasonal), 0)} {selectedMedicine.unit}</span>
                  </div>
                </div>

                {/* Request form */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Jumlah Permintaan</label>
                  <input
                    type="number"
                    value={requestQty}
                    onChange={(e) => setRequestQty(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Catatan</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan tambahan..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light h-20 resize-none"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <SendHorizonal className="w-4 h-4" />
                  Ajukan Permintaan Restock
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right panel - Pending Requests */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-text mb-5">Riwayat Permintaan Restock</h3>

          <div className="space-y-3">
            {restockRequests.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">Belum ada permintaan restock</p>
            ) : (
              restockRequests.slice().reverse().map(req => {
                const med = medicines.find(m => m.id === req.medicineId);
                return (
                  <div key={req.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-text">{med?.name || req.medicineId}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{req.id} • {new Date(req.createdAt).toLocaleDateString('id-ID')}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        req.status === 'menunggu' ? 'bg-yellow-100 text-yellow-700' :
                        req.status === 'disetujui' ? 'bg-green-100 text-success' :
                        'bg-red-100 text-error'
                      }`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500">Qty: <strong>{req.requestedQty}</strong></span>
                      {(() => {
                        const currentUrgency = med ? getStockStatus(med) : req.urgency;
                        return (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            currentUrgency === 'kritis' ? 'bg-red-100 text-error' :
                            currentUrgency === 'menipis' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-success'
                          }`}>
                            {currentUrgency}
                          </span>
                        );
                      })()}
                    </div>
                    {req.notes && <p className="text-xs text-gray-400 mt-2 italic">{req.notes}</p>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
