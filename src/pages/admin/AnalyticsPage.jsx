import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TrendingUp, Activity, Award, Package, PieChart as PieIcon, BarChart2 } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

import DatePickerButton from '../../components/common/DatePickerButton';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const PALETTE = [
  '#185FA5', '#0F6E56', '#D8000C', '#FFC107', '#6366F1',
  '#8B5CF6', '#EC4899', '#F97316', '#10B981', '#06B6D4',
  '#64748B', '#A855F7', '#3B82F6'
];

const customTooltipTheme = {
  borderRadius: '10px',
  border: '1px solid #e5e7eb',
  fontSize: '12px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
};

function calcPercentage(value, total) {
  if (!total || total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function truncateName(text, maxLength = 18) {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export default function AnalyticsPage() {
  const { medicines, getStockStatus } = useApp();
  const [selectedMedicineId, setSelectedMedicineId] = useState(() => medicines[0]?.id || '');

  const activeDrug = useMemo(() => {
    if (!medicines || medicines.length === 0) return null;
    return medicines.find(item => item.id === selectedMedicineId) || medicines[0];
  }, [medicines, selectedMedicineId]);

  const monthlyUsageSeries = useMemo(() => {
    if (!activeDrug || !Array.isArray(activeDrug.monthlyUsageHistory)) return [];
    return MONTH_LABELS.map((monthName, index) => ({
      name: monthName,
      pemakaian: activeDrug.monthlyUsageHistory[index] ?? 0,
    }));
  }, [activeDrug]);

  const highestConsumedItems = useMemo(() => {
    if (!medicines) return [];
    return medicines
      .map(drug => {
        const history = Array.isArray(drug.monthlyUsageHistory) ? drug.monthlyUsageHistory : [];
        const totalUsage = history.reduce((acc, curr) => acc + curr, 0);
        return {
          name: truncateName(drug.name, 18),
          fullName: drug.name,
          total: totalUsage,
        };
      })
      .sort((first, second) => second.total - first.total)
      .slice(0, 10);
  }, [medicines]);

  const categoryShareList = useMemo(() => {
    if (!medicines) return [];
    const categoryMap = new Map();

    medicines.forEach(drug => {
      const cat = drug.category || 'Lainnya';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });

    return Array.from(categoryMap.entries())
      .map(([categoryName, count]) => ({ name: categoryName, value: count }))
      .sort((a, b) => b.value - a.value);
  }, [medicines]);

  const inventoryStatusOverview = useMemo(() => {
    if (!medicines) return [];
    let safeCount = 0;
    let warningCount = 0;
    let criticalCount = 0;

    medicines.forEach(drug => {
      const status = getStockStatus(drug);
      if (status === 'aman') safeCount++;
      else if (status === 'menipis') warningCount++;
      else if (status === 'kritis') criticalCount++;
    });

    return [
      { name: 'Stok Aman', value: safeCount, color: '#16A34A' },
      { name: 'Stok Menipis', value: warningCount, color: '#FFC107' },
      { name: 'Stok Kritis', value: criticalCount, color: '#D8000C' },
    ];
  }, [medicines, getStockStatus]);

  const currentMonthIndex = new Date().getMonth();

  const monthlyTotalConsumption = useMemo(() => {
    if (!medicines) return 0;
    return medicines.reduce((sum, item) => {
      const monthlyVal = item.monthlyUsageHistory?.[currentMonthIndex] ?? 0;
      return sum + monthlyVal;
    }, 0);
  }, [medicines, currentMonthIndex]);

  const dailyAverageUsage = useMemo(() => {
    if (!medicines) return 0;
    const totalDaily = medicines.reduce((sum, item) => sum + (item.dailyUsage || 0), 0);
    return Math.round(totalDaily);
  }, [medicines]);

  const topConsumedMedicine = highestConsumedItems[0] || null;
  const totalStockCount = medicines?.length || 1;

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Analisis tren pemakaian obat dan evaluasi distribusi stok.</p>
        </div>
        <DatePickerButton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-0.5">Total Pemakaian Bulan Ini</p>
            <p className="text-2xl font-bold text-text">
              {monthlyTotalConsumption.toLocaleString('id-ID')} <span className="text-xs font-normal text-gray-400">unit</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-0.5">Rata-rata Pemakaian Harian</p>
            <p className="text-2xl font-bold text-text">
              {dailyAverageUsage.toLocaleString('id-ID')} <span className="text-xs font-normal text-gray-400">unit/hari</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-500 mb-0.5">Item Paling Banyak Digunakan</p>
            <p className="text-base font-bold text-text truncate">{topConsumedMedicine?.fullName || '-'}</p>
            <p className="text-xs text-gray-400">
              {(topConsumedMedicine?.total || 0).toLocaleString('id-ID')} unit/tahun
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-semibold text-text">Tren Pemakaian Obat (Bulanan)</h3>
            <p className="text-xs text-gray-400 mt-0.5">Riwayat penggunaan bulanan per jenis obat</p>
          </div>
          <select
            value={selectedMedicineId}
            onChange={(e) => setSelectedMedicineId(e.target.value)}
            className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary-light font-medium text-gray-700 max-w-[260px] cursor-pointer"
          >
            {medicines.map(drugItem => (
              <option key={drugItem.id} value={drugItem.id}>
                {drugItem.name}
              </option>
            ))}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={monthlyUsageSeries} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={{ stroke: '#e5e7eb' }} />
            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={{ stroke: '#e5e7eb' }} />
            <Tooltip contentStyle={customTooltipTheme} />
            <Legend
              formatter={() => activeDrug?.name || 'Pemakaian'}
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            />
            <Line
              type="monotone"
              dataKey="pemakaian"
              stroke="#185FA5"
              strokeWidth={2.5}
              dot={{ fill: '#185FA5', r: 4 }}
              activeDot={{ r: 6, fill: '#0C447C' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-text flex items-center gap-2 mb-1">
              <BarChart2 className="w-4 h-4 text-primary" />
              Top 10 Obat Terbanyak Digunakan
            </h3>
            <p className="text-xs text-gray-400 mb-6">Akumulasi total pemakaian dalam 12 bulan terakhir</p>
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={highestConsumedItems} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={{ stroke: '#e5e7eb' }} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11, fill: '#4b5563' }}
                width={130}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(val, _name, props) => [`${val.toLocaleString('id-ID')} unit`, props.payload.fullName]}
                contentStyle={customTooltipTheme}
              />
              <Bar dataKey="total" fill="#185FA5" radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-6 flex flex-col justify-between">
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
                      data={inventoryStatusOverview}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {inventoryStatusOverview.map((item, index) => (
                        <Cell key={`status-cell-${index}`} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`${val} Item`, name]}
                      contentStyle={customTooltipTheme}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-2.5">
                {inventoryStatusOverview.map((statusRow, idx) => {
                  const percentage = calcPercentage(statusRow.value, totalStockCount);
                  return (
                    <div key={`status-row-${idx}`} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50/80 border border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: statusRow.color }} />
                        <span className="text-xs font-medium text-gray-700">{statusRow.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-text">
                          {statusRow.value} <span className="text-[10px] text-gray-400 font-normal">({percentage}%)</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

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
                      data={categoryShareList}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {categoryShareList.map((entry, idx) => (
                        <Cell key={`cat-cell-${idx}`} fill={PALETTE[idx % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`${val} Item (${calcPercentage(val, totalStockCount)}%)`, name]}
                      contentStyle={customTooltipTheme}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 max-h-[170px] overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                {categoryShareList.map((catItem, idx) => {
                  const percentage = calcPercentage(catItem.value, totalStockCount);
                  const itemColor = PALETTE[idx % PALETTE.length];
                  return (
                    <div key={catItem.name} className="flex items-center justify-between text-xs py-1 px-2 rounded-md hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: itemColor }} />
                        <span className="text-gray-700 font-medium truncate">{catItem.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className="text-gray-600 font-bold">{catItem.value}</span>
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1 py-0.5 rounded font-mono">{percentage}%</span>
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
