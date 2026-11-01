import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Filter,
  Download,
  Car,
  CheckCircle2,
  Tag,
  Key,
  Wrench,
  DollarSign,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  Plus,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { formatCurrency, formatMileage, calculateVehicleFinancials } from '../utils/formatters';
import { validateStatusTransition, STATUS_LABELS } from '../utils/businessLogic';

export const FleetManagerModal = ({
  isOpen,
  onClose,
  vehicles = [],
  onUpdateVehicleStatus,
  onSelectVehicle,
  onOpenNewVehicleModal
}) => {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedVin, setCopiedVin] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);

  const handleCopyVin = (e, vin) => {
    e.stopPropagation();
    navigator.clipboard.writeText(vin);
    setCopiedVin(vin);
    setTimeout(() => setCopiedVin(null), 2000);
  };

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
      const q = searchTerm.toLowerCase().trim();
      if (!q) return matchesStatus;

      const title = `${v.year} ${v.make} ${v.model}`.toLowerCase();
      const vin = (v.vin || '').toLowerCase();
      const color = (v.color || '').toLowerCase();
      const statusLabel = (STATUS_LABELS[v.status] || '').toLowerCase();
      return matchesStatus && (title.includes(q) || vin.includes(q) || color.includes(q) || statusLabel.includes(q));
    });
  }, [vehicles, statusFilter, searchTerm]);

  // Overall Financial Totals
  const totals = useMemo(() => {
    let totalInv = 0;
    let totalExpenses = 0;
    let totalProjectedProfit = 0;
    let availableCount = 0;
    let forSaleCount = 0;
    let rentedCount = 0;
    let repairCount = 0;
    let soldCount = 0;

    vehicles.forEach((v) => {
      const fin = calculateVehicleFinancials(v);
      totalInv += fin.totalInvestment;
      totalExpenses += fin.totalExpenses;
      totalProjectedProfit += fin.netProfit;

      if (v.status === 'available') availableCount++;
      if (v.status === 'for_sale') forSaleCount++;
      if (v.status === 'rented') rentedCount++;
      if (v.status === 'in_repair') repairCount++;
      if (v.status === 'sold') soldCount++;
    });

    return {
      totalInv,
      totalExpenses,
      totalProjectedProfit,
      availableCount,
      forSaleCount,
      rentedCount,
      repairCount,
      soldCount
    };
  }, [vehicles]);

  // Handle inline status change with business rules
  const handleInlineStatusChange = (vehicle, newStatus) => {
    const check = validateStatusTransition(vehicle, newStatus);
    if (!check.allowed) {
      setAlertMessage({
        title: 'Cambio de estado no permitido',
        message: check.reason
      });
      return;
    }

    if (onUpdateVehicleStatus) {
      onUpdateVehicleStatus(vehicle.id, newStatus);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'VIN',
      'Año',
      'Marca',
      'Modelo',
      'Color',
      'Millas',
      'Título',
      'Estado Actual',
      'Precio Compra ($)',
      'Gastos Registrados ($)',
      'Inversión Total ($)',
      'Precio Venta / Estimado ($)',
      'Utilidad Estimada / Real ($)',
      'ROI (%)'
    ];

    const rows = filteredVehicles.map((v) => {
      const fin = calculateVehicleFinancials(v);
      return [
        v.id,
        `"${v.vin}"`,
        v.year,
        `"${v.make}"`,
        `"${v.model}"`,
        `"${v.color || ''}"`,
        v.mileage || 0,
        `"${v.titleStatus || 'Clean'}"`,
        `"${STATUS_LABELS[v.status] || v.status}"`,
        fin.purchasePrice,
        fin.totalExpenses,
        fin.totalInvestment,
        fin.targetPrice,
        fin.netProfit,
        fin.roi.toFixed(1)
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `autify_inventario_flota_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return { text: 'Disponible', class: 'bg-teal-500/15 text-teal-300 border-teal-500/30' };
      case 'for_sale':
        return { text: 'En Venta', class: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      case 'rented':
        return { text: 'En Renta', class: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
      case 'in_repair':
        return { text: 'En Taller', class: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      case 'sold':
        return { text: 'Vendido', class: 'bg-blue-500/15 text-blue-300 border-blue-500/30' };
      default:
        return { text: status, class: 'bg-slate-500/15 text-slate-300 border-slate-500/30' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-6 animate-fade-in">
      <div className="bg-[#0F1013] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-7xl h-[94vh] sm:h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Mobile sheet drag handle indicator */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#141619] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-sm shrink-0">
              <SlidersHorizontal className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight truncate">Centro de Gestión de Flota</h2>
                <span className="text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/25 font-bold shrink-0">
                  {vehicles.length} Unidades
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate hidden sm:block">
                Matriz ejecutiva: supervisión operativa, costos en línea y exportación contable
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#1E2025] hover:bg-[#2A2E35] text-slate-200 text-xs font-semibold flex items-center gap-1.5 sm:gap-2 border border-white/10 transition-all cursor-pointer hover:border-white/20 active:scale-95"
              title="Descargar inventario en CSV / Excel"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            {onOpenNewVehicleModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNewVehicleModal();
                }}
                className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden xs:inline sm:inline">Agregar Auto</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3 bg-[#111317] border-b border-white/[0.06] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 shrink-0">
          <div className="p-2 sm:p-2.5 rounded-xl bg-[#181A1F] border border-white/5 min-w-0">
            <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold block truncate">Capital en Flota</span>
            <span className="font-mono text-xs sm:text-sm font-bold text-white truncate block">{formatCurrency(totals.totalInv)}</span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-[#181A1F] border border-white/5 min-w-0">
            <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold block truncate">Gastos Registrados</span>
            <span className="font-mono text-xs sm:text-sm font-bold text-amber-400 truncate block">{formatCurrency(totals.totalExpenses)}</span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-[#181A1F] border border-white/5 min-w-0">
            <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-semibold block truncate">Utilidad Estimada</span>
            <span className="font-mono text-xs sm:text-sm font-bold text-emerald-400 truncate block">{formatCurrency(totals.totalProjectedProfit)}</span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-[#181A1F] border border-teal-500/20 min-w-0">
            <span className="text-[9px] sm:text-[10px] text-teal-400 uppercase font-semibold block truncate">En Patio (Stock)</span>
            <span className="font-mono text-xs sm:text-sm font-bold text-teal-300 truncate block">{totals.availableCount} autos</span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-[#181A1F] border border-purple-500/20 min-w-0">
            <span className="text-[9px] sm:text-[10px] text-purple-400 uppercase font-semibold block truncate">En Renta Activa</span>
            <span className="font-mono text-xs sm:text-sm font-bold text-purple-300 truncate block">{totals.rentedCount} autos</span>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-[#181A1F] border border-amber-500/20 min-w-0">
            <span className="text-[9px] sm:text-[10px] text-amber-400 uppercase font-semibold block truncate">En Taller / Rep.</span>
            <span className="font-mono text-xs sm:text-sm font-bold text-amber-300 truncate block">{totals.repairCount} autos</span>
          </div>
        </div>

        {/* Toolbar: Search & Status Pills */}
        <div className="p-4 sm:px-6 border-b border-white/[0.06] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0F1013] shrink-0">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por marca, modelo, VIN o color..."
              className="w-full bg-[#181A1F] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-sans"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'Todos', count: vehicles.length },
              { id: 'available', label: 'Disponibles', count: totals.availableCount },
              { id: 'for_sale', label: 'En Venta', count: totals.forSaleCount },
              { id: 'rented', label: 'En Renta', count: totals.rentedCount },
              { id: 'in_repair', label: 'En Taller', count: totals.repairCount },
              { id: 'sold', label: 'Vendidos', count: totals.soldCount }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-[#181A1F] text-slate-400 hover:text-white hover:bg-[#20232A]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.id ? 'bg-black/30 text-white' : 'bg-white/5 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Horizontal Scroll Hint */}
        <div className="lg:hidden px-3.5 py-1.5 bg-blue-500/10 border-b border-blue-500/20 text-[11px] text-blue-300 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5 font-medium">
            <span>👉</span>
            <span>Desliza la tabla para ver costos, margen y acciones</span>
          </span>
          <span className="font-mono text-[10px] bg-blue-500/20 px-2 py-0.5 rounded text-blue-200 shrink-0">
            ⇄ Deslizar
          </span>
        </div>

        {/* Table Container with smooth horizontal scrolling */}
        <div className="flex-1 overflow-x-auto overflow-y-auto smooth-scroll-touch scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[960px]">
            <thead className="sticky top-0 z-20 bg-[#141619] border-b border-white/[0.08] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 min-w-[240px]">Vehículo / VIN</th>
                <th className="py-3 px-3 min-w-[170px]">Estado Operativo</th>
                <th className="py-3 px-3 text-right min-w-[105px] whitespace-nowrap">Compra</th>
                <th className="py-3 px-3 text-right min-w-[95px] whitespace-nowrap">Gastos</th>
                <th className="py-3 px-3 text-right min-w-[110px] whitespace-nowrap">Inversión Total</th>
                <th className="py-3 px-3 text-right min-w-[110px] whitespace-nowrap">Target / Venta</th>
                <th className="py-3 px-3 text-right min-w-[115px] whitespace-nowrap">Utilidad Proy.</th>
                <th className="py-3 px-4 text-center min-w-[95px] whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    No se encontraron vehículos que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => {
                  const fin = calculateVehicleFinancials(vehicle);
                  const badge = getStatusBadge(vehicle.status);
                  const photo = vehicle.photos?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80';

                  return (
                    <tr
                      key={vehicle.id}
                      onClick={() => {
                        if (onSelectVehicle) onSelectVehicle(vehicle);
                      }}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      {/* Vehicle Column */}
                      <td className="py-3 px-4 min-w-[240px]">
                        <div className="flex items-center gap-3">
                          <img
                            src={photo}
                            alt=""
                            className="w-12 h-9 rounded-lg object-cover bg-black/40 border border-white/10 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5 truncate">
                              <span>{vehicle.year} {vehicle.make} {vehicle.model}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                              <span className="flex items-center gap-1">
                                {vehicle.vin}
                                <button
                                  type="button"
                                  onClick={(e) => handleCopyVin(e, vehicle.vin)}
                                  className="text-slate-500 hover:text-white"
                                  title="Copiar VIN"
                                >
                                  {copiedVin === vehicle.vin ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </span>
                              <span>•</span>
                              <span>{formatMileage(vehicle.mileage)}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status Selector Dropdown */}
                      <td className="py-3 px-3 min-w-[170px]" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={vehicle.status}
                          onChange={(e) => handleInlineStatusChange(vehicle, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none transition-all cursor-pointer ${badge.class}`}
                        >
                          <option value="available" className="bg-[#141619] text-teal-300">🟢 Disponible (Patio)</option>
                          <option value="for_sale" className="bg-[#141619] text-emerald-300">🏷️ En Venta</option>
                          <option value="rented" className="bg-[#141619] text-purple-300">🔑 En Renta</option>
                          <option value="in_repair" className="bg-[#141619] text-amber-300">🛠️ En Taller</option>
                          <option value="sold" className="bg-[#141619] text-blue-300">💰 Vendido</option>
                        </select>
                      </td>

                      {/* Purchase Price */}
                      <td className="py-3 px-3 text-right font-mono text-slate-300 whitespace-nowrap min-w-[105px]">
                        {formatCurrency(fin.purchasePrice)}
                      </td>

                      {/* Expenses */}
                      <td className="py-3 px-3 text-right font-mono text-amber-400 whitespace-nowrap min-w-[95px]">
                        {formatCurrency(fin.totalExpenses)}
                        <span className="text-[10px] text-slate-500 block font-sans">
                          {vehicle.expenses?.length || 0} reg.
                        </span>
                      </td>

                      {/* Total Investment */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-white whitespace-nowrap min-w-[110px]">
                        {formatCurrency(fin.totalInvestment)}
                      </td>

                      {/* Target Price / Rental */}
                      <td className="py-3 px-3 text-right font-mono text-slate-200 whitespace-nowrap min-w-[110px]">
                        {vehicle.status === 'rented' ? (
                          <>
                            <span className="text-purple-300">{formatCurrency(fin.rentalIncome)}</span>
                            <span className="text-[10px] text-slate-500 block">Cobrado renta</span>
                          </>
                        ) : (
                          formatCurrency(fin.targetPrice)
                        )}
                      </td>

                      {/* Net Profit */}
                      <td className="py-3 px-3 text-right font-mono whitespace-nowrap min-w-[115px]">
                        <span className={`font-bold ${fin.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {fin.netProfit >= 0 ? '+' : ''}{formatCurrency(fin.netProfit)}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          ROI {fin.roi.toFixed(0)}%
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-center whitespace-nowrap min-w-[95px]" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectVehicle) onSelectVehicle(vehicle);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <span>Ficha</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Business Alert Modal inside Fleet Manager */}
        {alertMessage && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#141619] border border-amber-500/30 rounded-2xl p-5 max-w-sm w-full shadow-2xl">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-1.5">{alertMessage.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">{alertMessage.message}</p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setAlertMessage(null)}
                  className="px-4 py-2 rounded-xl bg-[#1E2025] hover:bg-[#2A2E35] text-white text-xs font-semibold cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
