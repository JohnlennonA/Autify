// Autify Business Logic & Validation Engine
// Reglas de negocio para operaciones automotrices, rentas, taller y liquidación

export const VEHICLE_STATUSES_KEYS = {
  AVAILABLE: 'available',
  FOR_SALE: 'for_sale',
  RENTED: 'rented',
  IN_REPAIR: 'in_repair',
  SOLD: 'sold'
};

export const STATUS_LABELS = {
  available: 'Disponible (Stock en Patio)',
  for_sale: 'En Venta / Publicado',
  rented: 'En Renta Activa',
  in_repair: 'En Reparación / Taller',
  sold: 'Vendido / Liquidado'
};

/**
 * Valida si una transición de estado está permitida bajo las reglas del negocio automotriz.
 * @param {Object} vehicle - El vehículo a modificar
 * @param {string} nextStatus - El nuevo estado solicitado ('available' | 'for_sale' | 'rented' | 'in_repair' | 'sold')
 * @returns {Object} { allowed: boolean, reason?: string, warning?: boolean, code?: string }
 */
export const validateStatusTransition = (vehicle, nextStatus) => {
  if (!vehicle) return { allowed: false, reason: 'Vehículo no encontrado' };
  const current = vehicle.status;

  if (current === nextStatus) {
    return { allowed: true, reason: 'El vehículo ya se encuentra en este estado.' };
  }

  // 1. REGLA FUNDAMENTAL: UN VEHÍCULO VENDIDO NO PUEDE CAMBIARSE DIRECTAMENTE
  // (Si está vendido, no se puede rentar, ni mandar a taller, ni poner en venta sin revertir la venta)
  if (current === 'sold') {
    return {
      allowed: false,
      code: 'ERR_SOLD_LOCKED',
      reason: 'El vehículo ya fue VENDIDO y liquidado comercialmente. No es posible cambiarlo de estado sin antes anular o reabrir la venta de forma explícita.'
    };
  }

  // 2. REGLA DE RENTA: UN AUTO EN RENTA TIENE UN CLIENTE ASIGNADO
  // No puede venderse directamente ni pasarse a venta/disponible sin registrar el retorno de la unidad
  if (current === 'rented') {
    if (nextStatus === 'sold') {
      return {
        allowed: false,
        code: 'ERR_RENTED_CANNOT_SELL',
        reason: 'El vehículo tiene un contrato de renta activo con un cliente. Debe registrar el retorno de la unidad y finalizar el contrato antes de poder venderlo.'
      };
    }
    if (nextStatus === 'for_sale' || nextStatus === 'available') {
      return {
        allowed: false,
        code: 'ERR_RENTED_CANNOT_RETURN_DIRECT',
        reason: 'La unidad se encuentra en posesión del arrendatario. Debe utilizar la acción "Finalizar Renta e Inspección" para registrar el retorno de la unidad al inventario.'
      };
    }
    if (nextStatus === 'in_repair') {
      // Se permite pasar a taller en caso de avería en renta, pero con advertencia
      return {
        allowed: true,
        warning: true,
        reason: 'Atención: Se registrará el ingreso a taller por avería o mantenimiento durante el periodo de renta.'
      };
    }
  }

  // 3. REGLA DE TALLER: UN AUTO EN REPARACIÓN NO PUEDE RENTARSE DIRECTAMENTE
  // Debe completarse el trabajo y quedar disponible primero
  if (current === 'in_repair' && nextStatus === 'rented') {
    return {
      allowed: false,
      code: 'ERR_REPAIR_CANNOT_RENT',
      reason: 'El vehículo está actualmente en taller con reparaciones pendientes. Debe completar los trabajos y marcarlo como "En Venta / Listo" antes de poder entregarlo a un cliente.'
    };
  }

  // 4. PASO A VENDIDO DESDE TALLER
  if (nextStatus === 'sold' && current === 'in_repair') {
    return {
      allowed: true,
      warning: true,
      reason: 'Aviso: El vehículo está en taller. Se registrará la venta en su estado actual (venta directa as-is).'
    };
  }

  return { allowed: true };
};

/**
 * Verifica si un vehículo es apto para iniciar un contrato de renta
 * @param {Object} vehicle
 * @returns {Object} { allowed: boolean, reason?: string }
 */
