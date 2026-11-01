import React, { useState } from 'react';
import {
  X,
  DollarSign,
  Wrench,
  TrendingUp,
  CheckCircle,
  Car,
  Key,
  Calendar,
  User,
  Phone,
  FileText,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Filter
} from 'lucide-react';
import { formatCurrency, formatMileage, calculateVehicleFinancials } from '../utils/formatters';
import { EXPENSE_CATEGORIES } from '../mockData';

export const KpiDetailModal = ({
  isOpen,
  kpiId,
  onClose,
  vehicles = [],
  kpis = {},
  onSelectVehicle
}) => {
  if (!isOpen || !kpiId) return null;

  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Collect all expenses across all vehicles with vehicle context
  const allExpenses = [];
  vehicles.forEach((v) => {
    (v.expenses || []).forEach((exp) => {
      allExpenses.push({
        ...exp,
        vehicleId: v.id,
        vehicleName: `${v.year} ${v.make} ${v.model}`,
        vehicleVin: v.vin
      });
    });
  });

  // Category breakdown for repairs
  const expensesByCategory = {};
  EXPENSE_CATEGORIES.forEach((cat) => {
    expensesByCategory[cat] = 0;
  });
  allExpenses.forEach((exp) => {
    const cat = exp.category || 'Otros Gastos';
    expensesByCategory[cat] = (expensesByCategory[cat] || 0) + Number(exp.amount || 0);
  });

  // Categorize vehicles
  const activeVehicles = vehicles.filter((v) => v.status !== 'sold');
  const inRepairVehicles = vehicles.filter((v) => v.status === 'in_repair');
  const forSaleVehicles = vehicles.filter((v) => v.status === 'for_sale');
  const rentedVehicles = vehicles.filter((v) => v.status === 'rented');
  const soldVehicles = vehicles.filter((v) => v.status === 'sold');

  // Modal Configuration by KPI ID
  const getConfig = () => {
    switch (kpiId) {
      case 'active-capital':
        return {
          title: 'Capital en Inventario Activo',
          subtitle: 'Desglose del capital invertido en compra y reparaciones de unidades activas',
          icon: DollarSign,
          iconColor: 'text-blue-400',
          badgeText: `${activeVehicles.length} Unidades Activas`,
          badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        };
      case 'repair-costs':
        return {
          title: 'Total Gastado en Reparaciones',
          subtitle: 'Auditoría detallada por categorías (Repuestos, Taller, Pintura y Trámites)',
          icon: Wrench,
          iconColor: 'text-amber-400',
          badgeText: `${allExpenses.length} Gastos Registrados`,
          badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        };
      case 'projected-profit':
        return {
          title: 'Ganancias Proyectadas',
          subtitle: 'Margen estimado de ganancia y retorno esperado en inventario actual',
          icon: TrendingUp,
          iconColor: 'text-emerald-400',
          badgeText: `${activeVehicles.length} Por Liquidar`,
          badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        };
      case 'realized-profit':
        return {
          title: 'Ganancia Neta Realizada',
          subtitle: 'Historial de utilidades netas en vehículos vendidos y cerrados',
          icon: CheckCircle,
          iconColor: 'text-emerald-400',
          badgeText: `${soldVehicles.length} Ventas Cerradas`,
          badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        };
      case 'rentals':
        return {
          title: 'Vehículos en Renta & Flujo Recibido',
          subtitle: 'Arrendatarios, tarifas vigentes, tiempo transcurrido y cobros recaudados',
          icon: Key,
          iconColor: 'text-purple-400',
          badgeText: `${rentedVehicles.length} en Renta Activa`,
          badgeClass: 'bg-purple-500/10 text-purple-300 border-purple-500/20'
        };
      case 'fleet-total':
        return {
          title: 'Resumen Global de la Flota',
          subtitle: 'Estado operativo de todos los vehículos registrados en Autify',
          icon: Car,
          iconColor: 'text-slate-300',
          badgeText: `${vehicles.length} Total Flota`,
          badgeClass: 'bg-white/10 text-white border-white/20'
        };
      case 'in-repair':
        return {
          title: 'Vehículos en Taller / Reparación',
          subtitle: 'Unidades actualmente en fase de reacondicionamiento mecánico y estético',
          icon: Wrench,
          iconColor: 'text-amber-400',
          badgeText: `${inRepairVehicles.length} en Taller`,
          badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        };
      case 'for-sale':
        return {
          title: 'Vehículos Listos para Venta',
          subtitle: 'Unidades reacondicionadas publicadas y listas para comercializar',
          icon: TrendingUp,
          iconColor: 'text-emerald-400',
          badgeText: `${forSaleVehicles.length} en Venta`,
          badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        };
      case 'sold-cars':
        return {
          title: 'Vehículos Vendidos',
          subtitle: 'Historial comercial y tiempos de arbitraje (flip cycle)',
          icon: CheckCircle,
          iconColor: 'text-blue-400',
          badgeText: `${soldVehicles.length} Liquidados`,
          badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        };
      default:
        return {
          title: 'Detalles de Métricas',
          subtitle: 'Información analítica de la flota',
          icon: DollarSign,
          iconColor: 'text-blue-400',
          badgeText: 'Métricas',
          badgeClass: 'bg-white/10 text-white border-white/20'
        };
    }
  };

  const config = getConfig();
  const IconComp = config.icon;

  const handleVehicleClick = (v) => {
    onClose();
    if (onSelectVehicle) {
      onSelectVehicle(v);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl border border-white/[0.08] bg-[#141619] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.07] bg-[#141619] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#1E2025] border border-white/10 flex items-center justify-center shrink-0">
              <IconComp className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {config.title}
                </h2>
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${config.badgeClass}`}>
                  {config.badgeText}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                {config.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 space-y-6 flex-1">
          
          {/* ================================================================ */}
          {/* VIEW: ACTIVE INVENTORY CAPITAL                                  */}
          {/* ================================================================ */}
          {kpiId === 'active-capital' && (
            <div className="space-y-4">
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#1E2025] border border-white/5">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Capital Comprometido</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-white mt-1 block">
                    {formatCurrency(kpis.activeInventoryCapital)}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Suma de compra + reparaciones</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#1E2025] border border-white/5">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Inversión Promedio</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-blue-400 mt-1 block">
                    {formatCurrency(activeVehicles.length ? kpis.activeInventoryCapital / activeVehicles.length : 0)}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Por vehículo activo</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#1E2025] border border-white/5">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Vehículos Activos</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                    {activeVehicles.length} unidades
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">{inRepairVehicles.length} taller • {forSaleVehicles.length} venta • {rentedVehicles.length} renta</span>
                </div>
              </div>

              {/* Vehicle breakdown table/cards */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Desglose por Vehículo Activo
                </span>
                <div className="divide-y divide-white/[0.04] rounded-xl border border-white/5 bg-[#1E2025]/50 overflow-hidden">
                  {activeVehicles.map((v) => {
                    const fin = calculateVehicleFinancials(v);
                    const percentOfTotal = kpis.activeInventoryCapital > 0
                      ? ((fin.totalInvestment / kpis.activeInventoryCapital) * 100).toFixed(1)
                      : 0;

                    return (
                      <div
                        key={v.id}
                        onClick={() => handleVehicleClick(v)}
                        className="p-3.5 hover:bg-white/[0.03] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={v.photos?.[0]}
                            alt={v.model}
                            className="w-14 h-11 rounded-lg object-cover bg-black shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                                {v.year} {v.make} {v.model}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-white/5 text-slate-400">
                                {v.titleStatus}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400 font-mono">
                              VIN: {v.vin} • Compra: {formatCurrency(fin.purchasePrice)} • Taller: {formatCurrency(fin.totalExpenses)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 text-right">
                          <div>
                            <span className="text-sm font-bold font-mono text-white block">
                              {formatCurrency(fin.totalInvestment)}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              {percentOfTotal}% del capital total
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* VIEW: TOTAL REPAIR COSTS                                         */}
          {/* ================================================================ */}
          {kpiId === 'repair-costs' && (
            <div className="space-y-5">
              {/* Category Breakdown Bar Grid */}
              <div className="p-4 rounded-xl bg-[#1E2025] border border-white/5 space-y-3">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Distribución de Gastos por Categoría
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {EXPENSE_CATEGORIES.map((cat) => {
                    const amount = expensesByCategory[cat] || 0;
                    const percent = kpis.totalSpentRepairs > 0
                      ? ((amount / kpis.totalSpentRepairs) * 100).toFixed(1)
                      : 0;

                    return (
                      <div key={cat} className="p-3 rounded-lg bg-[#141619] border border-white/[0.04]">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-medium text-slate-300">{cat}</span>
                          <span className="font-mono text-amber-400 font-bold">{formatCurrency(amount)}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 mt-1 block text-right">
                          {percent}% del total
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* All Expenses List with Filter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Historial Completo de Gastos Registrados ({allExpenses.length})
                  </span>
                  
                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                    <button
                      onClick={() => setCategoryFilter('ALL')}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                        categoryFilter === 'ALL'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                          : 'bg-[#1E2025] text-slate-400 border-white/5 hover:text-white'
                      }`}
                    >
                      Todos
                    </button>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCategoryFilter(c)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border whitespace-nowrap transition-all ${
                          categoryFilter === c
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                            : 'bg-[#1E2025] text-slate-400 border-white/5 hover:text-white'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="divide-y divide-white/[0.04] rounded-xl border border-white/5 bg-[#1E2025]/50 overflow-hidden">
                  {allExpenses
                    .filter((e) => categoryFilter === 'ALL' || e.category === categoryFilter)
                    .map((exp) => (
                      <div key={exp.id} className="p-3.5 hover:bg-white/[0.02] flex items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">
                              {exp.description}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {exp.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {exp.vehicleName} • Fecha: {exp.date}
                          </p>
                        </div>
                        <span className="text-sm font-bold font-mono text-amber-400 shrink-0">
                          {formatCurrency(exp.amount)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* VIEW: PROJECTED PROFIT                                           */}
          {/* ================================================================ */}
          {kpiId === 'projected-profit' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#1E2025] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-400 block">Utilidad Bruta Proyectada en Inventario</span>
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 mt-1 block">
                    {formatCurrency(kpis.projectedProfit)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Retorno Promedio Proyectado (ROI)</span>
                  <span className="text-xl font-bold font-mono text-emerald-300 mt-1 block">
                    {kpis.activeInventoryCapital > 0 ? ((kpis.projectedProfit / kpis.activeInventoryCapital) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>

              <div className="divide-y divide-white/[0.04] rounded-xl border border-white/5 bg-[#1E2025]/50 overflow-hidden">
                {activeVehicles.map((v) => {
                  const fin = calculateVehicleFinancials(v);
                  return (
                    <div
                      key={v.id}
                      onClick={() => handleVehicleClick(v)}
                      className="p-4 hover:bg-white/[0.03] flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <img src={v.photos?.[0]} alt={v.model} className="w-14 h-11 rounded-lg object-cover bg-black shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                              {v.year} {v.make} {v.model}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300">
                              {v.status === 'for_sale' ? 'En Venta' : v.status === 'in_repair' ? 'En Taller' : 'En Renta'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">
                            Inversión: {formatCurrency(fin.totalInvestment)} • Meta Venta: {formatCurrency(fin.targetPrice)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 text-right">
                        <div>
                          <span className="text-sm font-bold font-mono text-emerald-400 block">
                            +{formatCurrency(fin.netProfit)}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400/80 block">
                            +{fin.roi.toFixed(1)}% ROI estimado
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* VIEW: REALIZED NET PROFIT (SOLD CARS)                            */}
          {/* ================================================================ */}
          {(kpiId === 'realized-profit' || kpiId === 'sold-cars') && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#1E2025] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-slate-400 block">Ganancia Neta en Bolsillo (Realizada)</span>
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 mt-1 block">
                    {formatCurrency(kpis.realizedProfit)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Unidades Liquidadas con Éxito</span>
                  <span className="text-xl font-bold font-mono text-white mt-1 block">
                    {soldVehicles.length} vehículos
                  </span>
                </div>
              </div>

              {soldVehicles.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Aún no hay vehículos marcados como Vendidos.
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04] rounded-xl border border-white/5 bg-[#1E2025]/50 overflow-hidden">
                  {soldVehicles.map((v) => {
                    const fin = calculateVehicleFinancials(v);
                    return (
                      <div
                        key={v.id}
                        onClick={() => handleVehicleClick(v)}
                        className="p-4 hover:bg-white/[0.03] flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <img src={v.photos?.[0]} alt={v.model} className="w-14 h-11 rounded-lg object-cover bg-black shrink-0" />
                          <div>
                            <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors block">
                              {v.year} {v.make} {v.model}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">
                              Compra: {formatCurrency(fin.purchasePrice)} • Gastos: {formatCurrency(fin.totalExpenses)} • Vendido en: {formatCurrency(fin.targetPrice)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 text-right">
                          <div>
                            <span className="text-sm font-bold font-mono text-emerald-400 block">
                              +{formatCurrency(fin.netProfit)}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400/80 block">
                              +{fin.roi.toFixed(1)}% Ganancia Real
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* VIEW: RENTED VEHICLES & RENTAL CASHFLOW                          */}
          {/* ================================================================ */}
          {kpiId === 'rentals' && (
            <div className="space-y-4">
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#1E2025] border border-white/5">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Dinero Total Recibido</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-purple-300 mt-1 block">
                    {formatCurrency(kpis.totalRentalIncome)}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Flujo de caja por rentas activas</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#1E2025] border border-white/5">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Autos en Renta</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-white mt-1 block">
                    {rentedVehicles.length} unidades
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Contratos activos</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#1E2025] border border-white/5">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Depósitos en Garantía</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                    {formatCurrency(rentedVehicles.reduce((acc, v) => acc + (Number(v.rental?.securityDeposit) || 0), 0))}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">En custodia de seguridad</span>
                </div>
              </div>

              {/* Rented Vehicles Cards with Renter Details */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Contratos Activos y Datos del Arrendatario
                </span>

                {rentedVehicles.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs rounded-xl bg-[#1E2025]">
                    No hay vehículos en renta actualmente. Puedes cambiar el estado de cualquier auto a "En Renta" desde su ficha.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rentedVehicles.map((v) => {
                      const rental = v.rental || {};
                      const fin = calculateVehicleFinancials(v);

                      return (
                        <div
                          key={v.id}
                          className="p-4 rounded-xl border border-white/5 bg-[#1E2025] flex flex-col gap-4"
                        >
                          {/* Header: Car Info + CTA */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img src={v.photos?.[0]} alt={v.model} className="w-16 h-12 rounded-lg object-cover bg-black shrink-0" />
                              <div>
                                <h3 className="text-sm font-bold text-white">
                                  {v.year} {v.make} {v.model}
                                </h3>
                                <p className="text-xs text-slate-400 font-mono">
                                  VIN: {v.vin} • Color: {v.color}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleVehicleClick(v)}
                              className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-semibold hover:bg-purple-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>Ver Ficha & Cobros</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Customer & Contract Details Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-white/[0.04]">
                            <div className="p-2.5 rounded-lg bg-[#141619] border border-white/[0.03]">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                                <User className="w-3 h-3 text-purple-400" /> Cliente / Arrendatario
                              </span>
                              <span className="text-xs font-bold text-white mt-1 block">
                                {rental.customerName || 'No asignado'}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono block">
                                {rental.customerPhone || 'Sin teléfono'}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-lg bg-[#141619] border border-white/[0.03]">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                                <FileText className="w-3 h-3 text-purple-400" /> Licencia / Documento
                              </span>
                              <span className="text-xs font-mono text-slate-200 mt-1 block">
                                {rental.customerDoc || 'No registrada'}
                              </span>
                              <span className="text-[11px] text-slate-400 block truncate">
                                {rental.customerEmail || 'Sin email'}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-lg bg-[#141619] border border-white/[0.03]">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                                <Clock className="w-3 h-3 text-purple-400" /> Tiempo Rentado
                              </span>
                              <span className="text-xs font-bold text-emerald-400 mt-1 block font-mono">
                                {fin.rentalDays} días transcurridos
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono block">
                                Desde {rental.startDate || 'N/A'}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-lg bg-[#141619] border border-white/[0.03]">
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-emerald-400" /> Cobrado a la Fecha
                              </span>
                              <span className="text-xs font-bold text-emerald-400 mt-1 block font-mono">
                                {formatCurrency(rental.totalReceived || 0)}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono block">
                                Tarifa: ${rental.rate}/{rental.billingCycle || 'sem'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* VIEW: GLOBAL FLEET TOTAL OR FILTERED STATUS                      */}
          {/* ================================================================ */}
          {(kpiId === 'fleet-total' || kpiId === 'in-repair' || kpiId === 'for-sale') && (
            <div className="space-y-4">
              {/* Status summary pill bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-xl bg-[#1E2025] border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase block">En Taller</span>
                  <span className="text-lg font-bold font-mono text-amber-400 mt-0.5 block">{inRepairVehicles.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#1E2025] border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase block">En Venta</span>
                  <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5 block">{forSaleVehicles.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#1E2025] border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase block">En Renta</span>
                  <span className="text-lg font-bold font-mono text-purple-300 mt-0.5 block">{rentedVehicles.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#1E2025] border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase block">Vendidos</span>
                  <span className="text-lg font-bold font-mono text-blue-300 mt-0.5 block">{soldVehicles.length}</span>
                </div>
              </div>

              {/* Vehicle list */}
              <div className="divide-y divide-white/[0.04] rounded-xl border border-white/5 bg-[#1E2025]/50 overflow-hidden">
                {(kpiId === 'in-repair'
                  ? inRepairVehicles
                  : kpiId === 'for-sale'
                  ? forSaleVehicles
                  : vehicles
                ).map((v) => {
                  const fin = calculateVehicleFinancials(v);
                  return (
                    <div
                      key={v.id}
                      onClick={() => handleVehicleClick(v)}
                      className="p-3.5 hover:bg-white/[0.03] transition-all flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <img src={v.photos?.[0]} alt={v.model} className="w-14 h-11 rounded-lg object-cover bg-black shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                              {v.year} {v.make} {v.model}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-white/5 text-slate-400">
                              {v.status === 'in_repair'
                                ? 'En Taller'
                                : v.status === 'for_sale'
                                ? 'En Venta'
                                : v.status === 'rented'
                                ? 'En Renta'
                                : 'Vendido'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">
                            VIN: {v.vin} • Inversión: {formatCurrency(fin.totalInvestment)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">
                          {formatMileage(v.mileage)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.07] bg-[#141619] flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="hidden sm:inline">
            Haz clic en cualquier vehículo para abrir su ficha técnica y bitácora completa.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all ml-auto cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
