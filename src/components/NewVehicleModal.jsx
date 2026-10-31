import React, { useState } from 'react';
import { X, Car, Plus, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { TITLE_STATUSES } from '../mockData';

const SAMPLE_PHOTO_PRESETS = [
  {
    name: 'Mustang / Muscle',
    url: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Sedan / Camry',
    url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Sport / Civic',
    url: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Truck / Silverado',
    url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'SUV / Grand Cherokee',
    url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80'
  }
];

export const NewVehicleModal = ({ isOpen, onClose, onAddVehicle }) => {
  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    vin: '',
    make: '',
    model: '',
    year: currentYear,
    color: '',
    mileage: '',
    titleStatus: 'Clean',
    status: 'in_repair',
    purchasePrice: '',
    estimatedSalePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    photoUrl: SAMPLE_PHOTO_PRESETS[0].url
  });

  const [error, setError] = useState('');

  const handleVinChange = (e) => {
    // Keep alphanumeric and uppercase, max 17
    const cleaned = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 17);
    setFormData((prev) => ({ ...prev, vin: cleaned }));
    if (error && cleaned.length === 17) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.vin.length !== 17) {
      setError('El VIN debe contener exactamente 17 caracteres alfanuméricos.');
      return;
    }

    const purchaseNum = parseFloat(formData.purchasePrice);
    const estimatedNum = parseFloat(formData.estimatedSalePrice);
    const mileageNum = parseInt(formData.mileage, 10);

    if (isNaN(purchaseNum) || purchaseNum < 0) {
      setError('Por favor ingresa un costo de compra válido.');
      return;
    }

    if (isNaN(estimatedNum) || estimatedNum < 0) {
      setError('Por favor ingresa un precio estimado de venta válido.');
      return;
    }

    const newVehicle = {
      id: `veh-${Date.now().toString().slice(-4)}`,
      vin: formData.vin,
      year: parseInt(formData.year, 10) || currentYear,
      make: formData.make.trim(),
      model: formData.model.trim(),
      color: formData.color.trim() || 'Desconocido',
      mileage: isNaN(mileageNum) ? 0 : mileageNum,
      titleStatus: formData.titleStatus,
      status: formData.status,
      purchasePrice: purchaseNum,
      estimatedSalePrice: estimatedNum,
      soldPrice: null,
      purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
      photos: [formData.photoUrl || SAMPLE_PHOTO_PRESETS[0].url],
      expenses: []
    };

    onAddVehicle(newVehicle);
    onClose();
  };

  const isVinComplete = formData.vin.length === 17;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      {/* Strict Anti-IA Rule: Clean unified dark surface without colored border-t-4 */}
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#141619] shadow-2xl overflow-hidden p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Registrar Nuevo Vehículo
              </h2>
              <p className="text-xs text-slate-400">
                Adquisición, subasta Copart/IAAI o compra privada (USA)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* VIN Field with strict 17 chars validation */}
          <div className="rounded-xl bg-[#1E2025] border border-white/5 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                Número de Identificación Vehicular (VIN) *
              </label>
              <span className={`text-xs font-mono font-bold ${
                isVinComplete ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {formData.vin.length} / 17
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={17}
                value={formData.vin}
                onChange={handleVinChange}
                placeholder="Ej. 1FA6P8CF0H5100001"
                className="w-full text-sm font-mono tracking-widest bg-[#141619] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 uppercase focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {isVinComplete && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3 top-2.5" />
              )}
            </div>
            <span className="text-[10px] text-slate-400">
              Estándar NHTSA USA (17 caracteres alfanuméricos sin I, O ni Q).
            </span>
          </div>

          {/* Make, Model, Year, Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Marca *</label>
              <input
                type="text"
                required
                placeholder="Ej. Ford, Toyota, Honda..."
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                className="w-full text-xs bg-[#1E2025] border border-white/5 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Modelo *</label>
              <input
                type="text"
                required
                placeholder="Ej. Mustang GT, Camry SE..."
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full text-xs bg-[#1E2025] border border-white/5 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Año</label>
              <input
                type="number"
                min="1980"
                max={currentYear + 2}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full text-xs font-mono bg-[#1E2025] border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Color Exterior</label>
              <input
                type="text"
                placeholder="Ej. Oxford White"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full text-xs bg-[#1E2025] border border-white/5 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Millas (mi)</label>
              <input
                type="number"
                min="0"
                placeholder="45000"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                className="w-full text-xs font-mono bg-[#1E2025] border border-white/5 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Estatus Título</label>
              <select
                value={formData.titleStatus}
                onChange={(e) => setFormData({ ...formData, titleStatus: e.target.value })}
                className="w-full text-xs bg-[#1E2025] border border-white/5 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {TITLE_STATUSES.map((title) => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Acquisition Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Costo Compra ($ USD) *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500 font-mono text-xs">
                  $
                </span>
                <input
                  type="number"
                  step="100"
                  min="0"
                  required
                  placeholder="15000"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  className="w-full text-xs font-mono bg-[#1E2025] border border-white/5 rounded-lg pl-6 pr-2.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">P. Venta Estimado ($) *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500 font-mono text-xs">
                  $
                </span>
                <input
                  type="number"
                  step="100"
                  min="0"
                  required
                  placeholder="22000"
                  value={formData.estimatedSalePrice}
                  onChange={(e) => setFormData({ ...formData, estimatedSalePrice: e.target.value })}
                  className="w-full text-xs font-mono bg-[#1E2025] border border-white/5 rounded-lg pl-6 pr-2.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fecha Adquisición</label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full text-xs font-mono bg-[#1E2025] border border-white/5 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Photo URL & Quick Presets */}
          <div className="rounded-xl bg-[#1E2025] border border-white/5 p-3 space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-400" /> Foto Principal (URL o Preajuste)
            </label>
            <input
              type="url"
              value={formData.photoUrl}
              onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
              placeholder="https://..."
              className="w-full text-xs bg-[#141619] border border-white/5 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            
            {/* Quick preset chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-400">Preajustes rápidos:</span>
              {SAMPLE_PHOTO_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setFormData({ ...formData, photoUrl: p.url })}
                  className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                    formData.photoUrl === p.url
                      ? 'bg-blue-600/30 text-blue-300 border-blue-500/40'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 shadow-glow-emerald active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Registrar Vehículo en Inventario</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
