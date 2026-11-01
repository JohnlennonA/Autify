import React, { useState, useEffect, useRef } from 'react';
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
  Filter,
  Car,
  Receipt,
  Search,
  Key,
  User,
  Phone,
  Mail,
  FileText,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  Pencil,
  Camera,
  Paperclip,
  Save,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, formatMileage, calculateVehicleFinancials, normalizeExpenseCategory } from '../utils/formatters';
import { EXPENSE_CATEGORIES, TITLE_STATUSES } from '../mockData';
import { EditVehicleModal } from './EditVehicleModal';

export const VehicleDetailModal = ({
  vehicle,
  onClose,
  onUpdateVehicleStatus,
  onAddExpense,
  onDeleteExpense,
  onUpdatePrice,
  onCopyVin,
  onUpdateRental,
  onAddRentalPayment,
  onTerminateRental,
  onUpdateVehicle,
  onDeleteVehicle
}) => {
  if (!vehicle) return null;

  // View state: 'ficha' | 'renta' | 'gastos' | 'finanzas'
  const [mobileTab, setMobileTab] = useState(vehicle.status === 'rented' ? 'renta' : 'ficha');
  // Desktop center tabs: 'gastos' | 'renta'
  const [centerTab, setCenterTab] = useState(vehicle.status === 'rented' ? 'renta' : 'gastos');
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleConfirmDelete = () => {
    const confirmMsg = `¿Estás seguro de que deseas eliminar permanentemente el vehículo:\n\n${vehicle.year} ${vehicle.make} ${vehicle.model} (VIN: ${vehicle.vin})?\n\nEsta acción no se puede deshacer.`;
    if (window.confirm(confirmMsg)) {
      if (onDeleteVehicle) onDeleteVehicle(vehicle.id);
      onClose();
    }
  };

  // Expense form state
  const [expenseCategory, setExpenseCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseSearch, setExpenseSearch] = useState('');

  // Sale price state
  const [salePriceInput, setSalePriceInput] = useState(
    vehicle.status === 'sold'
      ? (vehicle.soldPrice || vehicle.estimatedSalePrice || '')
      : (vehicle.estimatedSalePrice || '')
  );

  // Rental Setup & Payment Form state
  const [isSettingUpRental, setIsSettingUpRental] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  
  // New Rental Contract Form fields
  const [rentalForm, setRentalForm] = useState({
    customerName: vehicle.rental?.customerName || '',
    customerPhone: vehicle.rental?.customerPhone || '',
    customerEmail: vehicle.rental?.customerEmail || '',
    customerDoc: vehicle.rental?.customerDoc || '',
    startDate: vehicle.rental?.startDate || new Date().toISOString().split('T')[0],
    endDate: vehicle.rental?.endDate || '',
    billingCycle: vehicle.rental?.billingCycle || 'semanal',
    rate: vehicle.rental?.rate || '',
    securityDeposit: vehicle.rental?.securityDeposit || 500,
    odometerStart: vehicle.rental?.odometerStart || vehicle.mileage || 0,
    notes: vehicle.rental?.notes || ''
  });

  // Rental Payment Form fields
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'Zelle',
    concept: 'Pago de Renta',
    date: new Date().toISOString().split('T')[0]
  });

  const fin = calculateVehicleFinancials(vehicle);
  const photos = vehicle.photos && vehicle.photos.length > 0
    ? vehicle.photos
    : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'];

  const rental = vehicle.rental || null;
  const isRented = vehicle.status === 'rented';

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
      case 'rented':
        return 'text-purple-300 bg-purple-500/10 border-purple-500/20';
      case 'sold':
        return 'text-blue-300 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-slate-300 bg-slate-500/10 border-slate-500/20';
    }
  };

  // Handle switching status to rented
  const handleStatusChange = (newStatus) => {
    if (newStatus === 'rented' && !vehicle.rental) {
      setIsSettingUpRental(true);
      setCenterTab('renta');
      setMobileTab('renta');
      return;
    }
    onUpdateVehicleStatus(vehicle.id, newStatus);
    if (newStatus === 'rented') {
      setCenterTab('renta');
      setMobileTab('renta');
    }
  };

  // Submit New Rental Contract
  const handleSaveRentalContract = (e) => {
    e.preventDefault();
    const rateNum = parseFloat(rentalForm.rate) || 0;
    const depositNum = parseFloat(rentalForm.securityDeposit) || 0;

    const newRental = {
      customerName: rentalForm.customerName.trim(),
      customerPhone: rentalForm.customerPhone.trim(),
      customerEmail: rentalForm.customerEmail.trim(),
      customerDoc: rentalForm.customerDoc.trim(),
      startDate: rentalForm.startDate,
      endDate: rentalForm.endDate,
      billingCycle: rentalForm.billingCycle,
      rate: rateNum,
      securityDeposit: depositNum,
      depositReturned: false,
      totalReceived: vehicle.rental?.totalReceived || 0,
      odometerStart: parseInt(rentalForm.odometerStart, 10) || vehicle.mileage,
      notes: rentalForm.notes.trim(),
      payments: vehicle.rental?.payments || []
    };

    if (onUpdateRental) {
      onUpdateRental(vehicle.id, newRental);
    }
    onUpdateVehicleStatus(vehicle.id, 'rented');
    setIsSettingUpRental(false);
    setCenterTab('renta');
    setMobileTab('renta');
  };

  // Submit Rental Payment
  const handleRecordPayment = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(paymentForm.amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const payment = {
      id: `pay-${Date.now()}`,
      amount: amountNum,
      method: paymentForm.method,
      concept: paymentForm.concept.trim() || 'Pago de Renta',
      date: paymentForm.date || new Date().toISOString().split('T')[0]
    };

    if (onAddRentalPayment) {
      onAddRentalPayment(vehicle.id, payment);
    }

    setPaymentForm({
      amount: '',
      method: 'Zelle',
      concept: 'Pago de Renta',
      date: new Date().toISOString().split('T')[0]
    });
    setIsAddingPayment(false);
  };

  const handleEndRental = () => {
    if (window.confirm('¿Finalizar este contrato de renta y retornar el auto a inventario en venta?')) {
      if (onTerminateRental) {
        onTerminateRental(vehicle.id, 'for_sale');
      } else {
        onUpdateVehicleStatus(vehicle.id, 'for_sale');
      }
      setCenterTab('gastos');
      setMobileTab('ficha');
    }
  };

  const filteredExpenses = (vehicle.expenses || []).map((e) => ({
    ...e,
    category: normalizeExpenseCategory(e.category)
  })).filter((exp) => {
    if (!expenseSearch.trim()) return true;
    const q = expenseSearch.toLowerCase().trim();
    const desc = (exp.description || '').toLowerCase();
    const cat = (exp.category || '').toLowerCase();
    const amount = (exp.amount || '').toString();
    const date = (exp.date || '').toLowerCase();
    return desc.includes(q) || cat.includes(q) || amount.includes(q) || date.includes(q);
  });

  const filteredExpensesTotal = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  /* ========================================================================== */
  /* SUB-PANEL 1: Ficha Técnica, Fotos y Estado                                */
  /* ========================================================================== */
  const renderPanelFicha = () => (
    <div className="flex flex-col gap-5">
      {/* Horizontal Photo Gallery / Carousel */}
      <div className="isolate">
        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#1E2025] border border-white/5">
          <img
            src={photos[activePhotoIdx]}
            alt="Foto del vehículo"
            className="w-full h-full object-cover block"
          />

          {photos.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between p-2 pointer-events-none">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
                }}
                className="pointer-events-auto p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-all backdrop-blur-md active:scale-95"
                title="Foto anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
                }}
                className="pointer-events-auto p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-all backdrop-blur-md active:scale-95"
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
                type="button"
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

      {/* Quick Status Switcher Segmented Control (Includes 'rented') */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Estado Operativo del Auto
        </label>
        <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#1E2025] border border-white/5">
          <button
            type="button"
            onClick={() => handleStatusChange('in_repair')}
            className={`py-2 px-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-all text-center cursor-pointer ${
              vehicle.status === 'in_repair'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-glow-amber'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Taller
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange('for_sale')}
            className={`py-2 px-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-all text-center cursor-pointer ${
              vehicle.status === 'for_sale'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-emerald'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            En Venta
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange('rented')}
            className={`py-2 px-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-all text-center cursor-pointer ${
              vehicle.status === 'rented'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-glow-purple'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            En Renta
          </button>
          <button
            type="button"
            onClick={() => handleStatusChange('sold')}
            className={`py-2 px-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-all text-center cursor-pointer ${
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
          <span className="text-xs text-slate-400">VIN (17 caracteres)</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-slate-200 tracking-wider">
              {vehicle.vin}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
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
            <Gauge className="w-3.5 h-3.5" /> Millaje
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

      {/* Vehicle Actions: Only in Ficha Técnica */}
      <div className="space-y-2 pt-1.5">
        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className="w-full py-2.5 px-3 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 hover:text-white border border-blue-500/30 hover:border-blue-500/50 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
          id="btn-ir-modificar-caracteristicas"
        >
          <Pencil className="w-3.5 h-3.5 text-blue-400" />
          <span>Ir a Modificar Características</span>
        </button>

        <button
          type="button"
          onClick={handleConfirmDelete}
          className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          id="btn-ir-eliminar-vehiculo"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Eliminar Vehículo</span>
        </button>
      </div>
    </div>
  );

  /* ========================================================================== */
  /* SUB-PANEL 2: Módulo de Gestión de Renta                                    */
  /* ========================================================================== */
  const renderPanelRenta = () => (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Gestión de Renta / Alquiler
            </h3>
            <p className="text-xs text-slate-400">
              Control de cliente, contrato y recaudación en tiempo real
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsSettingUpRental(!isSettingUpRental)}
          className="text-xs px-2.5 py-1 rounded-lg bg-[#1E2025] hover:bg-white/5 border border-white/5 text-slate-300 transition-all cursor-pointer"
        >
          {isSettingUpRental ? 'Cancelar Edición' : rental ? 'Editar Contrato' : 'Configurar Renta'}
        </button>
      </div>

      {/* Setup or Edit Contract Form */}
      {isSettingUpRental && (
        <form onSubmit={handleSaveRentalContract} className="rounded-xl bg-[#1E2025] border border-purple-500/30 p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <User className="w-4 h-4" /> Datos del Contrato & Arrendatario
            </span>
            <span className="text-[10px] text-slate-400 font-mono">USA Standard</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Nombre Completo del Cliente *</label>
              <input
                type="text"
                required
                placeholder="Ej. Carlos Mendoza"
                value={rentalForm.customerName}
                onChange={(e) => setRentalForm({ ...rentalForm, customerName: e.target.value })}
                className="w-full text-xs bg-[#141619] border border-white/5 rounded-lg px-2.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Teléfono / WhatsApp *</label>
              <input
                type="tel"
                required
                placeholder="+1 (786) 555-0192"
                value={rentalForm.customerPhone}
                onChange={(e) => setRentalForm({ ...rentalForm, customerPhone: e.target.value })}
                className="w-full text-xs bg-[#141619] border border-white/5 rounded-lg px-2.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Correo Electrónico</label>
              <input
                type="email"
                placeholder="cliente@email.com"
                value={rentalForm.customerEmail}
                onChange={(e) => setRentalForm({ ...rentalForm, customerEmail: e.target.value })}
                className="w-full text-xs bg-[#141619] border border-white/5 rounded-lg px-2.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Licencia de Conducir / ID (DL)</label>
              <input
                type="text"
                placeholder="DL Florida #M532-881-89"
                value={rentalForm.customerDoc}
                onChange={(e) => setRentalForm({ ...rentalForm, customerDoc: e.target.value })}
                className="w-full text-xs bg-[#141619] border border-white/5 rounded-lg px-2.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Frecuencia</label>
              <select
                value={rentalForm.billingCycle}
                onChange={(e) => setRentalForm({ ...rentalForm, billingCycle: e.target.value })}
                className="w-full text-xs bg-[#141619] border border-white/5 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="diario">Diario</option>
                <option value="semanal">Semanal</option>
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Tarifa ($ USD) *</label>
              <input
                type="number"
                required
                min="0"
                placeholder="350"
                value={rentalForm.rate}
                onChange={(e) => setRentalForm({ ...rentalForm, rate: e.target.value })}
                className="w-full text-xs bg-[#141619] border border-white/5 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Depósito Garantía ($)</label>
              <input
                type="number"
                min="0"
                placeholder="500"
                value={rentalForm.securityDeposit}
                onChange={(e) => setRentalForm({ ...rentalForm, securityDeposit: e.target.value })}
                className="w-full text-xs bg-[#141619] border border-white/5 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={rentalForm.startDate}
                onChange={(e) => setRentalForm({ ...rentalForm, startDate: e.target.value })}
                className="w-full text-xs bg-[#141619] border border-white/5 rounded-lg px-1.5 py-2 text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase mb-1">Notas del Contrato</label>
            <input
              type="text"
              placeholder="Ej. Uso comercial para Uber Black. Tanque lleno."
              value={rentalForm.notes}
              onChange={(e) => setRentalForm({ ...rentalForm, notes: e.target.value })}
              className="w-full text-xs bg-[#141619] border border-white/5 rounded-lg px-2.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsSettingUpRental(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-glow-purple transition-all cursor-pointer"
            >
              Guardar y Activar Renta
            </button>
          </div>
        </form>
      )}

      {/* Active Rental Overview Cards */}
      {rental && !isSettingUpRental && (
        <div className="space-y-4">
          
          {/* Main Info Box */}
          <div className="p-4 rounded-xl bg-[#1E2025] border border-purple-500/20 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block">
                  Arrendatario Activo
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">
                  {rental.customerName}
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {rental.customerDoc || 'Licencia no especificada'}
                </p>
              </div>

              {/* Direct WhatsApp / Call Action */}
              {rental.customerPhone && (
                <a
                  href={`https://wa.me/${rental.customerPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-semibold transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp / Llamar</span>
                </a>
              )}
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/[0.06]">
              <div className="p-2 rounded-lg bg-[#141619]">
                <span className="text-[10px] text-slate-400 uppercase block">Tarifa Pactada</span>
                <span className="text-sm font-bold font-mono text-white mt-0.5 block">
                  ${rental.rate} / {rental.billingCycle}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-[#141619]">
                <span className="text-[10px] text-slate-400 uppercase block">Tiempo Rentado</span>
                <span className="text-sm font-bold font-mono text-purple-300 mt-0.5 block">
                  {fin.rentalDays} días
                </span>
              </div>

              <div className="p-2 rounded-lg bg-[#141619]">
                <span className="text-[10px] text-slate-400 uppercase block">Depósito</span>
                <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5 block">
                  {formatCurrency(rental.securityDeposit || 0)}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-[#141619]">
                <span className="text-[10px] text-slate-400 uppercase block">Total Recibido</span>
                <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5 block">
                  {formatCurrency(rental.totalReceived || 0)}
                </span>
              </div>
            </div>

            {rental.notes && (
              <p className="text-[11px] text-slate-400 italic bg-[#141619] p-2 rounded-lg">
                "{rental.notes}"
              </p>
            )}
          </div>

          {/* Payments Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                Historial de Cobros Recibidos ({rental.payments?.length || 0})
              </span>

              <button
                type="button"
                onClick={() => setIsAddingPayment(!isAddingPayment)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-glow-emerald transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Registrar Cobro</span>
              </button>
            </div>

            {/* Quick Record Payment Form */}
            {isAddingPayment && (
              <form onSubmit={handleRecordPayment} className="rounded-xl bg-[#1E2025] border border-emerald-500/30 p-3.5 space-y-2.5">
                <span className="text-xs font-bold text-emerald-400 block">Nuevo Cobro / Abono de Renta</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Monto ($ USD) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      placeholder="350"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      className="w-full text-xs font-mono bg-[#141619] border border-white/5 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Método de Pago</label>
                    <select
                      value={paymentForm.method}
                      onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                      className="w-full text-xs bg-[#141619] border border-white/5 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Zelle">Zelle</option>
                      <option value="Efectivo (Cash)">Efectivo (Cash)</option>
                      <option value="Transferencia ACH">Transferencia ACH</option>
                      <option value="Tarjeta / Stripe">Tarjeta / Stripe</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Fecha</label>
                    <input
                      type="date"
                      value={paymentForm.date}
                      onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                      className="w-full text-xs font-mono bg-[#141619] border border-white/5 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Concepto / Comprobante</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Semana 5 de renta - Confirmación #ZEL-9921"
                    value={paymentForm.concept}
                    onChange={(e) => setPaymentForm({ ...paymentForm, concept: e.target.value })}
                    className="w-full text-xs bg-[#141619] border border-white/5 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingPayment(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow-emerald"
                  >
                    Guardar Cobro
                  </button>
                </div>
              </form>
            )}

            {/* Payments List */}
            <div className="divide-y divide-white/[0.04] rounded-xl border border-white/5 bg-[#1E2025]/50 overflow-hidden">
              {(!rental.payments || rental.payments.length === 0) ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Aún no hay cobros registrados para este contrato.
                </div>
              ) : (
                rental.payments.map((p) => (
                  <div key={p.id} className="p-3 hover:bg-white/[0.02] flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{p.concept}</span>
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          {p.method}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        Fecha: {p.date}
                      </span>
                    </div>

                    <span className="text-sm font-bold font-mono text-emerald-400">
                      +{formatCurrency(p.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* End Rental Contract CTA */}
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-xs text-slate-400">¿El cliente entregó el vehículo?</span>
            <button
              type="button"
              onClick={handleEndRental}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Finalizar Renta y Regresar a Inventario</span>
            </button>
          </div>

        </div>
      )}

      {!rental && !isSettingUpRental && (
        <div className="p-8 text-center rounded-xl bg-[#1E2025] border border-white/5 space-y-3">
          <Key className="w-10 h-10 text-purple-400 mx-auto" />
          <h4 className="text-sm font-bold text-white">Este vehículo no tiene contrato de renta activo</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Puedes rentar este auto a un cliente, registrar sus datos, tarifa por día/semana, depósito de garantía y llevar el control de cada cobro.
          </p>
          <button
            type="button"
            onClick={() => setIsSettingUpRental(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-purple transition-all cursor-pointer"
          >
            Iniciar Nuevo Contrato de Renta
          </button>
        </div>
      )}
    </div>
  );

  /* ========================================================================== */
  /* SUB-PANEL 3: Bitácora de Gastos y Reparaciones (ESPAÑOL)                   */
  /* ========================================================================== */
  const renderPanelGastos = () => (
    <div className="flex flex-col gap-4">
      {/* Header with totals */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-400" />
            Bitácora de Gastos y Taller
          </h3>
          <p className="text-xs text-slate-400">
            {vehicle.expenses?.length || 0} registros en español contabilizados
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

      {/* Inline Quick Form to Add Expense (CATEGORÍAS EN ESPAÑOL) */}
      <form
        onSubmit={handleCreateExpense}
        className="rounded-xl bg-[#1E2025] border border-white/5 p-3.5 flex flex-col gap-2.5"
      >
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-emerald-400" /> Registrar Nuevo Gasto
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-slate-400 uppercase mb-1">Categoría (En Español) *</label>
            <select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              className="w-full text-xs bg-[#141619] border border-white/5 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase mb-1">Monto ($ USD) *</label>
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
                className="w-full text-xs font-mono bg-[#141619] border border-white/5 rounded-lg pl-6 pr-2.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <label className="block text-[10px] text-slate-400 uppercase mb-1">Descripción del Gasto *</label>
            <input
              type="text"
              required
              placeholder="Ej. Bumper delantero OEM, pintura bicapa o alineación..."
              value={expenseDesc}
              onChange={(e) => setExpenseDesc(e.target.value)}
              className="w-full text-xs bg-[#141619] border border-white/5 rounded-lg px-2.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase mb-1">Fecha</label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full text-xs bg-[#141619] border border-white/5 rounded-lg px-2 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-1 py-2 px-3 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Agregar Gasto al Vehículo</span>
        </button>
      </form>

      {/* Sleek Search Bar for Expenses (by description, category or amount) */}
      <div className="space-y-1.5 pt-1">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={expenseSearch}
            onChange={(e) => setExpenseSearch(e.target.value)}
            placeholder="Buscar gasto por nombre, descripción o monto ($)..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-[#1E2025] border border-white/5 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all font-sans"
          />
          {expenseSearch && (
            <button
              type="button"
              onClick={() => setExpenseSearch('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
              title="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {expenseSearch && (
          <div className="flex items-center justify-between text-[11px] px-1 text-slate-400 font-mono">
            <span>{filteredExpenses.length} gasto{filteredExpenses.length === 1 ? '' : 's'} encontrado{filteredExpenses.length === 1 ? '' : 's'}</span>
            <span className="text-amber-400 font-bold">Subtotal: {formatCurrency(filteredExpensesTotal)}</span>
          </div>
        )}
      </div>

      {/* Expenses List */}
      <div className="space-y-2 mt-1">
        {filteredExpenses.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-[#1E2025]/40 p-6 text-center text-xs text-slate-500">
            {expenseSearch
              ? `No se encontraron gastos con la búsqueda "${expenseSearch}".`
              : 'No hay gastos registrados para este vehículo.'}
          </div>
        ) : (
          filteredExpenses.map((exp) => (
            <div
              key={exp.id}
              className="rounded-xl bg-[#1E2025] border border-white/5 p-3 flex items-center justify-between gap-3 group hover:border-white/10 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
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
                  type="button"
                  onClick={() => onDeleteExpense(vehicle.id, exp.id)}
                  className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
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
  );

  /* ========================================================================== */
  /* SUB-PANEL 4: Resumen Financiero Tipo Checkout                             */
  /* ========================================================================== */
  const renderPanelFinanzas = () => (
    <div className="flex flex-col justify-between gap-6">
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

          {isRented && (
            <div className="flex items-center justify-between text-xs text-purple-300">
              <span>Recaudado en Renta</span>
              <span className="font-mono font-bold text-purple-300">
                + {formatCurrency(fin.rentalIncome)}
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs">
            <span className="text-slate-200 font-semibold">Inversión Neta</span>
            <span className="font-mono font-bold text-white text-sm">
              {formatCurrency(fin.totalInvestment)}
            </span>
          </div>
        </div>

        {/* Editable Target/Sold Sale Price Input */}
        <div className="rounded-xl bg-[#1E2025] border border-white/5 p-4 space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            {vehicle.status === 'sold'
              ? 'Monto Real de Venta ($ USD)'
              : isRented
              ? 'Valor Estimado de Reventa ($ USD)'
              : 'Precio de Venta Objetivo ($ USD)'}
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
            {vehicle.status === 'sold'
              ? 'Ganancia Neta Realizada'
              : isRented
              ? 'Retorno Estimado Total'
              : 'Ganancia Neta Proyectada'}
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
      <div className="space-y-2 pt-2 border-t border-white/[0.06]">
        {vehicle.status === 'in_repair' && (
          <button
            type="button"
            onClick={() => handleStatusChange('for_sale')}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 shadow-glow-emerald active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Tag className="w-4 h-4" />
            <span>Publicar en Venta</span>
          </button>
        )}

        {vehicle.status === 'for_sale' && (
          <button
            type="button"
            onClick={() => handleStatusChange('sold')}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 shadow-glow-emerald active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Marcar como Vendido / Cerrar Venta</span>
          </button>
        )}

        {vehicle.status === 'rented' && (
          <button
            type="button"
            onClick={handleEndRental}
            className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-glow-purple active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Finalizar Renta y Regresar a Inventario</span>
          </button>
        )}

        {vehicle.status === 'sold' && (
          <button
            type="button"
            onClick={() => handleStatusChange('for_sale')}
            className="w-full py-3 px-4 rounded-xl bg-[#1E2025] border border-white/10 text-slate-200 font-semibold text-sm hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Reabrir a "En Venta"</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-8">
      {/* Modal Surface */}
      <div className="relative w-full max-w-7xl h-[92vh] sm:h-[88vh] lg:h-auto lg:max-h-[90vh] rounded-t-2xl sm:rounded-2xl border border-white/[0.08] bg-[#141619] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header (Always Fixed at Top) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/[0.06] bg-[#141619] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <span className={`text-[11px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border shrink-0 ${getStatusColor(vehicle.status)}`}>
              {vehicle.status === 'in_repair' && 'En Taller'}
              {vehicle.status === 'for_sale' && 'En Venta'}
              {vehicle.status === 'rented' && 'En Renta'}
              {vehicle.status === 'sold' && 'Vendido'}
            </span>
            <h2 className="text-sm sm:text-lg lg:text-xl font-bold text-white tracking-tight truncate">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all shrink-0 cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Segmented Tab Bar (Hidden on Desktop lg:hidden) */}
        <div className="flex lg:hidden items-center justify-around px-2 py-2 bg-[#121316] border-b border-white/[0.06] shrink-0 gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setMobileTab('ficha')}
            className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              mobileTab === 'ficha'
                ? 'bg-blue-600 text-white shadow-glow-electric'
                : 'text-slate-400 hover:text-white bg-[#1E2025]'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Ficha</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('renta')}
            className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              mobileTab === 'renta'
                ? 'bg-purple-600 text-white shadow-glow-purple font-bold'
                : 'text-slate-400 hover:text-white bg-[#1E2025]'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Renta {rental ? `(${formatCurrency(rental.totalReceived || 0)})` : ''}</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('gastos')}
            className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              mobileTab === 'gastos'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-white bg-[#1E2025]'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Gastos ({formatCurrency(fin.totalExpenses)})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('finanzas')}
            className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              mobileTab === 'finanzas'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-emerald font-bold'
                : 'text-slate-400 hover:text-white bg-[#1E2025]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Finanzas</span>
          </button>
        </div>

        {/* Mobile/Tablet Single Clean Scroll Content Container (lg:hidden) */}
        <div className="block lg:hidden flex-1 overflow-y-auto p-4 sm:p-6">
          {mobileTab === 'ficha' && renderPanelFicha()}
          {mobileTab === 'renta' && renderPanelRenta()}
          {mobileTab === 'gastos' && renderPanelGastos()}
          {mobileTab === 'finanzas' && renderPanelFinanzas()}
        </div>

        {/* Desktop 3-Panel Grid (Hidden on Mobile/Tablet, visible only on lg:grid) */}
        <div className="hidden lg:grid grid-cols-12 divide-x divide-white/[0.06] flex-1 overflow-hidden">
          
          {/* Panel Izquierdo (4 cols): Ficha técnica y fotos */}
          <div className="col-span-4 p-6 overflow-y-auto max-h-[calc(90vh-70px)]">
            {renderPanelFicha()}
          </div>

          {/* Panel Central (5 cols): Selector Gastos vs Renta */}
          <div className="col-span-5 p-6 overflow-y-auto max-h-[calc(90vh-70px)] space-y-4">
            {/* Center Tab Toggle (Gastos de Taller vs Gestión de Renta) */}
            <div className="flex items-center gap-2 p-1 rounded-xl bg-[#1E2025] border border-white/5">
              <button
                type="button"
                onClick={() => setCenterTab('gastos')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  centerTab === 'gastos'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Bitácora de Taller & Gastos ({formatCurrency(fin.totalExpenses)})</span>
              </button>

              <button
                type="button"
                onClick={() => setCenterTab('renta')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  centerTab === 'renta'
                    ? 'bg-purple-600 text-white shadow-glow-purple font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Gestión de Renta {rental ? `(${formatCurrency(rental.totalReceived || 0)})` : ''}</span>
              </button>
            </div>

            {centerTab === 'gastos' ? renderPanelGastos() : renderPanelRenta()}
          </div>

          {/* Panel Derecho (3 cols): Finanzas tipo checkout */}
          <div className="col-span-3 p-6 overflow-y-auto max-h-[calc(90vh-70px)] bg-[#141619]">
            {renderPanelFinanzas()}
          </div>

        </div>

      </div>

      {/* Edit Vehicle Characteristics Modal */}
      {isEditModalOpen && (
        <EditVehicleModal
          isOpen={isEditModalOpen}
          vehicle={vehicle}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateVehicle={(updated) => {
            if (onUpdateVehicle) onUpdateVehicle(updated);
            setIsEditModalOpen(false);
          }}
          onDeleteVehicle={(id) => {
            if (onDeleteVehicle) onDeleteVehicle(id);
            setIsEditModalOpen(false);
            onClose();
          }}
        />
      )}
    </div>
  );
};
