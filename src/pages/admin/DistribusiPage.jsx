import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, ChevronDown, Truck, Package, CheckCircle2, Clock, ArrowRight, Search } from 'lucide-react';
import DatePickerButton from '../../components/common/DatePickerButton';

const statusConfig = {
  diproses: { label: 'Diproses', color: 'bg-yellow-100 text-yellow-700', icon: Clock, dotColor: 'bg-warning' },
  dikirim: { label: 'Dikirim', color: 'bg-blue-100 text-primary', icon: Truck, dotColor: 'bg-primary' },
  diterima: { label: 'Diterima', color: 'bg-green-100 text-success', icon: CheckCircle2, dotColor: 'bg-success' },
};

const statusOrder = ['diproses', 'dikirim', 'diterima'];

export default function DistribusiPage() {
  const { distributions, medicines, suppliers, updateDistributionStatus, currentRole } = useApp();
  const [filter, setFilter] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const today = new Date();
  const dateStr = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const filtered = distributions.filter(dist => {
    const med = medicines.find(m => m.id === dist.medicineId);
    const supplier = suppliers.find(s => s.id === dist.fromSupplier);
    const matchesFilter = filter === 'semua' || dist.status === filter;

    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      dist.id.toLowerCase().includes(query) ||
      dist.medicineId.toLowerCase().includes(query) ||
      (med && med.name.toLowerCase().includes(query)) ||
      (supplier && supplier.name.toLowerCase().includes(query)) ||
      dist.toUnit.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const getNextStatus = (current) => {
    const idx = statusOrder.indexOf(current);
    return idx < statusOrder.length - 1 ? statusOrder[idx + 1] : null;
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Tracking Distribusi</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau dan kelola status distribusi obat dari supplier ke gudang.</p>
        </div>
        <DatePickerButton />
      </div>

      {/* Filter tabs & Search bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {['semua', 'diproses', 'dikirim', 'diterima'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === tab
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab === 'semua' ? 'Semua' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="ml-1.5 text-xs opacity-70">
                ({tab === 'semua' ? distributions.length : distributions.filter(d => d.status === tab).length})
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID distribusi, nama obat, supplier, unit..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Distribution cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-10 text-center shadow-sm">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">Tidak ada data distribusi</p>
          </div>
        ) : (
          filtered.map(dist => {
            const med = medicines.find(m => m.id === dist.medicineId);
            const supplier = suppliers.find(s => s.id === dist.fromSupplier);
            const nextStatus = getNextStatus(dist.status);
            const isExpanded = expandedId === dist.id;
            const cfg = statusConfig[dist.status];

            return (
              <div key={dist.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : dist.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.color}`}>
                        <cfg.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text">{dist.id}</p>
                        <p className="text-xs text-gray-400">{med?.name || dist.medicineId} • {dist.quantity} unit</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      {(currentRole === 'gudang' || currentRole === 'admin') && nextStatus && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateDistributionStatus(dist.id, nextStatus);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          {statusConfig[nextStatus].label}
                        </button>
                      )}
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Status progress bar */}
                  <div className="flex items-center gap-2 mt-4">
                    {statusOrder.map((s, i) => {
                      const isCompleted = statusOrder.indexOf(dist.status) >= i;
                      return (
                        <div key={s} className="flex items-center gap-2 flex-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCompleted ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'
                          }`}>
                            {i + 1}
                          </div>
                          <span className={`text-xs ${isCompleted ? 'text-primary font-medium' : 'text-gray-400'}`}>
                            {statusConfig[s].label}
                          </span>
                          {i < statusOrder.length - 1 && (
                            <div className={`flex-1 h-0.5 ${isCompleted && statusOrder.indexOf(dist.status) > i ? 'bg-primary' : 'bg-gray-200'}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Expanded timeline */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-400">Supplier</p>
                        <p className="text-sm font-medium text-text">{supplier?.name || dist.fromSupplier}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Tujuan</p>
                        <p className="text-sm font-medium text-text">{dist.toUnit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Tanggal Request</p>
                        <p className="text-sm font-medium text-text">{new Date(dist.requestDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Jumlah</p>
                        <p className="text-sm font-medium text-text">{dist.quantity} unit</p>
                      </div>
                    </div>

                    {/* Timeline */}
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Timeline Status</h4>
                    <div className="relative pl-6">
                      <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />
                      {dist.statusUpdates.map((update, i) => (
                        <div key={i} className="relative flex items-start gap-3 pb-4 last:pb-0">
                          <div className={`absolute left-[-16px] w-3.5 h-3.5 rounded-full border-2 border-white ${statusConfig[update.status]?.dotColor || 'bg-gray-300'}`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-text">{statusConfig[update.status]?.label || update.status}</span>
                              <span className="text-xs text-gray-400">{update.date} {update.time}</span>
                            </div>
                            <p className="text-xs text-gray-400">oleh {update.updatedBy}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
