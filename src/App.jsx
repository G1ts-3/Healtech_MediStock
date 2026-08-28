import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/DashboardPage';
import DataObatPage from './pages/admin/DataObatPage';
import RestockPage from './pages/admin/RestockPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import DistribusiPage from './pages/admin/DistribusiPage';
import KepalaDashboard from './pages/kepala/DashboardPage';
import MonitoringPage from './pages/kepala/MonitoringPage';
import RestockKepalaPage from './pages/kepala/RestockKepalaPage';
import GudangDashboard from './pages/gudang/DashboardPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { currentRole } = useApp();
  if (!currentRole) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(currentRole)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { currentRole } = useApp();

  return (
    <Routes>
      <Route path="/" element={currentRole ? <Navigate to={`/${currentRole}/dashboard`} replace /> : <LoginPage />} />

      <Route element={<ProtectedRoute allowedRoles={['admin']}><MainLayout /></ProtectedRoute>}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/data-obat" element={<DataObatPage />} />
        <Route path="/admin/restock" element={<RestockPage />} />
        <Route path="/admin/distribusi" element={<DistribusiPage />} />
        <Route path="/admin/analytics" element={<AnalyticsPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['kepala']}><MainLayout /></ProtectedRoute>}>
        <Route path="/kepala/dashboard" element={<KepalaDashboard />} />
        <Route path="/kepala/monitoring" element={<MonitoringPage />} />
        <Route path="/kepala/restock" element={<RestockKepalaPage />} />
        <Route path="/kepala/analytics" element={<AnalyticsPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['gudang']}><MainLayout /></ProtectedRoute>}>
        <Route path="/gudang/dashboard" element={<GudangDashboard />} />
        <Route path="/gudang/distribusi" element={<DistribusiPage />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
