import React from 'react';
import { Search, Plus, Car, Layers, SlidersHorizontal, RefreshCw, LogOut, User } from 'lucide-react';
import { VEHICLE_STATUSES } from '../mockData';

export const Navbar = ({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  statusCounts,
  onOpenNewVehicleModal,
  onResetData,
  currentUser,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#0B0C0E]/90 backdrop-blur-md border-b border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        {/* Main top row: Brand + Search + User + Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Platform Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/images/autify-logo.png"
                alt="Autify"
                className="h-7 sm:h-8 w-auto object-contain shrink-0"
              />
              <div className="hidden sm:block border-l border-white/10 pl-3">
                <p className="text-[11px] text-slate-400 font-medium">
                  Reconditioning & Arbitrage • USA Market
                </p>
              </div>
            </div>

            {/* Mobile Actions: User info + New Vehicle button + Logout */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={onOpenNewVehicleModal}
                className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500 text-black font-semibold shadow-glow-emerald hover:bg-emerald-400 active:scale-95 transition-all"
                title="Nuevo Vehículo"
              >
                <Plus className="w-5 h-5" />
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#1E2025] text-slate-400 hover:text-rose-400 border border-white/5 active:scale-95 transition-all"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Search Bar + Controls */}
          <div className="flex items-center gap-3 flex-1 md:max-w-xl">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por VIN, Marca o Modelo..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-[#1E2025] border border-white/5 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40 transition-all font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-white"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Desktop New Vehicle Button */}
            <button
              onClick={onOpenNewVehicleModal}
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-sm font-semibold hover:bg-emerald-400 shadow-glow-emerald active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nuevo</span>
            </button>

            {/* Reset mock data button (subtle) */}
            <button
              onClick={onResetData}
              title="Restablecer datos demo"
              className="p-2 rounded-xl bg-[#1E2025] border border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/10 transition-all shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Active User Profile & Logout (Desktop / Tablet) */}
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/[0.08] shrink-0">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#1E2025] border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/30 to-blue-500/30 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center border border-white/10">
                    {currentUser.avatarInitials || 'US'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <span className="block text-xs font-bold text-slate-200 leading-tight">
                      {currentUser.name}
                    </span>
                    <span className="block text-[10px] text-slate-400 leading-tight font-mono">
                      {currentUser.role?.split('&')[0]?.trim() || 'Manager'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Cerrar Sesión"
                  className="p-2 rounded-xl bg-[#1E2025] border border-white/5 text-slate-400 hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/5 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Tabs Bar (Horizontal scrolling on mobile/tablet) */}
        <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {VEHICLE_STATUSES.map((tab) => {
            const count = statusCounts[tab.value] ?? 0;
            const isActive = selectedStatus === tab.value;

            return (
              <button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-glow-electric font-semibold'
                    : 'bg-[#1E2025] text-slate-300 hover:bg-[#252830] hover:text-white border border-white/5'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-blue-900/60 text-blue-200'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
