import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Wrench,
  TrendingUp,
  Tag,
  Gauge,
  Clock,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { formatCurrency, formatMileage, calculateVehicleFinancials } from '../utils/formatters';
import { EXPENSE_CATEGORIES } from '../mockData';

export const VehicleDetailModal = ({
  vehicle,
  onClose,
  onUpdateVehicleStatus,
  onAddExpense,
  onDeleteExpense,
  onUpdatePrice,
  onCopyVin
}) => {
  if (!vehicle) return null;

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [salePriceInput, setSalePriceInput] = useState(
    vehicle.status === 'sold'
      ? (vehicle.soldPrice || vehicle.estimatedSalePrice || '')
      : (vehicle.estimatedSalePrice || '')
  );

  const fin = calculateVehicleFinancials(vehicle);
  const photos = vehicle.photos && vehicle.photos.length > 0
    ? vehicle.photos
    : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'];

  const handleCopy = () => {
    navigator.clipboard.writeText(vehicle.vin);
    setCopied(true);
    if (onCopyVin) onCopyVin(vehicle.vin);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateExpense = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(expenseAmount);
    if (!expenseDesc.trim() || isNaN(amountNum) || amountNum <= 0) return;

    onAddExpense(vehicle.id, {
      id: `exp-${Date.now()}`,
      category: expenseCategory,
      description: expenseDesc.trim(),
      amount: amountNum,
      date: expenseDate || new Date().toISOString().split('T')[0]
    });

    setExpenseDesc('');
    setExpenseAmount('');
  };

  const handlePriceBlur = () => {
    const parsed = parseFloat(salePriceInput);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdatePrice(vehicle.id, parsed, vehicle.status === 'sold');
    }
  };

  // Status Badge styles
  const getStatusColor = (status) => {
    switch (status) {
      case 'in_repair':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'for_sale':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'sold':
        return 'text-blue-300 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-slate-300 bg-slate-500/10 border-slate-500/20';
    }
  };

  const filteredExpenses = (vehicle.expenses || []).filter((exp) => {
    if (filterCategory === 'ALL') return true;
    return exp.category === filterCategory;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 lg:p-8">
      {/* Modal Surface - Strict Anti-IA Rule: Unified surface, no border-t-4 or top stripes */}
      <div className="relative w-full max-w-7xl rounded-2xl border border-white/[0.08] bg-[#141619] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#141619] shrink-0">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusColor(vehicle.status)}`}>
              {vehicle.status === 'in_repair' && 'En Taller / Reparación'}
              {vehicle.status === 'for_sale' && 'Disponible en Venta'}
              {vehicle.status === 'sold' && 'Venta Cerrada (Liquidado)'}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h2>
            <span className="text-xs font-mono text-slate-400 hidden sm:inline-block">
              ID: {vehicle.id}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Panel Workshop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06] flex-1">
          
          {/* ======================================================== */}
          {/* PANEL IZQUIERDO (4 cols): Fotos, Specs y Status Selector */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 p-5 sm:p-6 flex flex-col gap-5 overflow-y-auto">
            
            {/* Horizontal Photo Gallery / Carousel */}
            <div>
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#1E2025] border border-white/5">
                <img
                  src={photos[activePhotoIdx]}
                  alt="Foto del vehículo"
                  className="w-full h-full object-cover"
                />

                {photos.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between p-2 pointer-events-none">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
                      }}
                      className="pointer-events-auto p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-all backdrop-blur-md"
                      title="Foto anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
                      }}
                      className="pointer-events-auto p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-all backdrop-blur-md"
                      title="Siguiente foto"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {/* Photo counter */}
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-mono text-slate-300 border border-white/10">
                  {activePhotoIdx + 1} / {photos.length}
                </div>
              </div>

              {/* Horizontal Thumbnails Carousel */}
              {photos.length > 1 && (
                <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1 no-scrollbar">
                  {photos.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        activePhotoIdx === idx
                          ? 'border-emerald-500 opacity-100 shadow-glow-emerald'
                          : 'border-transparent opacity-50 hover:opacity-80'
                      }`}
                    >
                      <img src={url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Status Switcher Segmented Control */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Fase de Arbitraje / Estado
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#1E2025] border border-white/5">
                <button
                  type="button"
                  onClick={() => onUpdateVehicleStatus(vehicle.id, 'in_repair')}
                  className={`py-2 px-1 text-xs font-semibold rounded-lg transition-all text-center ${
                    vehicle.status === 'in_repair'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-glow-amber'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Reparación
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateVehicleStatus(vehicle.id, 'for_sale')}
                  className={`py-2 px-1 text-xs font-semibold rounded-lg transition-all text-center ${
                    vehicle.status === 'for_sale'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-emerald'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  En Venta
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateVehicleStatus(vehicle.id, 'sold')}
                  className={`py-2 px-1 text-xs font-semibold rounded-lg transition-all text-center ${
                    vehicle.status === 'sold'
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-glow-electric'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Vendido
                </button>
              </div>
            </div>

            {/* Technical Specifications Sub-container */}
            <div className="rounded-xl bg-[#1E2025] border border-white/5 p-4 flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Ficha Técnica (USA)
              </h3>

              {/* VIN */}
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                <span className="text-xs text-slate-400">VIN (17 chars)</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-slate-200 tracking-wider">
                    {vehicle.vin}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-all"
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
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5" /> Millas
                </span>
                <span className="font-mono text-xs font-semibold text-slate-200">
                  {formatMileage(vehicle.mileage)}
                </span>
              </div>

              {/* Color */}
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                <span className="text-xs text-slate-400">Color Exterior</span>
                <span className="text-xs font-medium text-slate-200">
                  {vehicle.color}
                </span>
              </div>

              {/* Title Status */}
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Estatus de Título
                </span>
                <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                  vehicle.titleStatus === 'Clean'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    : vehicle.titleStatus === 'Salvage'
                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                    : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                }`}>
                  {vehicle.titleStatus} Title
                </span>
              </div>

              {/* Purchase Date & Days in stock */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Días en Inventario
                </span>
                <div className="text-right">
                  <span className="font-mono text-xs font-semibold text-emerald-400">
                    {fin.daysInStock} días
                  </span>
                  <span className="block text-[10px] text-slate-500 font-mono">
                    Desde {vehicle.purchaseDate}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* PANEL CENTRAL (5 cols): Bitácora de Gastos y Reparaciones */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col gap-4 overflow-y-auto">
            
            {/* Header with totals */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  Bitácora de Gastos y Taller
                </h3>
                <p className="text-xs text-slate-400">
                  {vehicle.expenses?.length || 0} registros contabilizados
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Total Gastos
                </span>
                <span className="font-mono text-base font-bold text-amber-400">
                  {formatCurrency(fin.totalExpenses)}
                </span>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setFilterCategory('ALL')}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                  filterCategory === 'ALL'
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-[#1E2025] text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                Todos
              </button>
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCategory(cat)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                    filterCategory === cat
                      ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                      : 'bg-[#1E2025] text-slate-400 hover:text-slate-200 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Inline Quick Form to Add Expense */}
            <form
              onSubmit={handleCreateExpense}
              className="rounded-xl bg-[#1E2025] border border-white/5 p-3.5 flex flex-col gap-2.5"
            >
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-emerald-400" /> Registrar Nuevo Gasto
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Categoría</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full text-xs bg-[#141619] border border-white/5 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Monto ($ USD)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500 font-mono text-xs">
                      $
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      placeholder="0.00"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      className="w-full text-xs font-mono bg-[#141619] border border-white/5 rounded-lg pl-6 pr-2.5 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Descripción</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Reemplazo de radiador OEM..."
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                    className="w-full text-xs bg-[#141619] border border-white/5 rounded-lg px-2.5 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Fecha</label>
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full text-xs bg-[#141619] border border-white/5 rounded-lg px-2 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-1 py-1.5 px-3 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Agregar Gasto al Vehículo</span>
              </button>
            </form>

            {/* Expenses List */}
            <div className="space-y-2 mt-1">
              {filteredExpenses.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-[#1E2025]/40 p-6 text-center text-xs text-slate-500">
                  No hay gastos registrados en esta categoría.
                </div>
              ) : (
                filteredExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="rounded-xl bg-[#1E2025] border border-white/5 p-3 flex items-center justify-between gap-3 group hover:border-white/10 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                          {exp.category}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {exp.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 truncate font-medium">
                        {exp.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-sm font-bold text-white">
                        {formatCurrency(exp.amount)}
                      </span>
                      <button
                        onClick={() => onDeleteExpense(vehicle.id, exp.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Eliminar gasto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* ======================================================== */}
          {/* PANEL DERECHO (3 cols): Resumen Financiero Tipo Checkout */}
          {/* ======================================================== */}
          <div className="lg:col-span-3 p-5 sm:p-6 flex flex-col justify-between bg-[#141619] gap-6">
            
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Desglose Financiero
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-emerald-400 border border-white/10">
                  En Vivo
                </span>
              </div>

              {/* Financial Accounting breakdown */}
              <div className="space-y-3 rounded-xl bg-[#1E2025] border border-white/5 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Costo Base de Compra</span>
                  <span className="font-mono font-bold text-slate-200">
                    {formatCurrency(fin.purchasePrice)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Reparaciones</span>
                  <span className="font-mono font-bold text-amber-400">
                    + {formatCurrency(fin.totalExpenses)}
                  </span>
                </div>

                <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-semibold">Inversión Total</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {formatCurrency(fin.totalInvestment)}
                  </span>
                </div>
              </div>

              {/* Editable Sale Price Input */}
              <div className="rounded-xl bg-[#1E2025] border border-white/5 p-4 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  {vehicle.status === 'sold' ? 'Monto Real de Venta ($ USD)' : 'Precio de Venta Objetivo ($ USD)'}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={salePriceInput}
                    onChange={(e) => setSalePriceInput(e.target.value)}
                    onBlur={handlePriceBlur}
                    placeholder="0"
                    className="w-full pl-8 pr-3 py-2 text-base font-mono font-bold bg-[#141619] border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <span className="block text-[10px] text-slate-500">
                  Edita el monto y desenfoca para recalcular rentabilidad.
                </span>
              </div>

              {/* Big Emerald Profit Card */}
              <div className="rounded-xl bg-[#1E2025] border border-white/5 p-4 text-center space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  {vehicle.status === 'sold' ? 'Ganancia Neta Realizada' : 'Ganancia Neta Proyectada'}
                </span>
                
                <div className={`text-3xl font-mono font-extrabold tracking-tight ${
                  fin.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {fin.netProfit >= 0 ? '+' : ''}{formatCurrency(fin.netProfit)}
                </div>

                <div className={`text-xs font-mono font-bold mt-1 ${
                  fin.roi >= 0 ? 'text-emerald-400/90' : 'text-rose-400/90'
                }`}>
                  {fin.roi >= 0 ? '+' : ''}{fin.roi.toFixed(1)}% Retorno (ROI)
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="space-y-2 pt-4 border-t border-white/[0.06]">
              {vehicle.status === 'in_repair' && (
                <button
                  type="button"
                  onClick={() => onUpdateVehicleStatus(vehicle.id, 'for_sale')}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 shadow-glow-emerald active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Tag className="w-4 h-4" />
                  <span>Publicar en Venta</span>
                </button>
              )}

              {vehicle.status === 'for_sale' && (
                <button
                  type="button"
                  onClick={() => onUpdateVehicleStatus(vehicle.id, 'sold')}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 shadow-glow-emerald active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Marcar como Vendido / Cerrar Venta</span>
                </button>
              )}

              {vehicle.status === 'sold' && (
                <button
                  type="button"
                  onClick={() => onUpdateVehicleStatus(vehicle.id, 'for_sale')}
                  className="w-full py-3 px-4 rounded-xl bg-[#1E2025] border border-white/10 text-slate-200 font-semibold text-sm hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Reabrir a "En Venta"</span>
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
