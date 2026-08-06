import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import medicinesData from '../data/medicines';
import suppliersData from '../data/suppliers';
import distributionsData from '../data/distributions';
import restockRequestsData from '../data/restockRequests';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  role: 'medistock_role',
  medicines: 'medistock_medicines',
  suppliers: 'medistock_suppliers',
  distributions: 'medistock_distributions',
  restockRequests: 'medistock_restockRequests',
  notifications: 'medistock_notifications',
};

function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.warn(`Failed to load ${key} from localStorage`, e);
  }
  return fallback;
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to save ${key} to localStorage`, e);
  }
}

export function AppProvider({ children }) {
  const [currentRole, setCurrentRole] = useState(() => loadFromStorage(STORAGE_KEYS.role, null));
  const [medicines, setMedicines] = useState(() => loadFromStorage(STORAGE_KEYS.medicines, medicinesData));
  const [suppliers] = useState(() => loadFromStorage(STORAGE_KEYS.suppliers, suppliersData));
  const [distributions, setDistributions] = useState(() => loadFromStorage(STORAGE_KEYS.distributions, distributionsData));
  const [restockRequests, setRestockRequests] = useState(() => loadFromStorage(STORAGE_KEYS.restockRequests, restockRequestsData));
  const [notifications, setNotifications] = useState(() => loadFromStorage(STORAGE_KEYS.notifications, []));

  // Persist to localStorage on change
  useEffect(() => { saveToStorage(STORAGE_KEYS.role, currentRole); }, [currentRole]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.medicines, medicines); }, [medicines]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.distributions, distributions); }, [distributions]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.restockRequests, restockRequests); }, [restockRequests]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.notifications, notifications); }, [notifications]);

  // Helper: get stock status
  const getStockStatus = useCallback((medicine) => {
    if (medicine.currentStock <= medicine.minStock * 0.3) return 'kritis';
    if (medicine.currentStock <= medicine.minStock) return 'menipis';
    return 'aman';
  }, []);

  // Helper: get FEFO status based on days until expiry
  const getFEFOStatus = useCallback((medicine) => {
    const today = new Date();
    const expiry = new Date(medicine.expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 30) return 'kritis';
    if (daysUntilExpiry <= 90) return 'warning';
    return 'aman';
  }, []);

  // Helper: estimate days until stockout
  const getDaysUntilStockout = useCallback((medicine, seasonal = false) => {
    const usage = seasonal ? medicine.dailyUsage * medicine.seasonalMultiplier : medicine.dailyUsage;
    if (usage <= 0) return Infinity;
    return Math.floor(medicine.currentStock / usage);
  }, []);

  // Helper: recommended restock qty
  const getRecommendedQty = useCallback((medicine, seasonal = false) => {
    const usage = seasonal ? medicine.dailyUsage * medicine.seasonalMultiplier : medicine.dailyUsage;
    const supplierObj = suppliers.find(s => s.id === medicine.supplier);
    const leadTime = supplierObj ? supplierObj.leadTimeDays : 3;
    const safetyBuffer = 7;
    return Math.ceil(usage * (leadTime + safetyBuffer + 30)) - medicine.currentStock;
  }, [suppliers]);

  // CRUD: Add medicine
  const addMedicine = useCallback((medicine) => {
    const newMedicine = { ...medicine, id: `OBT-${String(medicines.length + 1).padStart(3, '0')}` };
    setMedicines(prev => [...prev, newMedicine]);
    addNotification('Data Obat', `Data obat ${medicine.name} ditambahkan`, 'Admin Farmasi');
  }, [medicines.length]);

  // CRUD: Update medicine
  const updateMedicine = useCallback((id, updates) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    addNotification('Data Obat', `Data obat ${updates.name || id} diperbarui`, 'Admin Farmasi');
  }, []);

  // CRUD: Delete medicine
  const deleteMedicine = useCallback((id) => {
    setMedicines(prev => {
      const medicine = prev.find(m => m.id === id);
      if (medicine) addNotification('Data Obat', `Data obat ${medicine.name} dihapus`, 'Admin Farmasi');
      return prev.filter(m => m.id !== id);
    });
  }, []);

  // Create restock request
  const createRestockRequest = useCallback((medicineId, requestedQty, notes = '') => {
    const medicine = medicines.find(m => m.id === medicineId);
    if (!medicine) return;
    
    const urgency = getStockStatus(medicine) === 'kritis' ? 'kritis' : 
                    getStockStatus(medicine) === 'menipis' ? 'menipis' : 'normal';
    
    const newRequest = {
      id: `RST-${1027 + restockRequests.length}`,
      medicineId,
      requestedBy: 'Admin Farmasi',
      requestedQty,
      recommendedQty: getRecommendedQty(medicine),
      urgency,
      status: 'menunggu',
      approvedBy: null,
      notes,
      createdAt: new Date().toISOString(),
    };
    setRestockRequests(prev => [...prev, newRequest]);
    addNotification('Restock', `Permintaan restock ${medicine.name} diajukan`, 'Admin Farmasi');
  }, [medicines, restockRequests.length, getStockStatus, getRecommendedQty]);

  // Approve/Reject restock
  const updateRestockStatus = useCallback((requestId, status, notes = '') => {
    setRestockRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r;
      const updated = { ...r, status, approvedBy: status === 'ditolak' ? 'Kepala Farmasi' : 'Kepala Farmasi' };
      if (notes) updated.notes = notes;
      return updated;
    }));

    const request = restockRequests.find(r => r.id === requestId);
    const medicine = request ? medicines.find(m => m.id === request.medicineId) : null;
    const medicineName = medicine ? medicine.name : requestId;
    
    if (status === 'disetujui') {
      // Create distribution record
      const request = restockRequests.find(r => r.id === requestId);
      if (request) {
        const med = medicines.find(m => m.id === request.medicineId);
        const newDist = {
          id: `DST-${7797 + distributions.length}`,
          medicineId: request.medicineId,
          quantity: request.requestedQty,
          fromSupplier: med ? med.supplier : 'SUP-001',
          toUnit: 'Gudang Utama',
          status: 'diproses',
          requestDate: new Date().toISOString().split('T')[0],
          statusUpdates: [
            { status: 'diproses', date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), updatedBy: 'Admin Farmasi' },
          ],
        };
        setDistributions(prev => [...prev, newDist]);
      }
      addNotification('Restock', `Permintaan restock #${requestId} disetujui`, 'Kepala Farmasi');
    } else {
      addNotification('Restock', `Permintaan restock #${requestId} ditolak`, 'Kepala Farmasi');
    }
  }, [restockRequests, medicines, distributions.length]);

  // Update distribution status
  const updateDistributionStatus = useCallback((distId, newStatus) => {
    setDistributions(prev => prev.map(d => {
      if (d.id !== distId) return d;
      const now = new Date();
      return {
        ...d,
        status: newStatus,
        statusUpdates: [
          ...d.statusUpdates,
          {
            status: newStatus,
            date: now.toISOString().split('T')[0],
            time: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            updatedBy: 'Gudang Farmasi',
          },
        ],
      };
    }));
    addNotification('Distribusi', `Distribusi #${distId} status diperbarui ke ${newStatus}`, 'Gudang Farmasi');
  }, []);

  // Add notification
  const addNotification = useCallback((type, message, by) => {
    const now = new Date();
    const newNotif = {
      id: Date.now(),
      type,
      message,
      by,
      time: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      date: now.toISOString().split('T')[0],
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Stats
  const stats = {
    totalMedicines: medicines.length,
    stockAman: medicines.filter(m => getStockStatus(m) === 'aman').length,
    stockMenipis: medicines.filter(m => getStockStatus(m) === 'menipis').length,
    stockKritis: medicines.filter(m => getStockStatus(m) === 'kritis').length,
    kadaluarsa: medicines.filter(m => getFEFOStatus(m) === 'kritis').length,
    pendingRestock: restockRequests.filter(r => r.status === 'menunggu').length,
    activeDistributions: distributions.filter(d => d.status !== 'diterima').length,
  };

  const value = {
    currentRole,
    setCurrentRole,
    medicines,
    suppliers,
    distributions,
    restockRequests,
    notifications,
    stats,
    getStockStatus,
    getFEFOStatus,
    getDaysUntilStockout,
    getRecommendedQty,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    createRestockRequest,
    updateRestockStatus,
    updateDistributionStatus,
    addNotification,
    clearNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
