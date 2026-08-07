import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, ChevronDown, TrendingUp, Activity, Award, Package, PieChart as PieIcon, BarChart2 } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

import DatePickerButton from '../../components/common/DatePickerButton';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const CATEGORY_COLORS = [
  '#185FA5', '#0F6E56', '#D8000C', '#FFC107', '#6366F1',
  '#8B5CF6', '#EC4899', '#F97316', '#10B981', '#06B6D4',
  '#64748B', '#A855F7', '#3B82F6'
];

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
      name: m.name.length > 18 ? m.name.slice(0, 18) + '...' : m.name,
      fullName: m.name,
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
  }, []).sort((a, b) => b.value - a.value);

  const totalCategoryItems = medicines.length || 1;

  // Stock status pie
  const statusData = [
    { name: 'Stok Aman', value: medicines.filter(m => getStockStatus(m) === 'aman').length, color: '#16A34A' },
    { name: 'Stok Menipis', value: medicines.filter(m => getStockStatus(m) === 'menipis').length, color: '#FFC107' },
    { name: 'Stok Kritis', value: medicines.filter(m => getStockStatus(m) === 'kritis').length, color: '#D8000C' },
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
        <DatePickerButton />
      </div>

      {/* Summary KPI cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-0.5">Total Pemakaian Bulan Ini</p>
            <p className="text-2xl font-bold text-text">{totalUsageThisMonth.toLocaleString('id-ID')} <span className="text-xs font-normal text-gray-400">unit</span></p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-0.5">Rata-rata Pemakaian Harian</p>
            <p className="text-2xl font-bold text-text">{avgDaily.toLocaleString('id-ID')} <span className="text-xs font-normal text-gray-400">unit/hari</span></p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-500 mb-0.5">Item Paling Banyak Digunakan</p>
            <p className="text-base font-bold text-text truncate">{topItem?.fullName || '-'}</p>
            <p className="text-xs text-gray-400">{topItem?.total.toLocaleString('id-ID')} unit/tahun</p>
          </div>
        </div>
      </div>

      {/* Usage trend chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold text-text">Tren Pemakaian Obat (Bulanan)</h3>
            <p className="text-xs text-gray-400 mt-0.5">Riwayat penggunaan bulanan per jenis obat</p>
          </div>
          <select
            value={selectedMedicine}
            onChange={(e) => setSelectedMedicine(e.target.value)}
            className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-light font-medium text-gray-700 max-w-[260px] cursor-pointer"
          >
            {medicines.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={{ stroke: '#e5e7eb' }} />
            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={{ stroke: '#e5e7eb' }} />
            <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} />
            <Legend formatter={() => selectedMed?.name || 'Pemakaian'} iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Line type="monotone" dataKey="pemakaian" stroke="#185FA5" strokeWidth={2.5} dot={{ fill: '#185FA5', r: 4 }} activeDot={{ r: 6, fill: '#0C447C' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 medicines bar chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-text flex items-center gap-2 mb-1">
              <BarChart2 className="w-4 h-4 text-primary" />
              Top 10 Obat Terbanyak Digunakan
            </h3>
            <p className="text-xs text-gray-400 mb-6">Akumulasi total pemakaian dalam 12 bulan terakhir</p>
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={topMedicines} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={{ stroke: '#e5e7eb' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#4b5563' }} width={130} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(val, name, props) => [`${val.toLocaleString('id-ID')} unit`, props.payload.fullName]}
                contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
              />
              <Bar dataKey="total" fill="#185FA5" radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock status + category donut charts */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Stock Status Distribution */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-text flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-primary" />
              Distribusi Status Stok
            </h3>
            <div className="flex items-center justify-between gap-4">
              <div className="w-1/2 h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`${val} Item`, name]}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-2.5">
                {statusData.map((s, i) => {
                  const pct = Math.round((s.value / (medicines.length || 1)) * 100);
                  return (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50/80 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="text-xs font-medium text-gray-700">{s.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-text">{s.value} <span className="text-[10px] text-gray-400 font-normal">({pct}%)</span></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-text flex items-center gap-2 mb-4">
              <PieIcon className="w-4 h-4 text-primary" />
              Distribusi per Kategori
            </h3>
            <div className="flex items-center justify-between gap-4">
              <div className="w-1/2 h-[170px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryData.map((entry, idx) => (
                        <Cell key={idx} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`${val} Item (${Math.round((val / totalCategoryItems) * 100)}%)`, name]}
                      contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 max-h-[170px] overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                {categoryData.map((cat, idx) => {
                  const pct = Math.round((cat.value / totalCategoryItems) * 100);
                  const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                  return (
                    <div key={cat.name} className="flex items-center justify-between text-xs py-1 px-2 rounded-md hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-gray-700 font-medium truncate">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className="text-gray-600 font-bold">{cat.value}</span>
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1 py-0.5 rounded font-mono">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

