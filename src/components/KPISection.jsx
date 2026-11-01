import React from 'react';
import {
  DollarSign,
  Wrench,
  TrendingUp,
  CheckCircle,
  Car,
  Key,
  ArrowUpRight,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const KPISection = ({ kpis = {}, onSelectKpi }) => {
  // Primary Financial KPIs
  const financialCards = [
    {
      id: 'active-capital',
      title: 'Capital en Inventario Activo',
      value: formatCurrency(kpis.activeInventoryCapital),
      subtitle: `${kpis.activeCount || 0} vehículo${kpis.activeCount === 1 ? '' : 's'} en proceso`,
      icon: DollarSign,
      iconColor: 'text-blue-400',
      badgeBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      badgeText: 'Activo'
    },
    {
      id: 'repair-costs',
      title: 'Total Gastado en Reparaciones',
      value: formatCurrency(kpis.totalSpentRepairs),
      subtitle: 'Piezas, mecánica, pintura y DMV',
      icon: Wrench,
      iconColor: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      badgeText: 'Invertido'
    },
    {
      id: 'projected-profit',
      title: 'Ganancia Proyectada',
      value: formatCurrency(kpis.projectedProfit),
      subtitle: 'Margen estimado en inventario',
      icon: TrendingUp,
      iconColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      badgeText: 'Target ROI'
    },
    {
      id: 'realized-profit',
      title: 'Ganancia Neta Realizada',
      value: formatCurrency(kpis.realizedProfit),
      subtitle: `${kpis.soldCount || 0} unidad${kpis.soldCount === 1 ? '' : 'es'} liquidada${kpis.soldCount === 1 ? '' : 's'}`,
      icon: CheckCircle,
      iconColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      badgeText: 'Cerrado'
    }
  ];

  // Operational Fleet Status Cards (Total, Rentados, Vendidos, Taller)
  const fleetCards = [
    {
      id: 'fleet-total',
      title: 'Carros en Total',
      value: `${kpis.totalVehicles || 0}`,
      unit: 'unidades',
      subtitle: 'Flota completa registrada',
      icon: Car,
      iconColor: 'text-slate-300',
      badgeBg: 'bg-white/10 text-slate-300 border border-white/10',
      badgeText: 'Flota'
    },
    {
      id: 'rentals',
      title: 'Carros Rentados',
      value: `${kpis.rentedCount || 0}`,
      unit: 'en renta',
      subtitle: `Recaudado: ${formatCurrency(kpis.totalRentalIncome || 0)}`,
      icon: Key,
      iconColor: 'text-purple-400',
      badgeBg: 'bg-purple-500/10 text-purple-300 border border-purple-500/20',
      badgeText: 'Recurrente'
    },
    {
      id: 'for-sale',
      title: 'Carros en Venta',
      value: `${kpis.forSaleCount || 0}`,
      unit: 'listos',
      subtitle: 'Reacondicionados para cliente',
      icon: TrendingUp,
      iconColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
      badgeText: 'Disponibles'
    },
    {
      id: 'sold-cars',
      title: 'Carros Vendidos',
      value: `${kpis.soldCount || 0}`,
      unit: 'vendidos',
      subtitle: 'Arbitrajes finalizados con éxito',
      icon: CheckCircle,
      iconColor: 'text-blue-400',
      badgeBg: 'bg-blue-500/10 text-blue-300 border border-blue-500/20',
      badgeText: 'Histórico'
    }
  ];

  return (
    <section aria-label="KPIs Financieros y Operativos" className="w-full space-y-3">
      
      {/* Row 1: Primary Financial Metrics (Clickable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {financialCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onSelectKpi && onSelectKpi(card.id)}
              className="group rounded-xl border border-white/[0.07] bg-[#141619] p-5 flex flex-col justify-between transition-all duration-200 hover:border-white/[0.18] hover:bg-[#16181e] cursor-pointer relative overflow-hidden"
              role="button"
              tabIndex={0}
              title="Haz clic para ver el desglose detallado"
            >
              {/* Top Row: Title + Badge */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-slate-200 transition-colors">
                  {card.title}
                </span>
                <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${card.badgeBg}`}>
                  {card.badgeText}
                </span>
              </div>

              {/* Value */}
              <div className="my-1.5">
                <div className="text-2xl lg:text-3xl font-bold font-mono text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                  {card.value}
                </div>
              </div>

              {/* Footer: Subtitle + View Details CTA */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/[0.04] mt-1.5">
                <span className="truncate pr-2">{card.subtitle}</span>
                <div className="flex items-center gap-1 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0">
                  <span className="text-[10px] font-medium hidden group-hover:inline">Ver detalle</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Fleet Summary Metrics (Total, Rentados, En Venta, Vendidos) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {fleetCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onSelectKpi && onSelectKpi(card.id)}
              className="group rounded-xl border border-white/[0.05] bg-[#141619]/80 p-3.5 flex flex-col justify-between transition-all duration-200 hover:border-white/[0.15] hover:bg-[#181a20] cursor-pointer"
              role="button"
              tabIndex={0}
              title="Haz clic para ver el desglose"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="text-[11px] font-medium text-slate-400 truncate group-hover:text-slate-200">
                  {card.title}
                </span>
                <IconComponent className={`w-3.5 h-3.5 ${card.iconColor}`} />
              </div>

              <div className="flex items-baseline gap-1.5 my-1">
                <span className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                  {card.value}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {card.unit}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-white/[0.04] mt-1">
                <span className="truncate">{card.subtitle}</span>
                <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-white transition-colors shrink-0" />
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
};
