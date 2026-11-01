import React, { useState } from 'react';
import {
  LayoutDashboard,
  Car,
  KeyRound,
  Wrench,
  TrendingUp,
  Settings,
  Bell,
  Plus,
  LogOut,
  Tag,
  CheckCircle2,
  DollarSign,
  X,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';

export const Sidebar = ({
  selectedStatus,
  setSelectedStatus,
  statusCounts = {},
  totalVehicles = 0,
  onOpenNewVehicleModal,
  currentUser,
  onLogout,
  onSelectKpi,
  activeView = 'inventory',
  setActiveView,
  isMobileOpen = false,
  setIsMobileOpen
}) => {
  const [hoveredTooltip, setHoveredTooltip] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('inventory');

  const mainNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      onClick: () => {
        setActiveMenu('dashboard');
        setSelectedStatus('all');
        if (setIsMobileOpen) setIsMobileOpen(false);
      }
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: Car,
      badge: totalVehicles,
      onClick: () => {
        setActiveMenu('inventory');
        setSelectedStatus('all');
        if (setIsMobileOpen) setIsMobileOpen(false);
      }
    },
    {
      id: 'rentals',
      label: 'Rentas',
      icon: KeyRound,
      badge: statusCounts['rented'] || 0,
      onClick: () => {
        setActiveMenu('rentals');
        setSelectedStatus('rented');
        if (setIsMobileOpen) setIsMobileOpen(false);
      }
    },
    {
      id: 'workshop',
      label: 'Taller',
      icon: Wrench,
      badge: statusCounts['in_repair'] || 0,
      onClick: () => {
        setActiveMenu('workshop');
        setSelectedStatus('in_repair');
        if (setIsMobileOpen) setIsMobileOpen(false);
      }
    },
    {
      id: 'analytics',
      label: 'Finanzas',
      icon: TrendingUp,
      onClick: () => {
        setActiveMenu('analytics');
        if (onSelectKpi) onSelectKpi('realized-profit');
        if (setIsMobileOpen) setIsMobileOpen(false);
      }
    }
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/85 backdrop-blur-sm lg:hidden transition-opacity duration-200"
        />
      )}

      {/* ===================================================================== */}
      {/* 1. SLIM ICON RAIL (EL SIDEBAR MÁS NEGRITO)                            */}
      {/* Visible ONLY on narrow screens (< lg)                                */}
      {/* ===================================================================== */}
      <aside className="hidden md:flex lg:hidden sticky top-0 left-0 z-30 h-screen w-[68px] flex-col items-center justify-between py-4 border-r border-white/[0.08] bg-[#000000] shrink-0 select-none">
        
        {/* Top: Brand Logo Button (Opens drawer sidebar) */}
        <div className="flex flex-col items-center gap-3 w-full">
          <button
            onClick={() => {
              if (setIsMobileOpen) setIsMobileOpen(true);
            }}
            className="w-10 h-10 rounded-xl bg-[#0F1013] border border-white/10 hover:border-[#CCFF00]/60 flex items-center justify-center p-1.5 transition-all group shadow-sm cursor-pointer"
            title="Abrir menú completo"
          >
            <img
              src="/images/autify-icon.png"
              alt="Autify"
              className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = '<span class="text-[#CCFF00] font-black text-lg">⚡</span>';
              }}
            />
          </button>
        </div>

        {/* Middle: Slim Navigation Icons Stack */}
        <nav className="flex flex-col items-center gap-2 w-full px-2 my-auto">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              (item.id === 'rentals' && selectedStatus === 'rented') ||
              (item.id === 'workshop' && selectedStatus === 'in_repair') ||
              (item.id === 'inventory' && selectedStatus === 'all' && activeMenu === 'inventory') ||
              activeMenu === item.id;

            return (
              <div key={item.id} className="relative group w-full flex justify-center">
                <button
                  onClick={item.onClick}
                  onMouseEnter={() => setHoveredTooltip(item.id)}
                  onMouseLeave={() => setHoveredTooltip(null)}
                  className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#181A1F] text-white shadow-sm border border-white/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-[#CCFF00]' : ''}`} />

                  {/* Active Neon Accent Pill on left */}
                  {isActive && (
                    <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-[#CCFF00] shadow-[0_0_8px_#CCFF00]" />
                  )}

                  {/* Notification/Item Badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#CCFF00]" />
                  )}
                </button>

                {/* Lime Tooltip for Narrow Screen Slim Bar */}
                {hoveredTooltip === item.id && (
                  <div className="absolute left-[64px] top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                    <div className="bg-[#CCFF00] text-black text-[11px] font-extrabold px-2.5 py-1 rounded-md shadow-2xl tracking-wide uppercase whitespace-nowrap flex items-center gap-1 animate-in fade-in zoom-in-95 duration-150">
                      <span>{item.label}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom: User & Notifications */}
        <div className="flex flex-col items-center gap-2.5 w-full px-2">
          {/* Notifications Bell */}
          <div className="relative group">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] flex items-center justify-center transition-all cursor-pointer relative"
              title="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#CCFF00] text-black font-black text-[9px] flex items-center justify-center font-mono">
                2
              </span>
            </button>

            {notificationsOpen && (
              <div className="absolute left-[64px] bottom-0 w-64 rounded-xl bg-[#141619] border border-white/10 p-3 shadow-2xl z-50 text-xs space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                  <span className="font-bold text-white uppercase text-[10px] tracking-wider">Notificaciones</span>
                  <button onClick={() => setNotificationsOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 space-y-0.5">
                    <p className="text-[11px] font-semibold text-[#CCFF00]">Contrato de Renta Activo</p>
                    <p className="text-[10px] text-slate-400">Toyota RAV4 próximo cobro programado.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 space-y-0.5">
                    <p className="text-[11px] font-semibold text-emerald-400">Taller Mustang GT</p>
                    <p className="text-[10px] text-slate-400">Nuevos repuestos registrados en bitácora.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <button
            onClick={() => {
              if (setIsMobileOpen) setIsMobileOpen(true);
            }}
            className="w-9 h-9 rounded-xl border border-white/15 bg-gradient-to-tr from-emerald-600 to-teal-400 p-[1.5px] overflow-hidden hover:scale-105 transition-transform shadow-md cursor-pointer"
            title={currentUser?.name || 'Usuario'}
          >
            <div className="w-full h-full rounded-[10px] bg-[#141619] flex items-center justify-center text-white font-bold text-xs uppercase font-mono">
              {currentUser?.name ? currentUser.name.slice(0, 2) : 'AU'}
            </div>
          </button>
        </div>

      </aside>

      {/* ===================================================================== */}
      {/* 2. MAIN WIDE SIDEBAR (LA MÁS GRANDE)                                  */}
      {/* Desktop (lg:flex) as permanent sidebar, and Mobile as slide-over       */}
      {/* ===================================================================== */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-30 h-screen w-[270px] bg-[#000000] border-r border-white/[0.08] flex flex-col justify-between transition-transform duration-300 select-none ${
          isMobileOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Clean Brand Header (NO screaming yellow button, NO duplicate logos) */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#000000]">
          <div className="flex items-center gap-2.5">
            <img
              src="/images/autify-logo.png"
              alt="Autify"
              className="h-7 w-auto object-contain shrink-0"
            />
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/25 font-bold uppercase tracking-wider">
              OS
            </span>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Middle: Scrollable Categories & Fleet Operations */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-5 no-scrollbar">
          
          {/* SECCIÓN 1: GESTIÓN DISCRETA DE AUTOS (Reemplaza el botón gigante gritón) */}
          <div className="space-y-1.5">
            <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Gestión de Autos
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  if (onOpenNewVehicleModal) onOpenNewVehicleModal();
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/[0.04] border border-white/5 hover:border-[#CCFF00]/30 flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-[#CCFF00]/15 text-[#CCFF00] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span>Agregar Vehículo</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#CCFF00] transition-colors" />
              </button>

              <button
                onClick={() => {
                  setSelectedStatus('all');
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className="w-full px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Car className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span>Gestionar Flota</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </button>
            </div>
          </div>

          {/* SECCIÓN 2: OPERACIONES DE FLOTA */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Operaciones de Flota</span>
              <span className="font-mono text-slate-400 font-bold">{totalVehicles}</span>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  setSelectedStatus('all');
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                  selectedStatus === 'all'
                    ? 'bg-white/[0.08] text-white font-bold border border-white/10 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Car className="w-4 h-4 text-blue-400" />
                  <span>Todos los Autos</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-300 font-semibold">
                  {totalVehicles}
                </span>
              </button>

              <button
                onClick={() => {
                  setSelectedStatus('in_repair');
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                  selectedStatus === 'in_repair'
                    ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/25 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>En Taller</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-bold">
                  {statusCounts['in_repair'] || 0}
                </span>
              </button>

              <button
                onClick={() => {
                  setSelectedStatus('for_sale');
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                  selectedStatus === 'for_sale'
                    ? 'bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/25 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  <span>En Venta</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-bold">
                  {statusCounts['for_sale'] || 0}
                </span>
              </button>

              <button
                onClick={() => {
                  setSelectedStatus('rented');
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                  selectedStatus === 'rented'
                    ? 'bg-purple-500/15 text-purple-300 font-bold border border-purple-500/25 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-4 h-4 text-purple-400" />
                  <span>En Renta</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 font-bold">
                  {statusCounts['rented'] || 0}
                </span>
              </button>

              <button
                onClick={() => {
                  setSelectedStatus('sold');
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                  selectedStatus === 'sold'
                    ? 'bg-slate-500/20 text-slate-200 font-bold border border-slate-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-400" />
                  <span>Vendidos</span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-400 font-semibold">
                  {statusCounts['sold'] || 0}
                </span>
              </button>
            </div>
          </div>

          {/* SECCIÓN 3: FINANZAS & RENTABILIDAD */}
          <div className="space-y-1.5">
            <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Finanzas & Rentabilidad
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  if (onSelectKpi) onSelectKpi('realized-profit');
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className="w-full px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Ganancia Neta Real</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </button>

              <button
                onClick={() => {
                  if (onSelectKpi) onSelectKpi('active-capital');
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className="w-full px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <DollarSign className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span>Capital Activo</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </button>

              <button
                onClick={() => {
                  if (onSelectKpi) onSelectKpi('repair-costs');
                  if (setIsMobileOpen) setIsMobileOpen(false);
                }}
                className="w-full px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Wrench className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>Costos Reparación</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </button>
            </div>
          </div>

        </div>

        {/* ================================================================= */}
        {/* BOTTOM PINNED: SISTEMA & CUENTA (ÚNICO CERRAR SESIÓN)             */}
        {/* ================================================================= */}
        <div className="p-3 border-t border-white/[0.08] bg-[#050608]">
          <div className="space-y-1.5">
            <span className="block px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Sistema & Cuenta
            </span>

            {/* Active User Card with ONLY ONE logout button */}
            <div className="p-2.5 rounded-xl bg-[#0F1014] border border-white/[0.06] flex items-center justify-between gap-2.5 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 p-[1.5px] shrink-0">
                  <div className="w-full h-full rounded-[6px] bg-[#141619] flex items-center justify-center text-white font-bold text-xs uppercase font-mono">
                    {currentUser?.name ? currentUser.name.slice(0, 2) : 'AU'}
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate leading-tight">
                    {currentUser?.name || 'Administrador'}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 truncate leading-tight">
                    {currentUser?.email || 'dealer@autify.com'}
                  </p>
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={() => {
                    if (onLogout) onLogout();
                    if (setIsMobileOpen) setIsMobileOpen(false);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer shrink-0"
                  title="Cerrar Sesión"
                  aria-label="Cerrar Sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};
