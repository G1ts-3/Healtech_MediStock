import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Pill,
  PackageSearch,
  Truck,
  BarChart3,
  ClipboardCheck,
  Activity,
  LogOut,
  Headphones,
  X,
} from 'lucide-react';

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/data-obat', label: 'Data Obat', icon: Pill },
  { to: '/admin/restock', label: 'Permintaan Restock', icon: PackageSearch },
  { to: '/admin/distribusi', label: 'Tracking Distribusi', icon: Truck },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

const kepalaLinks = [
  { to: '/kepala/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/kepala/monitoring', label: 'Monitoring Stok', icon: Activity },
  { to: '/kepala/restock', label: 'Smart Restock', icon: PackageSearch },
  { to: '/kepala/analytics', label: 'Analytics', icon: BarChart3 },
];

const gudangLinks = [
  { to: '/gudang/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/gudang/distribusi', label: 'Tracking Distribusi', icon: Truck },
];

const linksByRole = {
  admin: adminLinks,
  kepala: kepalaLinks,
  gudang: gudangLinks,
};

export default function Sidebar({ isOpen, onClose }) {
  const { currentRole, setCurrentRole } = useApp();
  const navigate = useNavigate();
  const links = linksByRole[currentRole] || [];

  const handleLogout = () => {
    setCurrentRole(null);
    navigate('/');
    onClose?.();
  };

  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden sidebar-backdrop-enter"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 bottom-0 w-[220px] bg-primary-dark flex flex-col z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 sidebar-drawer-enter' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 mt-2">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-blue-200 hover:bg-primary/40 hover:text-white'
                }`
              }
            >
              <link.icon className="w-[18px] h-[18px]" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="px-3 pb-6 space-y-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-red-500/20 hover:text-red-300 transition-all w-full"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
