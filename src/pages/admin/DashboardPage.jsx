import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, ChevronDown, Package, CheckCircle, AlertTriangle, XCircle, User } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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

  // Quick notifications
  const quickNotifs = [
    { title: 'Permintaan restock #D-123', detail: 'Telah Disetujui', time: '09:00' },
    { title: 'Distribusi obat #F-321', detail: 'Obat telah tiba di gudang', time: '12:45' },
    { title: 'Paracetamol 500mg', detail: 'Stok kritis (tersisa 20)', time: 'Kemarin' },
  ];

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
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-text">{dateStr}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Stats + Quick Notifications */}
      <div className="flex gap-4">
        {/* Summary cards */}
        <div className="flex-1 grid grid-cols-4 gap-4">
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

        {/* Quick Notification */}
        <div className="w-[280px] bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-text mb-3">Quick Notification</h3>
          <div className="space-y-3">
            {quickNotifs.map((n, i) => (
              <div key={i} className="flex items-start justify-between gap-2 pb-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-xs font-semibold text-text">{n.title}</p>
                  <p className="text-[11px] text-gray-400">{n.detail}</p>
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">{n.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-text">Grafik tren Pemakaian</h3>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5">
            <select
              value={chartRange}
              onChange={(e) => setChartRange(e.target.value)}
              className="text-sm text-gray-600 bg-transparent outline-none cursor-pointer"
            >
              <option value="7">7 hari terakhir</option>
              <option value="14">14 hari terakhir</option>
              <option value="30">30 hari terakhir</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
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

      {/* Activities table */}
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