export const canRentVehicle = (vehicle) => {
  if (!vehicle) return { allowed: false, reason: 'Vehículo inválido' };

  if (vehicle.status === 'sold') {
    return {
      allowed: false,
      reason: 'No se puede rentar este vehículo porque ya fue VENDIDO y liquidado.'
    };
  }

  if (vehicle.status === 'in_repair') {
    return {
      allowed: false,
      reason: 'El auto está en reparación en taller. Debe finalizar los trabajos antes de poder asignarlo a un cliente.'
    };
  }

  if (vehicle.status === 'rented') {
    return {
      allowed: true,
      isActive: true,
      reason: 'El vehículo ya cuenta con un contrato de renta activo.'
    };
  }

  return { allowed: true };
};

/**
 * Valida si un vehículo puede ser eliminado permanentemente del sistema
 * @param {Object} vehicle
 * @returns {Object} { allowed: boolean, reason?: string }
 */
export const canDeleteVehicle = (vehicle) => {
  if (!vehicle) return { allowed: false, reason: 'Vehículo no encontrado' };

  if (vehicle.status === 'rented') {
    return {
      allowed: false,
      reason: 'Operación bloqueada: No se puede eliminar un vehículo que tiene un contrato de renta activo. Primero finalice el contrato para conservar el historial y depósito del cliente.'
    };
  }

  return { allowed: true };
};

/**
 * Valida los datos al registrar el retorno / inspección de un auto rentado
 * @param {Object} vehicle
 * @param {Object} returnData { returnMileage, returnStatus, returnDate, depositReturned, deductions }
 * @returns {Object} { valid: boolean, error?: string }
 */
export const validateReturnInspection = (vehicle, returnData) => {
  const startMileage = Number(vehicle?.rental?.odometerStart) || Number(vehicle?.mileage) || 0;
  const returnMileage = Number(returnData?.returnMileage);

  if (isNaN(returnMileage) || returnMileage <= 0) {
    return { valid: false, error: 'Debe ingresar un millaje de retorno válido.' };
  }

  if (returnMileage < startMileage) {
    return {
      valid: false,
      error: `El millaje de retorno (${returnMileage.toLocaleString()} mi) no puede ser menor al millaje inicial de entrega (${startMileage.toLocaleString()} mi).`
    };
  }

  return {
    valid: true,
    milesDriven: returnMileage - startMileage
  };
};

/**
 * Valida un nuevo contrato de renta
 */
export const validateRentalContract = (contractData) => {
  if (!contractData.customerName || contractData.customerName.trim().length < 3) {
    return { valid: false, error: 'Debe ingresar el nombre completo del arrendatario (mínimo 3 caracteres).' };
  }

  if (!contractData.customerPhone || contractData.customerPhone.trim().length < 7) {
    return { valid: false, error: 'Debe ingresar un número telefónico o WhatsApp de contacto válido.' };
  }

  const rate = parseFloat(contractData.rate);
  if (isNaN(rate) || rate <= 0) {
    return { valid: false, error: 'La tarifa de renta debe ser mayor a $0.' };
  }

  if (!contractData.startDate) {
    return { valid: false, error: 'Debe seleccionar una fecha de inicio de contrato.' };
  }

  return { valid: true };
};

/**
 * Valida un pago de renta
 */
export const validateRentalPayment = (paymentData) => {
  const amount = parseFloat(paymentData.amount);
  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: 'El monto del cobro debe ser un número positivo mayor a $0.' };
  }

  if (!paymentData.concept || paymentData.concept.trim().length === 0) {
    return { valid: false, error: 'Debe especificar el concepto del pago.' };
  }

  return { valid: true };
};

/**
 * Valida si se pueden registrar gastos de taller o mejoras en un vehículo
 * @param {Object} vehicle
 * @returns {Object} { allowed: boolean, reason?: string }
 */
export const canAddExpense = (vehicle) => {
  if (!vehicle) return { allowed: false, reason: 'Vehículo no encontrado' };

  if (vehicle.status === 'sold') {
    return {
      allowed: false,
      reason: 'El vehículo está cerrado y liquidado como VENDIDO. No se pueden imputar nuevos gastos directos a una unidad liquidada.'
    };
  }

  return { allowed: true };
};
