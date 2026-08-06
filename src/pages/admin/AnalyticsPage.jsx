import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, ChevronDown } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const COLORS = ['#185FA5', '#378ADD', '#0F6E56', '#16A34A', '#FFC107', '#D8000C', '#6366f1', '#8b5cf6', '#ec4899', '#f97316'];

export default function AnalyticsPage() {
  const { medicines, getStockStatus } = useApp();
  const [selectedMedicine, setSelectedMedicine] = useState(medicines[0]?.id || '');

  const today = new Date();
  const dateStr = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const selectedMed = medicines.find(m => m.id === selectedMedicine);

  // Usage trend data for selected medicine
  const trendData = selectedMed
    ? months.map((month, idx) => ({
        name: month,
        pemakaian: selectedMed.monthlyUsageHistory[idx] || 0,
      }))
    : [];

  // Top 10 most-used medicines (by total annual usage)
  const topMedicines = medicines
    .map(m => ({
      name: m.name.length > 20 ? m.name.slice(0, 20) + '...' : m.name,
      total: m.monthlyUsageHistory.reduce((a, b) => a + b, 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // Stock distribution by category
  const categoryData = medicines.reduce((acc, m) => {
    const existing = acc.find(c => c.name === m.category);
    if (existing) existing.value += 1;
    else acc.push({ name: m.category, value: 1 });
    return acc;
  }, []);

  // Stock status pie
  const statusData = [
    { name: 'Aman', value: medicines.filter(m => getStockStatus(m) === 'aman').length, color: '#16A34A' },
    { name: 'Menipis', value: medicines.filter(m => getStockStatus(m) === 'menipis').length, color: '#FFC107' },
    { name: 'Kritis', value: medicines.filter(m => getStockStatus(m) === 'kritis').length, color: '#D8000C' },
  ];

  // Summary stats
  const totalUsageThisMonth = medicines.reduce((sum, m) => sum + (m.monthlyUsageHistory[today.getMonth()] || 0), 0);
  const avgDaily = Math.round(medicines.reduce((sum, m) => sum + m.dailyUsage, 0));
  const topItem = topMedicines[0];

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Analisis tren pemakaian obat dan evaluasi distribusi stok.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-text">{dateStr}</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Total Pemakaian Bulan Ini</p>
          <p className="text-2xl font-bold text-primary">{totalUsageThisMonth.toLocaleString('id-ID')} <span className="text-sm font-normal text-gray-400">unit</span></p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Rata-rata Pemakaian Harian</p>
          <p className="text-2xl font-bold text-secondary">{avgDaily.toLocaleString('id-ID')} <span className="text-sm font-normal text-gray-400">unit/hari</span></p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Item Paling Banyak Digunakan</p>
          <p className="text-lg font-bold text-text">{topItem?.name || '-'}</p>
          <p className="text-xs text-gray-400">{topItem?.total.toLocaleString('id-ID')} unit/tahun</p>
        </div>
      </div>

      {/* Usage trend chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-text">Tren Pemakaian Obat (Bulanan)</h3>
          <select
            value={selectedMedicine}
            onChange={(e) => setSelectedMedicine(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-light max-w-[250px]"
          >
            {medicines.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
            <Legend formatter={() => selectedMed?.name || 'Pemakaian'} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="pemakaian" stroke="#185FA5" strokeWidth={2} dot={{ fill: '#185FA5', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top medicines bar chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-text mb-6">Top 10 Obat Terbanyak Digunakan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topMedicines} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} width={140} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Bar dataKey="total" fill="#185FA5" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock status + category pie charts */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-text mb-4">Distribusi Status Stok</h3>
            <div className="flex items-center">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" stroke="none">
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {statusData.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-sm text-gray-600">{s.name}: <strong>{s.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-text mb-4">Distribusi per Kategori</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={65} dataKey="value" stroke="none" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {categoryData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
