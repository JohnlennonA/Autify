import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Car,
  CheckCircle2,
  AlertCircle,
  Camera,
  Paperclip,
  Trash2,
  Image as ImageIcon,
  Save,
  ShieldAlert
} from 'lucide-react';
import { TITLE_STATUSES } from '../mockData';
import { validateStatusTransition, canDeleteVehicle } from '../utils/businessLogic';

export const EditVehicleModal = ({
  isOpen,
  vehicle,
  onClose,
  onUpdateVehicle,
  onDeleteVehicle
}) => {
  if (!isOpen || !vehicle) return null;

  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    vin: vehicle.vin || '',
    make: vehicle.make || '',
    model: vehicle.model || '',
    year: vehicle.year || currentYear,
    color: vehicle.color || '',
    mileage: vehicle.mileage !== undefined ? vehicle.mileage : '',
    titleStatus: vehicle.titleStatus || 'Clean',
    status: vehicle.status || 'in_repair',
    purchasePrice: vehicle.purchasePrice !== undefined ? vehicle.purchasePrice : '',
    estimatedSalePrice: vehicle.estimatedSalePrice !== undefined ? vehicle.estimatedSalePrice : '',
    purchaseDate: vehicle.purchaseDate || new Date().toISOString().split('T')[0]
  });

  // Photos: Array of preview URLs or objects { preview: string, file?: File }
  const [photos, setPhotos] = useState(
    (vehicle.photos || []).map((url) => ({ preview: url }))
  );
  const [error, setError] = useState('');

  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync state whenever vehicle prop changes
  useEffect(() => {
    if (vehicle) {
      setFormData({
        vin: vehicle.vin || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || currentYear,
        color: vehicle.color || '',
        mileage: vehicle.mileage !== undefined ? vehicle.mileage : '',
        titleStatus: vehicle.titleStatus || 'Clean',
        status: vehicle.status || 'in_repair',
        purchasePrice: vehicle.purchasePrice !== undefined ? vehicle.purchasePrice : '',
        estimatedSalePrice: vehicle.estimatedSalePrice !== undefined ? vehicle.estimatedSalePrice : '',
        purchaseDate: vehicle.purchaseDate || new Date().toISOString().split('T')[0]
      });
      setPhotos((vehicle.photos || []).map((url) => ({ preview: url })));
      setError('');
    }
  }, [vehicle]);

  const handleVinChange = (e) => {
    const cleaned = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 17);
    setFormData((prev) => ({ ...prev, vin: cleaned }));
    if (error && cleaned.length === 17) setError('');
  };

  const handlePhotoFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const newPhotos = Array.from(fileList).map((file) => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (index) => {
    setPhotos((prev) => {
      const removed = prev[index];
      if (removed?.file && removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.vin.length !== 17) {
      setError('El VIN debe contener exactamente 17 caracteres alfanuméricos.');
      return;
    }

    // Business Logic: Validar transición de estado si cambió
    if (formData.status !== vehicle.status) {
      const transitionCheck = validateStatusTransition(vehicle, formData.status);
      if (!transitionCheck.allowed) {
        setError(`🚫 Regla de Negocio: ${transitionCheck.reason}`);
        return;
      }
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

    const photoUrls = photos.length > 0
      ? photos.map((p) => p.preview)
      : vehicle.photos || ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'];

    const updatedVehicle = {
      ...vehicle,
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
      purchaseDate: formData.purchaseDate || vehicle.purchaseDate,
      photos: photoUrls
    };

    onUpdateVehicle(updatedVehicle);
    onClose();
  };

  const handleDelete = () => {
    const deleteCheck = canDeleteVehicle(vehicle);
    if (!deleteCheck.allowed) {
      setError(deleteCheck.reason);
      return;
    }

    const confirmMsg = `¿Estás seguro de que deseas eliminar permanentemente el vehículo:\n\n${vehicle.year} ${vehicle.make} ${vehicle.model} (VIN: ${vehicle.vin})?\n\nEsta acción no se puede deshacer.`;
    if (window.confirm(confirmMsg)) {
      onDeleteVehicle(vehicle.id);
      onClose();
    }
  };

  const isVinComplete = formData.vin.length === 17;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#141619] shadow-2xl overflow-hidden p-6 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Editar Características del Vehículo
              </h2>
              <p className="text-xs text-slate-400">
                Modificar datos técnicos, costo, fotos o estado de la unidad
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
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
          
          {/* VIN Field with 17 chars validation */}
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

          {/* Make, Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Marca *</label>
              <input
                type="text"
                required
                placeholder="Ej. Ford, Toyota, Chevrolet..."
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

          {/* Year, Color, Mileage, Title, Status */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
                placeholder="Oxford White"
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
                className="w-full text-xs bg-[#1E2025] border border-white/5 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {TITLE_STATUSES.map((title) => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fase / Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full text-xs bg-[#1E2025] border border-white/5 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {[
                  { value: 'available', label: 'Disponible (Stock en Patio)' },
                  { value: 'for_sale', label: 'En Venta / Publicado' },
                  { value: 'rented', label: 'En Renta Activa' },
                  { value: 'in_repair', label: 'Taller / Reparación' },
                  { value: 'sold', label: 'Vendido / Liquidado' }
                ].map((st) => {
                  const check = validateStatusTransition(vehicle, st.value);
                  const isCurrent = vehicle.status === st.value;
                  const isDisabled = !isCurrent && !check.allowed;
                  return (
                    <option key={st.value} value={st.value} disabled={isDisabled}>
                      {st.label} {isDisabled ? '(Bloqueado por regla)' : ''}
                    </option>
                  );
                })}
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

          {/* Photos Section */}
          <div className="rounded-xl bg-[#1E2025] border border-white/5 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" /> Galería de Fotos ({photos.length})
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                La primera foto es la imagen principal
              </span>
            </div>

            {/* Action Buttons: Camera + Attach */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="group flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border-2 border-dashed border-white/10 hover:border-emerald-500/40 bg-[#141619] hover:bg-emerald-500/5 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center transition-all">
                  <Camera className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-xs font-semibold text-slate-300 group-hover:text-emerald-300 transition-colors">
                  Tomar Foto
                </span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border-2 border-dashed border-white/10 hover:border-blue-500/40 bg-[#141619] hover:bg-blue-500/5 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 border border-blue-500/20 flex items-center justify-center transition-all">
                  <Paperclip className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-xs font-semibold text-slate-300 group-hover:text-blue-300 transition-colors">
                  Adjuntar Fotos
                </span>
              </button>
            </div>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                handlePhotoFiles(e.target.files);
                e.target.value = '';
              }}
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handlePhotoFiles(e.target.files);
                e.target.value = '';
              }}
            />

            {/* Photo Thumbnails Preview */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                {photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="relative group/thumb aspect-[4/3] rounded-lg overflow-hidden border border-white/10 bg-[#141619]"
                  >
                    <img
                      src={photo.preview}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 p-1 rounded-md bg-black/75 text-rose-400 hover:text-rose-300 hover:bg-black/90 opacity-0 group-hover/thumb:opacity-100 transition-all cursor-pointer"
                      title="Eliminar foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1 left-1 text-[9px] font-mono font-bold bg-black/70 text-white/80 px-1.5 py-0.5 rounded">
                      {idx === 0 ? 'Principal' : idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions CTA: Delete Vehicle (Danger) + Cancel + Save Changes */}
          <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar Vehículo</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-glow-emerald active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
