# Autify — Car Flipping & Arbitrage OS (USA Market)

<p align="center">
  <img src="public/images/autify-logo.png" alt="Autify Logo" width="280" />
</p>

Plataforma progresiva (PWA Mobile & Tablet First) de alto rendimiento para el negocio de compra, reacondicionamiento y reventa de vehículos (*car flipping*) en Estados Unidos.

---

## 🛠️ Tecnologías Utilizadas

- **Core:** React 18 + Vite
- **Estilos:** Tailwind CSS 3 (Dark Industrial UI)
- **Íconos:** Lucide React
- **Arquitectura de Estado:** Local state desacoplado con sincronización `localStorage`, preparado para Supabase en Fase 2
- **Mobile First / PWA:** Manifiesto web listo para empaquetado en Google Play Store

---

## 🎨 Reglas de Diseño Visual (Dark Industrial UI)

- **Fondo principal:** `#0B0C0E` (Negro profundo mate)
- **Superficie de tarjetas/contenedores:** `#141619` (Gris carbón oscuro)
- **Inputs y subcontenedores:** `#1E2025` con bordes sutiles `border-white/5`
- **Acento Primario (Rentabilidad/Venta):** `#10B981` (Verde Esmeralda)
- **Acento Secundario (Filtros/Búsqueda):** `#2563EB` (Azul Eléctrico)
- **Alertas / Reparación:** `#F59E0B` (Ámbar)
- **Tipografía:** *Plus Jakarta Sans* para interfaz y *JetBrains Mono* (`font-mono`) obligatorio para VIN, millaje (`mi`), fechas y montos en dólares (`$ USD`).
- **Superficies limpias:** Cero franjas laterales o superiores de color en tarjetas (`border-l-4`, `border-t-4`).

---

## 🚀 Características Principales (Fase 1)

1. **Acceso Empresarial:** Pantalla de autenticación y cierre de sesión con loader minimalista centrado en la marca.
2. **KPIs Financieros en Tiempo Real:**
   - Capital en Inventario Activo ($)
   - Total Gastado en Reparaciones ($)
   - Ganancia Proyectada ($)
   - Ganancia Neta Realizada ($)
3. **Flota de Vehículos (Mercado USA):**
   - 4 vehículos de prueba realistas (Clean, Salvage, Rebuilt titles).
   - Copiado rápido de VIN de 17 caracteres al portapapeles.
   - Resumen financiero de 3 columnas: Inversión Total vs Precio Venta vs Margen Neto / ROI %.
4. **Ficha de Taller (Modal Tablet 3 Paneles):**
   - Carrusel de fotos y ficha técnica.
   - Bitácora de gastos con formulario *inline* y filtros por categoría (Mechanical, Parts, Body & Paint, Detailing, DMV / Fees).
   - Resumen contable tipo checkout con precio de venta editable en vivo y cálculo instantáneo de ROI.
5. **Modal de Registro (+ Nuevo Vehículo):**
   - Validación estricta de 17 caracteres para el VIN (estándar NHTSA).
   - Preajustes de fotos de automóviles y cálculo de rentabilidad.

---

## 💻 Instalación y Ejecución Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/JohnlennonA/Autify.git

# 2. Entrar al directorio
cd Autify

# 3. Instalar dependencias
npm install

# 4. Iniciar servidor de desarrollo
npm run dev
```

---

## 📦 Build para Producción

```bash
npm run build
```
