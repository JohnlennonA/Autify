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
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import {
  formatCurrency,
  formatMileage,
  calculateVehicleFinancials,
  normalizeExpenseCategory
} from '../utils/formatters';
import { EXPENSE_CATEGORIES, TITLE_STATUSES } from '../mockData';
import { EditVehicleModal } from './EditVehicleModal';
import {
  validateStatusTransition,
  canRentVehicle,
  canDeleteVehicle,
  canAddExpense,
  validateReturnInspection,
  validateRentalContract,
  validateRentalPayment
} from '../utils/businessLogic';

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
  onDeleteVehicle,
  onReopenSale
}) => {
  if (!vehicle) return null;

  // View state: 'ficha' | 'renta' | 'gastos' | 'finanzas'
  const [mobileTab, setMobileTab] = useState(vehicle.status === 'rented' ? 'renta' : 'ficha');
  // Desktop center tabs: 'gastos' | 'renta'
  const [centerTab, setCenterTab] = useState(vehicle.status === 'rented' ? 'renta' : 'gastos');
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Business Alert Dialog state
  const [businessAlert, setBusinessAlert] = useState(null);

  // Return & Inspection Modal state
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [reopenConfirmOpen, setReopenConfirmOpen] = useState(false);
  const [returnForm, setReturnForm] = useState({
    returnMileage: vehicle.mileage || 0,
    returnStatus: 'for_sale',
    depositReturned: true,
    notes: ''
  });
  const [returnError, setReturnError] = useState('');

  const handleConfirmDelete = () => {
    const deleteCheck = canDeleteVehicle(vehicle);
    if (!deleteCheck.allowed) {
      setBusinessAlert({
        title: 'Operación no permitida',
        message: deleteCheck.reason
      });
      return;
    }

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
  const [expenseReceiptUrl, setExpenseReceiptUrl] = useState('');
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const receiptFileInputRef = useRef(null);

  const handleReceiptFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setExpenseReceiptUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

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
    const expenseCheck = canAddExpense(vehicle);
    if (!expenseCheck.allowed) {
      setBusinessAlert({
        title: 'Operación no permitida',
        message: expenseCheck.reason
      });
      return;
    }

    const amountNum = parseFloat(expenseAmount);
    if (!expenseDesc.trim() || isNaN(amountNum) || amountNum <= 0) return;

    onAddExpense(vehicle.id, {
      id: `exp-${Date.now()}`,
      category: expenseCategory,
      description: expenseDesc.trim(),
      amount: amountNum,
      date: expenseDate || new Date().toISOString().split('T')[0],
      receiptUrl: expenseReceiptUrl.trim() || null
    });

    setExpenseDesc('');
    setExpenseAmount('');
    setExpenseReceiptUrl('');
    if (receiptFileInputRef.current) receiptFileInputRef.current.value = '';
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
      case 'available':
        return 'text-teal-300 bg-teal-500/10 border-teal-500/25';
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

  // Handle switching status with business logic enforcement
  const handleStatusChange = (newStatus) => {
    const validation = validateStatusTransition(vehicle, newStatus);
    if (!validation.allowed) {
      setBusinessAlert({
        title: 'Transición Bloqueada por Regla de Negocio',
        message: validation.reason,
        code: validation.code
      });
      return;
    }

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
    const rentCheck = canRentVehicle(vehicle);
    if (!rentCheck.allowed) {
      setBusinessAlert({
        title: 'Operación no permitida',
        message: rentCheck.reason
      });
      return;
    }

    const contractCheck = validateRentalContract(rentalForm);
    if (!contractCheck.valid) {
      setBusinessAlert({
        title: 'Datos del contrato incompletos',
        message: contractCheck.error
      });
      return;
    }

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
    const paymentCheck = validateRentalPayment(paymentForm);
    if (!paymentCheck.valid) {
      setBusinessAlert({
        title: 'Monto de cobro inválido',
        message: paymentCheck.error
      });
      return;
    }

    const amountNum = parseFloat(paymentForm.amount);
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

  const handleOpenReturnModal = () => {
    setReturnForm({
      returnMileage: vehicle.mileage || 0,
      returnStatus: 'for_sale',
      depositReturned: true,
      notes: ''
    });
    setReturnError('');
    setIsReturnModalOpen(true);
  };

  const handleConfirmReturnInspection = (e) => {
    e.preventDefault();
    const inspectionCheck = validateReturnInspection(vehicle, returnForm);
    if (!inspectionCheck.valid) {
      setReturnError(inspectionCheck.error);
      return;
    }

    if (onTerminateRental) {
      onTerminateRental(vehicle.id, {
        returnStatus: returnForm.returnStatus,
        returnMileage: parseInt(returnForm.returnMileage, 10),
        depositReturned: returnForm.depositReturned,
        notes: returnForm.notes.trim()
      });
    } else {
      onUpdateVehicleStatus(vehicle.id, returnForm.returnStatus);
    }

    setIsReturnModalOpen(false);
    setCenterTab('gastos');
    setMobileTab('ficha');
  };

  const handleConfirmReopenSale = () => {
    if (onReopenSale) {
      onReopenSale(vehicle.id);
      setReopenConfirmOpen(false);
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

      {/* Sold Liquidated Card if status === 'sold' */}
      {vehicle.status === 'sold' && (
        <div className="rounded-xl bg-blue-950/20 border border-blue-500/30 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              Vehículo Liquidado / Cerrado
            </span>
            {onReopenSale && (
              <button
                type="button"
                onClick={() => setReopenConfirmOpen(true)}
                className="text-[11px] font-bold text-blue-400 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
              >
                Reversar Venta
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="p-2 rounded-lg bg-[#141619]/80 border border-white/5">
              <span className="text-[9px] text-slate-400 uppercase block">Precio Venta</span>
              <span className="text-xs font-bold font-mono text-white mt-0.5 block">
                {formatCurrency(vehicle.soldPrice || vehicle.estimatedSalePrice)}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[#141619]/80 border border-white/5">
              <span className="text-[9px] text-slate-400 uppercase block">Ganancia Neta</span>
              <span className={`text-xs font-bold font-mono mt-0.5 block ${fin.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {fin.netProfit >= 0 ? '+' : ''}{formatCurrency(fin.netProfit)}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-[#141619]/80 border border-white/5">
              <span className="text-[9px] text-slate-400 uppercase block">ROI Final</span>
              <span className={`text-xs font-bold font-mono mt-0.5 block ${fin.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {fin.netProfit >= 0 ? '+' : ''}{fin.roi.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Status Switcher Segmented Control with Business Rules */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Estado Operativo del Auto
          </label>
          <span className="text-[10px] text-slate-500 font-mono">
            {vehicle.status === 'rented' ? 'Contrato Activo' : vehicle.status === 'sold' ? 'Operación Cerrada' : 'Inventario Activo'}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-[#1E2025] border border-white/5">
          {[
            { key: 'available', label: 'Disponible', activeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-glow-teal' },
            { key: 'for_sale', label: 'En Venta', activeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-glow-emerald' },
            { key: 'rented', label: 'En Renta', activeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-glow-purple' },
            { key: 'in_repair', label: 'En Taller', activeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-glow-amber' },
            { key: 'sold', label: 'Vendido', activeColor: 'bg-blue-600/20 text-blue-300 border-blue-500/40 shadow-glow-electric' }
          ].map((st) => {
            const isActive = vehicle.status === st.key;
            const validation = validateStatusTransition(vehicle, st.key);
            const isBlocked = !isActive && !validation.allowed;

            return (
              <button
                key={st.key}
                type="button"
                onClick={() => handleStatusChange(st.key)}
                className={`py-2 px-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-all text-center cursor-pointer relative ${
                  isActive
                    ? st.activeColor
                    : isBlocked
                    ? 'text-slate-600 bg-black/30 opacity-45 hover:opacity-75'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
                title={isBlocked ? validation.reason : `Cambiar a ${st.label}`}
              >
                <span>{st.label}</span>
                {isBlocked && (
                  <span className="block text-[8px] font-mono text-rose-400 font-medium leading-none mt-0.5">
                    Bloqueado
                  </span>
                )}
              </button>
            );
          })}
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

        {vehicle.status === 'for_sale' || vehicle.status === 'rented' ? (
          <button
            type="button"
            onClick={() => setIsSettingUpRental(!isSettingUpRental)}
            className="text-xs px-2.5 py-1 rounded-lg bg-[#1E2025] hover:bg-white/5 border border-white/5 text-slate-300 transition-all cursor-pointer"
          >
            {isSettingUpRental ? 'Cancelar Edición' : rental ? 'Editar Contrato' : 'Configurar Renta'}
          </button>
        ) : (
          <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-white/5 text-slate-500 border border-white/5">
            {vehicle.status === 'sold' ? 'Renta Bloqueada (Vendido)' : 'Renta Inactiva (Taller)'}
          </span>
        )}
      </div>

      {/* Locked / Operational Banners if status is sold or in_repair */}
      {vehicle.status === 'sold' && (
        <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-5 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Contratos de Renta Inhabilitados
            </h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Este vehículo ya fue <strong className="text-blue-300">VENDIDO y liquidado comercialmente</strong>. Por reglas operativas y fiscales, una unidad transferida no puede asignarse en renta a ningún arrendatario.
            </p>
          </div>
        </div>
      )}

      {vehicle.status === 'in_repair' && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-300">Unidad en Taller / Reparaciones Pendientes</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Para entregar este vehículo a un arrendatario, primero debe marcarlo como "En Venta / Listo".
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleStatusChange('for_sale')}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm active:scale-95"
          >
            Marcar Listo para Renta
          </button>
        </div>
      )}

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
              onClick={handleOpenReturnModal}
              className="px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-white border border-purple-500/25 hover:border-purple-500/40 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
              <span>Finalizar Renta e Inspección</span>
            </button>
          </div>

        </div>
      )}

      {!rental && !isSettingUpRental && (
        <div className="p-8 text-center rounded-xl bg-[#1E2025] border border-white/5 space-y-3">
          <Key className="w-10 h-10 text-purple-400 mx-auto" />
          <h4 className="text-sm font-bold text-white">
            {vehicle.status === 'sold'
              ? 'Vehículo Vendido - Renta Inhabilitada'
              : vehicle.status === 'in_repair'
              ? 'Vehículo en Taller de Reparación'
              : 'Este vehículo no tiene contrato de renta activo'}
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {vehicle.status === 'sold'
              ? 'Este auto ya fue transferido y liquidado comercialmente. No puede rentarse a ningún cliente.'
              : vehicle.status === 'in_repair'
              ? 'La unidad está en proceso mecánico. Complete las reparaciones y márquela como lista antes de entregarla.'
              : 'Puedes rentar este auto a un cliente, registrar sus datos, tarifa por día/semana, depósito de garantía y llevar el control de cada cobro.'}
          </p>
          {vehicle.status === 'for_sale' && (
            <button
              type="button"
              onClick={() => setIsSettingUpRental(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow-purple transition-all cursor-pointer"
            >
              Iniciar Nuevo Contrato de Renta
            </button>
          )}
          {vehicle.status === 'in_repair' && (
            <button
              type="button"
              onClick={() => handleStatusChange('for_sale')}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 font-bold text-xs transition-all cursor-pointer"
            >
              Marcar Reparaciones Listas
            </button>
          )}
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
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Bitácora de Costos e Inversión
          </h3>
          <p className="text-xs text-slate-400">
            {vehicle.expenses?.length || 0} registros contables (DMV, taller, transporte...)
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
            Total Invertido
          </span>
          <span className="font-mono text-base font-bold text-amber-400">
            {formatCurrency(fin.totalExpenses)}
          </span>
        </div>
      </div>

      {/* Inline Quick Form to Add Expense (CATEGORÍAS EN ESPAÑOL) */}
      {vehicle.status === 'sold' && (
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 shrink-0 text-blue-400" />
          <span>Vehículo liquidado y cerrado contablemente. Para imputar nuevos gastos o garantías, reverse la venta primero.</span>
        </div>
      )}

      <form
        onSubmit={handleCreateExpense}
        className={`rounded-xl bg-[#1E2025] border border-white/5 p-3.5 flex flex-col gap-2.5 ${
          vehicle.status === 'sold' ? 'opacity-60' : ''
        }`}
      >
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-emerald-400" /> Registrar Nuevo Gasto / Inversión
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-slate-400 uppercase mb-1">Categoría *</label>
            <select
              disabled={vehicle.status === 'sold'}
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              className="w-full text-xs bg-[#141619] border border-white/5 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-amber-500 disabled:cursor-not-allowed"
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
                disabled={vehicle.status === 'sold'}
                type="number"
                step="any"
                min="0"
                required
                placeholder="0.00"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="w-full text-xs font-mono bg-[#141619] border border-white/5 rounded-lg pl-6 pr-2.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <label className="block text-[10px] text-slate-400 uppercase mb-1">Descripción del Gasto *</label>
            <input
              disabled={vehicle.status === 'sold'}
              type="text"
              required
              placeholder="Ej. Título limpio DMV, grúa subasta, parachoques..."
              value={expenseDesc}
              onChange={(e) => setExpenseDesc(e.target.value)}
              className="w-full text-xs bg-[#141619] border border-white/5 rounded-lg px-2.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase mb-1">Fecha</label>
            <input
              disabled={vehicle.status === 'sold'}
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full text-xs bg-[#141619] border border-white/5 rounded-lg px-2 py-2 text-slate-100 focus:outline-none focus:border-amber-500 font-mono disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Receipt / Invoice attachment input */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1.5 border-t border-white/5">
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="file"
              ref={receiptFileInputRef}
              onChange={handleReceiptFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              disabled={vehicle.status === 'sold'}
              onClick={() => receiptFileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg bg-[#141619] hover:bg-[#20232A] text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1.5 border border-white/10 transition-all cursor-pointer disabled:opacity-40"
            >
              <Paperclip className="w-3.5 h-3.5 text-blue-400" />
              <span>{expenseReceiptUrl ? 'Cambiar Factura / Recibo' : 'Adjuntar Recibo / Factura'}</span>
            </button>

            {expenseReceiptUrl && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px]">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Comprobante listo</span>
                <button
                  type="button"
                  onClick={() => {
                    setExpenseReceiptUrl('');
                    if (receiptFileInputRef.current) receiptFileInputRef.current.value = '';
                  }}
                  className="ml-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <span className="text-[10px] text-slate-500">
            Foto o escaneo de factura
          </span>
        </div>

        <button
          type="submit"
          disabled={vehicle.status === 'sold'}
          className="w-full mt-1 py-2 px-3 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {exp.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {exp.date}
                  </span>
                  {exp.receiptUrl && (
                    <button
                      type="button"
                      onClick={() => setViewingReceipt({
                        url: exp.receiptUrl,
                        description: exp.description,
                        amount: exp.amount,
                        date: exp.date,
                        category: exp.category
                      })}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-blue-500/25 transition-all flex items-center gap-1 cursor-pointer"
                      title="Ver factura o comprobante"
                    >
                      <Paperclip className="w-2.5 h-2.5" />
                      <span>Ver Recibo</span>
                    </button>
                  )}
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
        {vehicle.status === 'available' && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleStatusChange('for_sale')}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 shadow-glow-emerald active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Tag className="w-4 h-4" />
              <span>Publicar en Venta</span>
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('rented')}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-glow-purple active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Key className="w-4 h-4" />
              <span>Iniciar Contrato de Renta</span>
            </button>
          </div>
        )}

        {vehicle.status === 'in_repair' && (
          <button
            type="button"
            onClick={() => handleStatusChange('available')}
            className="w-full py-3 px-4 rounded-xl bg-teal-500 text-slate-950 font-bold text-sm hover:bg-teal-400 shadow-glow-teal active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Completar Reparación (A Patio Disponible)</span>
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
            onClick={handleOpenReturnModal}
            className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-glow-purple active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Finalizar Renta e Inspección</span>
          </button>
        )}

        {vehicle.status === 'sold' && (
          <button
            type="button"
            onClick={() => setReopenConfirmOpen(true)}
            className="w-full py-3 px-4 rounded-xl bg-[#1E2025] border border-blue-500/30 text-blue-300 font-semibold text-sm hover:bg-blue-500/10 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reversar Venta y Reactivar</span>
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
        <div className="lg:hidden flex-1 overflow-y-auto p-4 sm:p-6">
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
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Bitácora de Costos e Inversión ({formatCurrency(fin.totalExpenses)})</span>
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

      {/* Business Logic Warning Modal */}
      {businessAlert && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#141619] border border-amber-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{businessAlert.title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {businessAlert.message}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setBusinessAlert(null)}
                className="px-5 py-2.5 rounded-xl bg-[#1E2025] hover:bg-[#2A2E35] text-white text-sm font-semibold transition-all cursor-pointer border border-white/10"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reopen / Reverse Sale Confirmation Modal */}
      {reopenConfirmOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#141619] border border-blue-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">¿Reversar Venta y Reactivar Vehículo?</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Esta acción cancelará la liquidación del vehículo <span className="font-semibold text-white">{vehicle.year} {vehicle.make} {vehicle.model}</span> y lo devolverá al inventario disponible (<span className="text-emerald-400 font-semibold">En Venta</span>).
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setReopenConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1E2025] hover:bg-[#2A2E35] text-slate-300 text-sm font-medium transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReopenSale}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                Sí, Reversar y Reactivar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return & Inspection Modal */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#141619] border border-purple-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Devolución e Inspección Vehicular</h3>
                  <p className="text-xs text-slate-400">Cierre formal de contrato de renta</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReturnInspection} className="space-y-4">
              {returnError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{returnError}</span>
                </div>
              )}

              {/* Start vs Return Mileage */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#1E2025] border border-white/5">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Km Inicial Renta</span>
                  <span className="text-sm font-bold text-white">
                    {(vehicle.rental?.odometerStart || vehicle.mileage || 0).toLocaleString()} km
                  </span>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Km de Devolución *
                  </label>
                  <input
                    type="number"
                    required
                    min={vehicle.rental?.odometerStart || vehicle.mileage || 0}
                    value={returnForm.returnMileage}
                    onChange={(e) => setReturnForm({ ...returnForm, returnMileage: e.target.value })}
                    className="w-full bg-[#141619] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Destination Status Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Estado de Destino del Vehículo *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReturnForm({ ...returnForm, returnStatus: 'for_sale' })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      returnForm.returnStatus === 'for_sale'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-[#1E2025] border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      En Venta (Óptimo)
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      El vehículo superó la inspección y queda listo para exhibición o re-arrendamiento.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReturnForm({ ...returnForm, returnStatus: 'in_repair' })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      returnForm.returnStatus === 'in_repair'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                        : 'bg-[#1E2025] border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      A Taller (Reparación)
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Presenta daños o requiere mantenimiento preventivo antes de operar.
                    </p>
                  </button>
                </div>
              </div>

              {/* Security deposit status */}
              {vehicle.rental?.securityDeposit > 0 && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1E2025] border border-white/5">
                  <input
                    type="checkbox"
                    id="depositReturned"
                    checked={returnForm.depositReturned}
                    onChange={(e) => setReturnForm({ ...returnForm, depositReturned: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-[#141619] border-white/20 cursor-pointer"
                  />
                  <label htmlFor="depositReturned" className="text-xs text-slate-300 cursor-pointer">
                    Depósito de garantía devuelto al cliente ({formatCurrency(vehicle.rental.securityDeposit)})
                  </label>
                </div>
              )}

              {/* Inspection Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Notas de Inspección y Entrega (Opcional)
                </label>
                <textarea
                  rows="2"
                  value={returnForm.notes}
                  onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
                  placeholder="Ej: Carrocería limpia, llantas con 80% de vida, sin rayones..."
                  className="w-full bg-[#1E2025] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                ></textarea>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1E2025] hover:bg-[#2A2E35] text-slate-300 text-xs font-medium transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                >
                  Confirmar Recepción e Inspección
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Preview Lightbox Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="bg-[#141619] border border-white/10 rounded-2xl max-w-2xl w-full p-5 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-blue-400" />
                  Comprobante: {viewingReceipt.description}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  {viewingReceipt.category} • {formatCurrency(viewingReceipt.amount)} • {viewingReceipt.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto rounded-xl bg-black/40 border border-white/5 p-2 flex items-center justify-center min-h-[300px]">
              <img
                src={viewingReceipt.url}
                alt="Comprobante de gasto"
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10">
              <a
                href={viewingReceipt.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir imagen en pestaña nueva</span>
              </a>

              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="px-4 py-2 rounded-xl bg-[#1E2025] hover:bg-[#2A2E35] text-white text-xs font-semibold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

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
