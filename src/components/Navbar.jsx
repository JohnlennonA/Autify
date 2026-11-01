import React from 'react';
import { Search, Plus, RefreshCw, Menu } from 'lucide-react';

export const Navbar = ({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  statusCounts,
  onOpenNewVehicleModal,
  onResetData,
  currentUser,
  onLogout,
  onOpenMobileSidebar
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#000000]/80 backdrop-blur-xl border-b border-white/[0.07] pt-[max(env(safe-area-inset-top,0px),8px)] pwa-header-safe transition-all">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        {/* Main top row */}
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Left: Mobile-only Hamburger & Logo (HIDDEN on tablet & desktop because slim/wide sidebar exists) */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={onOpenMobileSidebar}
              className="p-2 rounded-xl bg-[#141619] border border-white/10 text-slate-300 hover:text-white hover:border-[#CCFF00]/40 transition-all cursor-pointer active:scale-95"
              title="Abrir menú"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            <img
              src="/images/autify-logo.png"
              alt="Autify"
              className="h-6 w-auto object-contain shrink-0"
            />
          </div>

          {/* Center: Search Bar (spans full width on desktop) */}
          <div className="flex items-center gap-2.5 flex-1 max-w-2xl">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por VIN, Marca o Modelo..."
                className="w-full pl-10 pr-10 py-2 text-xs sm:text-sm bg-[#0E1013] border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#CCFF00]/60 focus:ring-1 focus:ring-[#CCFF00]/30 transition-all font-sans"
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
          </div>

          {/* Right: Prominent "+ Nuevo Vehículo" CTA & Refresh Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenNewVehicleModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#CCFF00] text-black text-xs sm:text-sm font-extrabold hover:bg-[#b8e600] shadow-[0_0_15px_rgba(204,255,0,0.25)] active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Nuevo Vehículo</span>
            </button>

            {/* Reset mock data button */}
            <button
              onClick={onResetData}
              title="Restablecer datos demo"
              className="p-2 rounded-xl bg-[#0E1013] border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 transition-all shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
