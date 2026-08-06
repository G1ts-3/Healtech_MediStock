import { useApp } from '../../context/AppContext';
import { Calendar, ChevronDown, Package, CheckCircle, AlertTriangle, Clock, User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function KepalaDashboard() {
  const { medicines, stats, restockRequests, distributions, getStockStatus } = useApp();

  const today = new Date();
  const dateStr = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // Stock by category data
  const categoryData = medicines.reduce((acc, m) => {
    const cat = acc.find(c => c.name === m.category);
    const status = getStockStatus(m);
    if (cat) {
      cat[status] = (cat[status] || 0) + 1;
    } else {
      acc.push({ name: m.category, aman: status === 'aman' ? 1 : 0, menipis: status === 'menipis' ? 1 : 0, kritis: status === 'kritis' ? 1 : 0 });
    }
    return acc;
  }, []);

  const pendingRequests = restockRequests
    .filter(r => r.status === 'menunggu')
    .sort((a, b) => {
      const urgencyOrder = { kritis: 0, menipis: 1, normal: 2 };
      return (urgencyOrder[a.urgency] || 2) - (urgencyOrder[b.urgency] || 2);
    });

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <div className="mt-2">
            <h2 className="text-xl font-bold text-text">Selamat Datang, Kepala Farmasi</h2>
            <p className="text-sm text-gray-500">Ringkasan status persediaan dan permintaan yang memerlukan persetujuan.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-text">{dateStr}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Obat</p>
              <p className="text-xl font-bold text-text">{stats.totalMedicines}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Menunggu Persetujuan</p>
              <p className="text-xl font-bold text-text">{stats.pendingRestock}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-error" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Stok Kritis</p>
              <p className="text-xl font-bold text-error">{stats.stockKritis}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Distribusi Aktif</p>
              <p className="text-xl font-bold text-text">{stats.activeDistributions}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Stacked bar chart */}
        <div className="col-span-3 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-text mb-5">Status Stok per Kategori</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="aman" name="Aman" fill="#16A34A" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="menipis" name="Menipis" fill="#FFC107" stackId="a" />
              <Bar dataKey="kritis" name="Kritis" fill="#D8000C" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pending approvals */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-text mb-4">Permintaan Menunggu Persetujuan</h3>
          <div className="space-y-3">
            {pendingRequests.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">Tidak ada permintaan menunggu</p>
            ) : (
              pendingRequests.slice(0, 5).map(req => {
                const med = medicines.find(m => m.id === req.medicineId);
                return (
                  <div key={req.id} className="flex items-center justify-between border border-gray-100 rounded-xl p-3 hover:shadow-sm transition-shadow">
                    <div>
                      <p className="text-sm font-semibold text-text">{med?.name || req.medicineId}</p>
                      <p className="text-xs text-gray-400">{req.id} • {req.requestedQty} unit</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      req.urgency === 'kritis' ? 'bg-red-100 text-error' :
                      req.urgency === 'menipis' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-success'
                    }`}>
                      {req.urgency}
                    </span>
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
