import { Search, Bell, ChevronDown, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

const roleLabels = {
  admin: 'Akmal Admin',
  kepala: 'Dr. Raghid Kepala',
  gudang: 'Rafly Staff Gudang',
};

const roleSubtitles = {
  admin: 'Admin',
  kepala: 'Kepala Farmasi',
  gudang: 'Staff Gudang',
};

export default function Navbar() {
  const { currentRole, notifications, clearNotifications } = useApp();
  const [showNotif, setShowNotif] = useState(false);
  const location = useLocation();
  const unreadCount = notifications.filter(n => !n.read).length;

  const isAdminDashboard = location.pathname === '/admin/dashboard';

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      {/* Page title area - filled by page content */}
      <div className="flex items-center gap-4 flex-1">
        {!isAdminDashboard && (
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari obat, supplier, kategori, ..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-5">
        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); if (!showNotif) clearNotifications(); }}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center badge-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
              <div className="p-3 border-b border-gray-100 font-semibold text-sm">Notifikasi</div>
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">Tidak ada notifikasi</div>
              ) : (
                notifications.slice(0, 10).map(n => (
                  <div key={n.id} className="p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mr-2 ${
                          n.type === 'Stok Kritis' ? 'bg-red-100 text-error' :
                          n.type === 'Restock' ? 'bg-blue-100 text-primary' :
                          n.type === 'Distribusi' ? 'bg-green-100 text-secondary' :
                          n.type === 'Kadaluarsa' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{n.type}</span>
                        <p className="text-xs text-gray-700 mt-1">{n.message}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{n.time}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">oleh {n.by}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
            <User className="w-5 h-5 text-gray-500" />
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-text leading-tight">{roleLabels[currentRole] || 'User'}</p>
            <p className="text-[11px] text-gray-400">{roleSubtitles[currentRole] || ''}</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
