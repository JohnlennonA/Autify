# 🚀 PLAN DE INTEGRACIÓN COMPLETO: AUTIFY ➔ SUPABASE

Este documento contiene la planificación técnica, arquitectura de base de datos, scripts SQL listos para ejecutar, y el paso a paso para cuando decidas conectar **Supabase** a la plataforma.

---

## 1. 🔑 Datos que necesitarás enviarme ese día

Solo necesitarás crear un proyecto gratuito en [supabase.com](https://supabase.com) y enviarme estos dos datos:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
*(Se obtienen en tu Dashboard de Supabase en: **Project Settings** ➔ **API** ➔ **Project URL** y **Project API Keys [anon public]**)*

---

## 2. 🗄️ Esquema de Base de Datos SQL (Listo para copiar y pegar)

El día de la integración, abriremos el **SQL Editor** de Supabase y pegaremos este script completo con tablas, relaciones, índices y triggers:

```sql
-- ==============================================================================
-- AUTIFY DATABASE SCHEMA — SUPABASE POSTGRESQL
-- ==============================================================================

-- 1. TABLA: VEHÍCULOS (VEHICLES)
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vin VARCHAR(17) UNIQUE NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    color VARCHAR(50) DEFAULT 'Desconocido',
    mileage INTEGER DEFAULT 0,
    title_status VARCHAR(30) DEFAULT 'Clean' CHECK (title_status IN ('Clean', 'Salvage', 'Rebuilt')),
    status VARCHAR(30) DEFAULT 'available' CHECK (status IN ('available', 'for_sale', 'rented', 'in_repair', 'sold')),
    purchase_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    estimated_sale_price NUMERIC(12,2) DEFAULT 0,
    sold_price NUMERIC(12,2) DEFAULT NULL,
    purchase_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA: FOTOS DE VEHÍCULOS (VEHICLE_PHOTOS)
CREATE TABLE IF NOT EXISTS public.vehicle_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: BITÁCORA DE COSTOS E INVERSIÓN (EXPENSES)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    category VARCHAR(80) NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    expense_date DATE DEFAULT CURRENT_DATE,
    receipt_url TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA: CONTRATOS DE RENTA (RENTALS)
CREATE TABLE IF NOT EXISTS public.rentals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(100) DEFAULT NULL,
    customer_doc VARCHAR(80) DEFAULT NULL,
    start_date DATE NOT NULL,
    end_date DATE DEFAULT NULL,
    billing_cycle VARCHAR(30) DEFAULT 'semanal' CHECK (billing_cycle IN ('diario', 'semanal', 'quincenal', 'mensual')),
    rate NUMERIC(10,2) NOT NULL CHECK (rate > 0),
    security_deposit NUMERIC(10,2) DEFAULT 0,
    deposit_returned BOOLEAN DEFAULT FALSE,
    odometer_start INTEGER NOT NULL,
    odometer_end INTEGER DEFAULT NULL,
    returned_date DATE DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    return_notes TEXT DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA: PAGOS / COBROS DE RENTA (RENTAL_PAYMENTS)
CREATE TABLE IF NOT EXISTS public.rental_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_id UUID NOT NULL REFERENCES public.rentals(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) DEFAULT 'Zelle',
    concept VARCHAR(150) DEFAULT 'Pago de Renta',
    receipt_url TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ÍNDICES DE RENDIMIENTO Y BÚSQUEDA
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON public.vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_expenses_vehicle_id ON public.expenses(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_rentals_vehicle_id ON public.rentals(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_rental_payments_rental_id ON public.rental_payments(rental_id);

-- ==============================================================================
-- FUNCIÓN TRIGGER: ACTUALIZACIÓN AUTOMÁTICA DE updated_at
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_vehicles_updated_at
BEFORE UPDATE ON public.vehicles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_rentals_updated_at
BEFORE UPDATE ON public.rentals
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 3. 📦 Storage Buckets (Archivos, Fotos y Recibos)

En Supabase, en la sección **Storage**, crearemos dos buckets públicos:
1. `vehicle-photos`: Para alojar las fotos de los vehículos en alta resolución.
2. `expense-receipts`: Para alojar las fotos y PDFs de las facturas y comprobantes.

**Política de Acceso de Storage (SQL rápido):**
```sql
-- Permitir lectura pública de fotos y comprobantes
INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle-photos', 'vehicle-photos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('expense-receipts', 'expense-receipts', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Lectura pública de fotos" ON storage.objects FOR SELECT USING (bucket_id = 'vehicle-photos');
CREATE POLICY "Lectura pública de comprobantes" ON storage.objects FOR SELECT USING (bucket_id = 'expense-receipts');

CREATE POLICY "Subida de fotos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vehicle-photos');
CREATE POLICY "Subida de comprobantes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'expense-receipts');
```

---

## 4. ⚙️ Capa de Servicios en el Código (Ya preparada)

1. **`src/lib/supabase.js`**: Ya está creado. Detecta automáticamente si las variables de entorno existen; si no existen, el sistema trabaja en modo demo seguro sin romperse.
2. **`src/services/dbService.js`**:
   - `getVehicles()`: Carga toda la flota con sus fotos, gastos y contratos de renta en una sola consulta optimizada (`select('*, vehicle_photos(*), expenses(*), rentals(*, rental_payments(*))')`.
   - `saveVehicle(vehicleData)`: Inserta o actualiza en Supabase.
   - `saveExpense(vehicleId, expenseData)`: Registra gasto con URL del recibo.
   - `saveRentalPayment(paymentData)`: Registra cobro de renta.
   - `uploadReceiptFile(file)`: Sube imagen a `expense-receipts` y retorna la URL pública.
   - `uploadVehiclePhoto(file)`: Sube imagen a `vehicle-photos` y retorna la URL pública.

---

## 5. 🔄 Migración de Datos Existentes (Semilla automática)

Para que el día que conectemos la base de datos **no pierdas ningún vehículo de los que ya tienes configurados**:
* Tendremos una función `migrateMockDataToSupabase()`.
* Al presionar un botón *"Sincronizar Datos Iniciales"*, el sistema subirá automáticamente todos los autos que tienes en pantalla directo a tu base de datos de Supabase.

---

## 6. 📋 Lista de Pasos para el Día de la Integración (Checklist)

| Paso | Acción | Tiempo estimado |
| :---: | :--- | :---: |
| **1** | Creas el proyecto en [supabase.com](https://supabase.com). | 2 minutos |
| **2** | Me envías tu `Project URL` y tu `Anon Key`. | 1 minuto |
| **3** | Copias y pegas el SQL del punto 2 en el **SQL Editor** de Supabase y pulsas **RUN**. | 1 minuto |
| **4** | Yo activo el `.env` y el servicio de base de datos en el código. | 3 minutos |
| **5** | ¡Listo! Tus autos, fotos, gastos y rentas se guardan en la nube en tiempo real. | Inmediato |

---
*Archivo generado para Autify — Car Flipping & Reconditioning OS.*
