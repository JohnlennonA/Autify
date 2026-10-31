import React, { useState } from 'react';
import { Copy, Check, Clock, Gauge, ArrowUpRight, DollarSign, Wrench } from 'lucide-react';
import { formatCurrency, formatMileage, calculateVehicleFinancials } from '../utils/formatters';

export const VehicleCard = ({ vehicle, onSelectVehicle, onCopyVin }) => {
  const [copied, setCopied] = useState(false);
  const fin = calculateVehicleFinancials(vehicle);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(vehicle.vin);
    setCopied(true);
    if (onCopyVin) onCopyVin(vehicle.vin);
    setTimeout(() => setCopied(false), 2000);
  };

  // Status Badge styles
  const getStatusBadge = () => {
    switch (vehicle.status) {
      case 'in_repair':
        return {
          text: 'En Reparación',
          className: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        };
      case 'for_sale':
        return {
          text: 'En Venta',
          className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        };
      case 'sold':
        return {
          text: 'Vendido',
          className: 'bg-blue-500/10 text-blue-300 border-blue-500/20'
        };
      default:
        return {
          text: vehicle.status,
          className: 'bg-slate-500/10 text-slate-300 border-slate-500/20'
        };
    }
  };

  // Title Status Badge
  const getTitleBadge = () => {
    switch (vehicle.titleStatus) {
      case 'Clean':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      case 'Salvage':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
      case 'Rebuilt':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
      default:
        return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
    }
  };

  const statusBadge = getStatusBadge();
  const titleClass = getTitleBadge();
  const mainPhoto = vehicle.photos?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';

  const isProfitable = fin.netProfit >= 0;

  return (
    <div
      onClick={() => onSelectVehicle(vehicle)}
      className="group rounded-xl border border-white/[0.07] bg-[#141619] p-5 flex flex-col justify-between transition-all duration-200 hover:border-white/[0.16] hover:bg-[#16181d] cursor-pointer"
    >
      <div>
        {/* Photo + Badges Overlay */}
        <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-[#1E2025] mb-4">
          <img
            src={mainPhoto}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* Badges Container */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-md shadow-md ${statusBadge.className}`}>
              {statusBadge.text}
            </span>
            <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border backdrop-blur-md shadow-md ${titleClass}`}>
              {vehicle.titleStatus} Title
            </span>
          </div>

          {/* Stock Days Pill */}
          <div className="absolute bottom-2.5 right-2.5 pointer-events-none">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#0B0C0E]/80 backdrop-blur-md text-slate-300 border border-white/10">
              <Clock className="w-3 h-3 text-slate-400" />
              {fin.daysInStock} d en stock
            </span>
          </div>
        </div>

        {/* Vehicle Header: Year Make Model */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Color: <span className="text-slate-300 font-medium">{vehicle.color}</span>
            </p>
          </div>
        </div>

        {/* Technical specs row: VIN + Mileage */}
        <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-lg bg-[#1E2025] border border-white/5">
          {/* VIN with copy */}
          <div className="flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">VIN</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-xs text-slate-200 font-semibold tracking-wide truncate">
                {vehicle.vin}
              </span>
              <button
                onClick={handleCopy}
                className="text-slate-400 hover:text-white transition-colors p-0.5 rounded hover:bg-white/5"
                title="Copiar VIN"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Mileage */}
          <div className="flex flex-col justify-center text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-end gap-1">
              <Gauge className="w-3 h-3" /> Millaje
            </span>
            <span className="font-mono text-xs text-slate-200 font-semibold mt-0.5">
              {formatMileage(vehicle.mileage)}
            </span>
          </div>
        </div>
      </div>

      {/* 3-Column Financial Breakdown */}
      <div className="pt-3 border-t border-white/[0.05] mt-2">
        <div className="grid grid-cols-3 gap-2 text-center">
          
          {/* Col 1: Total Investment */}
          <div className="p-2 rounded-lg bg-[#1E2025]/60 border border-white/[0.03]">
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider truncate">
              Inversión Total
            </span>
            <span className="block font-mono text-xs sm:text-sm font-bold text-white mt-1">
              {formatCurrency(fin.totalInvestment)}
            </span>
            <span className="block text-[10px] text-slate-400 truncate mt-0.5 font-mono">
              Rep: {formatCurrency(fin.totalExpenses)}
            </span>
          </div>

          {/* Col 2: Target Sale Price */}
          <div className="p-2 rounded-lg bg-[#1E2025]/60 border border-white/[0.03]">
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider truncate">
              {vehicle.status === 'sold' ? 'Vendido Por' : 'P. Estimado'}
            </span>
            <span className="block font-mono text-xs sm:text-sm font-bold text-slate-200 mt-1">
              {formatCurrency(fin.targetPrice)}
            </span>
            <span className="block text-[10px] text-slate-400 truncate mt-0.5">
              {vehicle.status === 'sold' ? 'Cerrado' : 'Target'}
            </span>
          </div>

          {/* Col 3: Net Margin / ROI */}
          <div className="p-2 rounded-lg bg-[#1E2025]/60 border border-white/[0.03]">
            <span className="block text-[10px] text-slate-400 uppercase tracking-wider truncate">
              Margen Neto
            </span>
            <span className={`block font-mono text-xs sm:text-sm font-bold mt-1 ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isProfitable ? '+' : ''}{formatCurrency(fin.netProfit)}
            </span>
            <span className={`block text-[10px] font-mono font-medium truncate mt-0.5 ${isProfitable ? 'text-emerald-400/90' : 'text-rose-400/90'}`}>
              {isProfitable ? '+' : ''}{fin.roi.toFixed(1)}% ROI
            </span>
          </div>

        </div>

        {/* View Details CTA */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 group-hover:text-emerald-400 transition-colors">
          <span className="font-medium">Gestionar taller y bitácora</span>
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
