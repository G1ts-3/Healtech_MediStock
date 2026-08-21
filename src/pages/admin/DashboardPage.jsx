import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, ChevronDown, Package, CheckCircle, AlertTriangle, XCircle, User } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import DatePickerButton from '../../components/common/DatePickerButton';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export default function AdminDashboard() {
  const { medicines, stats, notifications, getStockStatus, getFEFOStatus, restockRequests, distributions } = useApp();
  const [chartRange, setChartRange] = useState('7');

  const today = new Date();
  const dateStr = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // Generate usage trend data
  const generateChartData = () => {
    const totalByMonth = months.map((month, idx) => {
      const total = medicines.reduce((sum, m) => sum + (m.monthlyUsageHistory[idx] || 0), 0);
      return { name: `${20 + idx} Mei`, total };
    });
    // Show last N data points based on range
    const count = chartRange === '7' ? 7 : chartRange === '14' ? 12 : 12;
    return totalByMonth.slice(0, count);
  };

  // Build activities from notifications + static data
  const activities = [
    { time: '10:30', type: 'Stok Kritis', detail: 'Paracetamol 500mg stok tersisa 15 unit', by: 'Admin Farmasi', typeClass: 'bg-red-100 text-error' },
    { time: '09:15', type: 'Kadaluarsa', detail: 'Amoxicillin 500mg akan kadaluarsa dalam 15 hari', by: 'Sistem', typeClass: 'bg-yellow-100 text-yellow-700' },
    { time: 'Kemarin 16:45', type: 'Restock', detail: 'Permintaan restock #RST-1021 disetujui', by: 'Admin Farmasi', typeClass: 'bg-blue-100 text-primary' },
    { time: 'Kemarin 11:20', type: 'Distribusi', detail: 'Distribusi #DST-7789 telah tiba di gudang', by: 'Gudang Farmasi', typeClass: 'bg-green-100 text-secondary' },
    { time: '24 Mei 14:10', type: 'Data Obat', detail: 'Data obat Ibuprofen 400mg diperbarui', by: 'Admin Farmasi', typeClass: 'bg-purple-100 text-purple-600' },
  ];

  // Quick notifications (merged with AppContext notifications and fallback notifications)
  const defaultNotifs = [
    { type: 'Restock', title: 'Permintaan restock #RST-1021', detail: 'Telah disetujui oleh Kepala Farmasi', time: '09:00', by: 'Kepala Farmasi', typeClass: 'bg-blue-100 text-primary' },
    { type: 'Distribusi', title: 'Distribusi obat #DST-7789', detail: 'Obat telah tiba di Gudang Utama', time: '08:30', by: 'Staff Gudang', typeClass: 'bg-green-100 text-secondary' },
    { type: 'Stok Kritis', title: 'Paracetamol 500mg', detail: 'Stok kritis (tersisa 15 unit)', time: '07:45', by: 'Sistem', typeClass: 'bg-red-100 text-error' },
    { type: 'Kadaluarsa', title: 'Amoxicillin 500mg', detail: 'Akan kadaluarsa dalam 15 hari', time: 'Kemarin', by: 'Sistem', typeClass: 'bg-yellow-100 text-yellow-700' },
    { type: 'Restock', title: 'Permintaan restock #RST-1020', detail: 'Sedang diproses oleh supplier', time: 'Kemarin', by: 'Admin Farmasi', typeClass: 'bg-blue-100 text-primary' },
    { type: 'Data Obat', title: 'Ibuprofen 400mg', detail: 'Data obat & sisa stok diperbarui', time: '24 Mei', by: 'Admin Farmasi', typeClass: 'bg-purple-100 text-purple-600' },
    { type: 'Distribusi', title: 'Distribusi obat #DST-7788', detail: 'Dalam pengiriman oleh supplier', time: '23 Mei', by: 'Supplier', typeClass: 'bg-green-100 text-secondary' },
  ];

  const displayNotifs = notifications.length > 0
    ? notifications.map(n => ({
        type: n.type,
        title: n.message,
        detail: `Notifikasi ${n.type.toLowerCase()}`,
        time: n.time || 'Baru saja',
        by: n.by || 'Sistem',
        typeClass:
          n.type === 'Stok Kritis' ? 'bg-red-100 text-error' :
          n.type === 'Restock' ? 'bg-blue-100 text-primary' :
          n.type === 'Distribusi' ? 'bg-green-100 text-secondary' :
          n.type === 'Kadaluarsa' ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-600'
      }))
    : defaultNotifs;

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <div className="mt-2">
            <h2 className="text-xl font-bold text-text">Selamat Datang, Admin</h2>
            <p className="text-sm text-gray-500">Berikut ringkasan kondisi persediaan obat saat ini.</p>
          </div>
        </div>
        <DatePickerButton />
      </div>

      {/* Main section: Left (Stats + Chart) & Right (Quick Notification) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left section: Summary cards + Chart */}
        <div className="lg:col-span-3 space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs text-gray-500 mb-1">Total Jenis Obat</p>
              <p className="text-2xl font-bold text-text">{stats.totalMedicines.toLocaleString('id-ID')} <span className="text-sm font-normal text-gray-400">Item</span></p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-success" />
                <p className="text-xs text-success font-medium">Stok Aman</p>
              </div>
              <p className="text-2xl font-bold text-text">{stats.stockAman.toLocaleString('id-ID')} <span className="text-sm font-normal text-gray-400">Item</span></p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-warning" />
                <p className="text-xs text-warning font-medium">Menipis / Warning</p>
              </div>
              <p className="text-2xl font-bold text-text">{stats.stockMenipis.toLocaleString('id-ID')} <span className="text-sm font-normal text-gray-400">Item</span></p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-error" />
                <p className="text-xs text-error font-medium">Kadaluarsa</p>
              </div>
              <p className="text-2xl font-bold text-text">{stats.kadaluarsa.toLocaleString('id-ID')} <span className="text-sm font-normal text-gray-400">Item</span></p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-text">Grafik tren Pemakaian</h3>
              <div className="relative">
                <select
                  value={chartRange}
                  onChange={(e) => setChartRange(e.target.value)}
                  className="appearance-none text-sm text-gray-600 bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 outline-none cursor-pointer focus:ring-2 focus:ring-primary-light shadow-sm transition-all"
                >
                  <option value="7">7 hari terakhir</option>
                  <option value="14">14 hari terakhir</option>
                  <option value="30">30 hari terakhir</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={generateChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={{ stroke: '#e5e7eb' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={{ stroke: '#e5e7eb' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Legend
                  formatter={() => 'Total Pemakaian (Unit)'}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#185FA5"
                  strokeWidth={2}
                  dot={{ fill: '#185FA5', r: 4 }}
                  activeDot={{ r: 6, fill: '#0C447C' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* fitur Quick Notification */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col max-h-[385px]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 shrink-0">
            <h3 className="text-sm font-bold text-text">Quick Notification</h3>
            <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
              {displayNotifs.length} Notifikasi
            </span>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {displayNotifs.map((n, i) => (
              <div key={i} className="pb-2 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 p-2 rounded-lg transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${n.typeClass}`}>
                    {n.type}
                  </span>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{n.time}</span>
                </div>
                <p className="text-xs font-semibold text-text leading-tight">{n.title}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{n.detail}</p>
                <p className="text-[10px] text-gray-400 mt-1">oleh {n.by}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* fitur aktivitas terbaru */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h3 className="text-base font-semibold text-text">Aktivitas Terbaru</h3>
          <button className="text-xs text-primary font-medium hover:underline">Lihat Semua</button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-t border-gray-100">
              <th className="text-left text-xs font-medium text-gray-400 px-6 py-3 w-[120px]">Waktu</th>
              <th className="text-left text-xs font-medium text-gray-400 px-3 py-3 w-[130px]">Aktivitas</th>
              <th className="text-left text-xs font-medium text-gray-400 px-3 py-3">Detail</th>
              <th className="text-left text-xs font-medium text-gray-400 px-6 py-3 w-[160px]">Oleh</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((act, i) => (
              <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-3.5 text-sm text-gray-500">{act.time}</td>
                <td className="px-3 py-3.5">
                  <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold ${act.typeClass}`}>
                    {act.type}
                  </span>
                </td>
                <td className="px-3 py-3.5 text-sm text-gray-700">{act.detail}</td>
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <span className="text-sm text-gray-600">{act.by}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
