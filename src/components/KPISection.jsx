import React from 'react';
import { DollarSign, Wrench, TrendingUp, CheckCircle, Car } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const KPISection = ({ kpis }) => {
  const cards = [
    {
      id: 'active-capital',
      title: 'Capital en Inventario Activo',
      value: formatCurrency(kpis.activeInventoryCapital),
      subtitle: `${kpis.activeCount} vehículo${kpis.activeCount === 1 ? '' : 's'} en proceso`,
      icon: DollarSign,
      iconColor: 'text-blue-400',
      badgeBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      badgeText: 'Activo'
    },
    {
      id: 'repair-costs',
      title: 'Total Gastado en Reparaciones',
      value: formatCurrency(kpis.totalSpentRepairs),
      subtitle: 'Piezas, pintura, taller y DMV',
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
      subtitle: `${kpis.soldCount} unidad${kpis.soldCount === 1 ? '' : 'es'} liquidada${kpis.soldCount === 1 ? '' : 's'}`,
      icon: CheckCircle,
      iconColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      badgeText: 'Cerrado'
    }
  ];

  return (
    <section aria-label="KPIs Financieros del Taller" className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              className="rounded-xl border border-white/[0.07] bg-[#141619] p-5 flex flex-col justify-between transition-all duration-200 hover:border-white/[0.12]"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${card.badgeBg}`}>
                  {card.badgeText}
                </span>
              </div>

              <div className="my-1">
                <div className="text-2xl lg:text-3xl font-bold font-mono text-white tracking-tight">
                  {card.value}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/[0.04] mt-2">
                <span>{card.subtitle}</span>
                <IconComponent className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
