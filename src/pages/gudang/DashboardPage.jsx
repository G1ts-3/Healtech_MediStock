import { useApp } from '../../context/AppContext';
import { Calendar, ChevronDown, Truck, Package, CheckCircle2, Clock } from 'lucide-react';
import DatePickerButton from '../../components/common/DatePickerButton';

const statusConfig = {
  diproses: { label: 'Diproses', color: 'bg-yellow-100 text-yellow-700' },
  dikirim: { label: 'Dikirim', color: 'bg-blue-100 text-primary' },
  diterima: { label: 'Diterima', color: 'bg-green-100 text-success' },
};

export default function GudangDashboard() {
  const { distributions, medicines, suppliers, updateDistributionStatus } = useApp();

  const diproses = distributions.filter(d => d.status === 'diproses').length;
  const dikirim = distributions.filter(d => d.status === 'dikirim').length;
  const diterima = distributions.filter(d => d.status === 'diterima').length;

  const recentDists = [...distributions].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate)).slice(0, 5);

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <div className="mt-2">
            <h2 className="text-xl font-bold text-text">Selamat Datang, Staff Gudang</h2>
            <p className="text-sm text-gray-500">Kelola status proses dan pengiriman barang dari supplier ke gudang.</p>
          </div>
        </div>
        <DatePickerButton />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Diproses</p>
              <p className="text-2xl font-bold text-text">{diproses}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Dikirim</p>
              <p className="text-2xl font-bold text-text">{dikirim}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Diterima</p>
              <p className="text-2xl font-bold text-text">{diterima}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent distributions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 pt-5 pb-3">
          <h3 className="text-base font-semibold text-text">Distribusi Terbaru</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-t border-gray-100">
              <th className="text-left text-xs font-medium text-gray-400 px-6 py-3">ID</th>
              <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">Obat</th>
              <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">Qty</th>
              <th className="text-left text-xs font-medium text-gray-400 px-4 py-3">Supplier</th>
              <th className="text-center text-xs font-medium text-gray-400 px-4 py-3">Status</th>
              <th className="text-center text-xs font-medium text-gray-400 px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {recentDists.map(dist => {
              const med = medicines.find(m => m.id === dist.medicineId);
              const sup = suppliers.find(s => s.id === dist.fromSupplier);
              const cfg = statusConfig[dist.status];
              return (
                <tr key={dist.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3.5 text-sm font-medium text-gray-500">{dist.id}</td>
                  <td className="px-4 py-3.5 text-sm text-text">{med?.name || dist.medicineId}</td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">{dist.quantity} unit</td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">{sup?.name || dist.fromSupplier}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {dist.status === 'diproses' ? (
                      <button
                        onClick={() => updateDistributionStatus(dist.id, 'dikirim')}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Konfirmasi Dikirim
                      </button>
                    ) : dist.status === 'dikirim' ? (
                      <span className="text-xs text-blue-600 font-medium">Sudah Dikirim</span>
                    ) : (
                      <span className="text-xs text-success font-medium">Diterima</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
