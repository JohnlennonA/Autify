import React, { useState, useEffect, useMemo } from 'react';
import { initialVehicles, VEHICLE_STATUSES } from './mockData';
import { calculateFleetKPIs, normalizeExpenseCategory } from './utils/formatters';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { KPISection } from './components/KPISection';
import { KpiDetailModal } from './components/KpiDetailModal';
import { VehicleCard } from './components/VehicleCard';
import { VehicleDetailModal } from './components/VehicleDetailModal';
import { NewVehicleModal } from './components/NewVehicleModal';
import { Login } from './components/Login';
import { AuthTransitionLoader } from './components/AuthTransitionLoader';
import { Toast } from './components/Toast';
import { Car, SlidersHorizontal, ArrowUpDown, Plus, Sparkles } from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('autify_auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [authTransition, setAuthTransition] = useState(null); // 'login' | 'logout' | null
  const [pendingUserData, setPendingUserData] = useState(null);

  // Local storage state initialization for vehicles (normalizes categories, syncs mockData photos, and ensures rental demo vehicle)
  const [vehicles, setVehicles] = useState(() => {
    try {
      const saved = localStorage.getItem('autify_vehicles');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Normalize expenses to Spanish and sync updated photos from mockData.js
        const normalized = parsed.map((v) => {
          const mockMatch = initialVehicles.find((m) => m.id === v.id);
          return {
            ...v,
            // If it's a seed vehicle from mockData, sync its photos array with the code
            photos: mockMatch?.photos?.length ? mockMatch.photos : (v.photos || []),
            expenses: (v.expenses || []).map((e) => ({
              ...e,
              category: normalizeExpenseCategory(e.category)
            }))
          };
        });

        // Check if demo rented car exists, if not append it
        const hasRented = normalized.some((v) => v.status === 'rented' || v.id === 'veh-005');
        if (!hasRented) {
          const rentalSample = initialVehicles.find((v) => v.id === 'veh-005');
          if (rentalSample) normalized.push(rentalSample);
        }
        return normalized;
      }
      return initialVehicles;
    } catch {
      return initialVehicles;
    }
  });

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTitleFilter, setSelectedTitleFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'profit' | 'price'
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [activeKpiModal, setActiveKpiModal] = useState(null); // 'active-capital' | 'repair-costs' | etc.
  const [toast, setToast] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('inventory');

  // Sync vehicles with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('autify_vehicles', JSON.stringify(vehicles));
    } catch (err) {
      console.error('Failed to save to localStorage', err);
    }
  }, [vehicles]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 3000);
  };

  // Auth Handlers with cinematic transitions
  const handleLogin = (userData, remember = true) => {
    setPendingUserData({ userData, remember });
    setAuthTransition('login');
  };

  const handleFinishLoginTransition = () => {
    if (pendingUserData) {
      const { userData, remember } = pendingUserData;
      setCurrentUser(userData);
      if (remember) {
        try {
          localStorage.setItem('autify_auth_user', JSON.stringify(userData));
        } catch (err) {
          console.error('Failed to save user session', err);
        }
      }
      showToast(`¡Bienvenido de nuevo, ${userData.name}!`);
      setPendingUserData(null);
    }
    setAuthTransition(null);
  };

  const handleLogout = () => {
    setAuthTransition('logout');
  };

  const handleFinishLogoutTransition = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('autify_auth_user');
    } catch (err) {
      console.error('Failed to clear user session', err);
    }
    showToast('Sesión cerrada correctamente', 'info');
    setAuthTransition(null);
  };

  // Status counts for badge pills (including rented)
  const statusCounts = useMemo(() => {
    const counts = {
      all: vehicles.length,
      in_repair: 0,
      for_sale: 0,
      rented: 0,
      sold: 0
    };
    vehicles.forEach((v) => {
      if (counts[v.status] !== undefined) {
        counts[v.status] += 1;
      }
    });
    return counts;
  }, [vehicles]);

  // Dynamic Fleet KPIs
  const kpis = useMemo(() => {
    return calculateFleetKPIs(vehicles);
  }, [vehicles]);

  // Selected vehicle for modal
  const activeVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || null;
  }, [vehicles, selectedVehicleId]);

  // Filtered and sorted vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => {
        // Status filter
        if (selectedStatus !== 'all' && v.status !== selectedStatus) {
          return false;
        }

        // Title filter
        if (selectedTitleFilter !== 'ALL' && v.titleStatus !== selectedTitleFilter) {
          return false;
        }

        // Search filter (VIN, Make, Model, Year, Color, Tenant)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesVin = v.vin.toLowerCase().includes(q);
          const matchesMake = v.make.toLowerCase().includes(q);
          const matchesModel = v.model.toLowerCase().includes(q);
          const matchesYear = v.year.toString().includes(q);
          const matchesColor = (v.color || '').toLowerCase().includes(q);
          const matchesTenant = (v.rental?.customerName || '').toLowerCase().includes(q);

          if (!matchesVin && !matchesMake && !matchesModel && !matchesYear && !matchesColor && !matchesTenant) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.purchaseDate || 0) - new Date(a.purchaseDate || 0);
        }
        if (sortBy === 'profit') {
          const profitA = (a.status === 'sold' ? (a.soldPrice || a.estimatedSalePrice) : a.estimatedSalePrice) - 
            (a.purchasePrice + (a.expenses || []).reduce((acc, curr) => acc + (curr.amount || 0), 0));
          const profitB = (b.status === 'sold' ? (b.soldPrice || b.estimatedSalePrice) : b.estimatedSalePrice) - 
            (b.purchasePrice + (b.expenses || []).reduce((acc, curr) => acc + (curr.amount || 0), 0));
          return profitB - profitA;
        }
        if (sortBy === 'price') {
          return b.purchasePrice - a.purchasePrice;
        }
        return 0;
      });
  }, [vehicles, selectedStatus, selectedTitleFilter, searchQuery, sortBy]);

  // State Handler Actions
  const handleAddVehicle = (newVehicle) => {
    setVehicles((prev) => [newVehicle, ...prev]);
    showToast(`Vehículo ${newVehicle.year} ${newVehicle.make} ${newVehicle.model} añadido al inventario`);
  };

  const handleUpdateVehicleStatus = (vehicleId, newStatus) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          const updated = { ...v, status: newStatus };
          if (newStatus === 'sold' && !v.soldPrice) {
            updated.soldPrice = v.estimatedSalePrice;
          }
          return updated;
        }
        return v;
      })
    );
    const label =
      newStatus === 'in_repair'
        ? 'En Reparación'
        : newStatus === 'for_sale'
        ? 'En Venta'
        : newStatus === 'rented'
        ? 'En Renta'
        : 'Vendido';
    showToast(`Estatus actualizado a: ${label}`);
  };

  const handleAddExpense = (vehicleId, newExpense) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          return {
            ...v,
            expenses: [newExpense, ...(v.expenses || [])]
          };
        }
        return v;
      })
    );
    showToast(`Gasto de $${newExpense.amount} registrado exitosamente`);
  };

  const handleDeleteExpense = (vehicleId, expenseId) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          return {
            ...v,
            expenses: (v.expenses || []).filter((e) => e.id !== expenseId)
          };
        }
        return v;
      })
    );
    showToast('Gasto eliminado de la bitácora', 'info');
  };

  const handleUpdatePrice = (vehicleId, newPrice, isSold) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          return isSold
            ? { ...v, soldPrice: newPrice }
            : { ...v, estimatedSalePrice: newPrice };
        }
        return v;
      })
    );
    showToast('Precio recalculado con éxito');
  };

  // Rental Handlers
  const handleUpdateRental = (vehicleId, rentalData) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          return {
            ...v,
            status: 'rented',
            rental: rentalData
          };
        }
        return v;
      })
    );
    showToast('Contrato de renta actualizado exitosamente');
  };

  const handleAddRentalPayment = (vehicleId, payment) => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          const currentRental = v.rental || {};
          const currentPayments = currentRental.payments || [];
          const newPayments = [payment, ...currentPayments];
          const newTotal = (Number(currentRental.totalReceived) || 0) + Number(payment.amount || 0);

          return {
            ...v,
            rental: {
              ...currentRental,
              totalReceived: newTotal,
              payments: newPayments
            }
          };
        }
        return v;
      })
    );
    showToast(`Cobro de $${payment.amount} registrado exitosamente`);
  };

  const handleTerminateRental = (vehicleId, returnStatus = 'for_sale') => {
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === vehicleId) {
          return {
            ...v,
            status: returnStatus
          };
        }
        return v;
      })
    );
    showToast('Renta finalizada. Vehículo retornado a inventario');
  };

  const handleUpdateVehicle = (updatedVehicle) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v))
    );
    showToast(`Vehículo ${updatedVehicle.year} ${updatedVehicle.make} ${updatedVehicle.model} actualizado exitosamente`);
  };

  const handleDeleteVehicle = (vehicleId) => {
    setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
    if (selectedVehicleId === vehicleId) {
      setSelectedVehicleId(null);
    }
    showToast('Vehículo eliminado permanentemente del inventario', 'info');
  };

  const handleResetData = () => {
    if (window.confirm('¿Restablecer el inventario con los vehículos de prueba originales?')) {
      setVehicles(initialVehicles);
      localStorage.setItem('autify_vehicles', JSON.stringify(initialVehicles));
      showToast('Datos demo restaurados correctamente');
    }
  };

  // If user is not authenticated, show the enterprise Login screen
  if (!currentUser) {
    return (
      <>
        {authTransition && (
          <AuthTransitionLoader
            mode={authTransition}
            onFinish={authTransition === 'login' ? handleFinishLoginTransition : handleFinishLogoutTransition}
          />
        )}
        <Login onLogin={handleLogin} />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080A] text-slate-100 flex overflow-x-clip font-sans selection:bg-[#CCFF00] selection:text-black">
      {authTransition && (
        <AuthTransitionLoader
          mode={authTransition}
          onFinish={authTransition === 'login' ? handleFinishLoginTransition : handleFinishLogoutTransition}
        />
      )}
      
      {/* Vercel-Style Dark Dual-Tiered Sidebar */}
      <Sidebar
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        statusCounts={statusCounts}
        totalVehicles={vehicles.length}
        onOpenNewVehicleModal={() => setIsNewModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSelectKpi={(kpiId) => setActiveKpiModal(kpiId)}
        activeView={activeView}
        setActiveView={setActiveView}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Page Layout Flow */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Main Navigation */}
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          statusCounts={statusCounts}
          onOpenNewVehicleModal={() => setIsNewModalOpen(true)}
          onResetData={handleResetData}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Main App Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Dynamic Interactive KPIs (Clickable with Breakdown Modals) */}
        <KPISection
          kpis={kpis}
          onSelectKpi={(kpiId) => setActiveKpiModal(kpiId)}
        />

        {/* Filter bar & Inventory Grid Controls */}
        <div className="space-y-3 pt-1">
          {/* Row 1: Section Title + Counter Badge + Sort Select */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Flota de Vehículos
              </h2>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/10">
                {filteredVehicles.length} {filteredVehicles.length === 1 ? 'unidad' : 'unidades'}
              </span>
            </div>

            {/* Quick Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs bg-[#0E1013] border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-[#CCFF00]/50 font-medium cursor-pointer shadow-sm transition-all"
                >
                  <option value="newest">Más recientes</option>
                  <option value="profit">Mayor margen proyectado</option>
                  <option value="price">Mayor costo compra</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: Responsive Toolbar for Status and Title Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-[#090A0D] border border-white/[0.07] p-2 rounded-2xl">
            {/* Status Tabs (Todos, En Reparación, En Venta, En Renta, Vendidos) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 min-w-0">
              {VEHICLE_STATUSES.map((tab) => {
                const count = statusCounts[tab.value] ?? 0;
                const isActive = selectedStatus === tab.value;

                return (
                  <button
                    key={tab.value}
                    onClick={() => setSelectedStatus(tab.value)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-white/10 text-white font-semibold border border-white/15 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-[#CCFF00] text-black'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Title Status Filter Pills (Clean, Rebuilt, Salvage) */}
            <div className="flex items-center gap-1 bg-[#14161A] border border-white/5 p-1 rounded-xl shrink-0 self-start md:self-auto overflow-x-auto no-scrollbar">
              {['ALL', 'Clean', 'Rebuilt', 'Salvage'].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTitleFilter(t)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition-all font-medium cursor-pointer shrink-0 ${
                    selectedTitleFilter === t
                      ? 'bg-white/15 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t === 'ALL' ? 'Todos Titles' : t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inventory Cards Grid */}
        {filteredVehicles.length === 0 ? (
          <div className="rounded-xl border border-white/[0.07] bg-[#141619] p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center p-2.5">
              <img src="/images/autify-icon.png" alt="Autify" className="w-full h-full object-contain opacity-50" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No se encontraron vehículos</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                No hay resultados con los filtros actuales o la búsqueda "{searchQuery}".
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('all');
                  setSelectedTitleFilter('ALL');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#1E2025] text-xs text-slate-300 hover:text-white border border-white/5 cursor-pointer"
              >
                Limpiar Filtros
              </button>
              <button
                onClick={() => setIsNewModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-xs font-semibold text-slate-950 hover:bg-emerald-400 shadow-glow-emerald cursor-pointer"
              >
                + Registrar Vehículo
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onSelectVehicle={(v) => setSelectedVehicleId(v.id)}
                onCopyVin={(vin) => showToast(`VIN copiado: ${vin}`, 'info')}
              />
            ))}
          </div>
        )}

      </main>

      {/* Bottom Footer */}
      <footer className="w-full border-t border-white/[0.05] py-4 mt-auto bg-[#07080A] text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Autify Pro — Car Flipping & Arbitrage OS (Fase 1 Frontend)</span>
          <span className="font-mono text-[11px] text-slate-600">Local State • Ready for Supabase Engine</span>
        </div>
      </footer>
      </div>

      {/* Workshop Tablet-Style Vehicle Detail Modal */}
      {activeVehicle && (
        <VehicleDetailModal
          vehicle={activeVehicle}
          onClose={() => setSelectedVehicleId(null)}
          onUpdateVehicleStatus={handleUpdateVehicleStatus}
          onAddExpense={handleAddExpense}
          onDeleteExpense={handleDeleteExpense}
          onUpdatePrice={handleUpdatePrice}
          onCopyVin={(vin) => showToast(`VIN copiado: ${vin}`, 'info')}
          onUpdateRental={handleUpdateRental}
          onAddRentalPayment={handleAddRentalPayment}
          onTerminateRental={handleTerminateRental}
          onUpdateVehicle={handleUpdateVehicle}
          onDeleteVehicle={handleDeleteVehicle}
        />
      )}

      {/* Interactive KPI Detail Breakdown Modal */}
      <KpiDetailModal
        isOpen={!!activeKpiModal}
        kpiId={activeKpiModal}
        onClose={() => setActiveKpiModal(null)}
        vehicles={vehicles}
        kpis={kpis}
        onSelectVehicle={(v) => {
          setActiveKpiModal(null);
          setSelectedVehicleId(v.id);
        }}
      />

      {/* New Vehicle Registration Modal */}
      <NewVehicleModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onAddVehicle={handleAddVehicle}
      />

      {/* Micro-interaction Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}
