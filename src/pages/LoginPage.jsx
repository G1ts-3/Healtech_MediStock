import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const accounts = [
  { email: 'admin@medistock.id', password: 'admin123', role: 'admin', name: 'Akmal Admin' },
  { email: 'kepala@medistock.id', password: 'kepala123', role: 'kepala', name: 'Dr. Raghid' },
  { email: 'gudang@medistock.id', password: 'gudang123', role: 'gudang', name: 'Rafly Staff' },
];

const roleRedirects = {
  admin: '/admin/dashboard',
  kepala: '/kepala/dashboard',
  gudang: '/gudang/dashboard',
};

export default function LoginPage() {
  const { setCurrentRole } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const account = accounts.find(a => a.email === email && a.password === password);
    if (account) {
      setCurrentRole(account.role);
      navigate(roleRedirects[account.role]);
    } else {
      setError('Email atau password salah. Gunakan salah satu akun demo.');
    }
  };

  const handleQuickLogin = (role) => {
    const account = accounts.find(a => a.role === role);
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
      setCurrentRole(account.role);
      navigate(roleRedirects[account.role]);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[45%] bg-primary-dark flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-primary/30 blur-xl" />
        <div className="absolute bottom-20 -right-10 w-48 h-48 rounded-full bg-primary-light/20 blur-xl" />

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white tracking-tight">Medistok HUB</h1>
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white leading-snug">
            Manage medical inventory<br />efficiency
          </h2>
          <p className="text-blue-200 mt-4 text-sm leading-relaxed max-w-sm">
            Sistem manajemen stok obat rumah sakit dengan prediksi kebutuhan adaptif dan notifikasi otomatis.
          </p>
        </div>
        <div className="relative z-10" />
      </div>

      {/* form untuk login */}
      <div className="flex-1 flex items-center justify-center bg-tertiary-light p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-10">
          <h2 className="text-3xl font-bold text-text text-center mb-8">Login</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
                placeholder="admin@medistock.id"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-600">Remember Me</span>
              </label>
              <button type="button" className="text-sm text-gray-500 hover:text-primary transition-colors">
                Forgot Password?
              </button>
            </div>

            {error && (
              <div className="text-sm text-error bg-red-50 rounded-lg p-3 border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-primary-dark text-white font-semibold rounded-lg hover:bg-primary transition-colors shadow-md hover:shadow-lg"
            >
              LOGIN
            </button>
          </form>

          {/* (demo untuk login cepat tanpa memasukkan email dan password) */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">Quick Login (Demo)</p>
            <div className="grid grid-cols-3 gap-2">
              {accounts.map(acc => (
                <button
                  key={acc.role}
                  onClick={() => handleQuickLogin(acc.role)}
                  className="py-2 px-3 bg-tertiary-light text-primary text-xs font-medium rounded-lg hover:bg-primary-light hover:text-white transition-all"
                >
                  {acc.role === 'admin' ? 'Admin' : acc.role === 'kepala' ? 'Kepala' : 'Gudang'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
