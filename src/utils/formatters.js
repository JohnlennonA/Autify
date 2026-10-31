// Formatting and financial calculation utilities for Autify

/**
 * Formats a number to USD currency ($XX,XXX)
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats a number with commas and 'mi' suffix
 */
export const formatMileage = (miles) => {
  if (miles === null || miles === undefined || isNaN(miles)) return '0 mi';
  return `${new Intl.NumberFormat('en-US').format(miles)} mi`;
};

/**
 * Calculates days elapsed between purchase date and today (or sold date)
 */
export const calculateDaysInStock = (purchaseDateStr) => {
  if (!purchaseDateStr) return 0;
  try {
    const purchaseDate = new Date(purchaseDateStr);
    const today = new Date();
    const diffTime = Math.abs(today - purchaseDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return 0;
  }
};

/**
 * Calculates complete financial breakdown for a single vehicle
 */
export const calculateVehicleFinancials = (vehicle) => {
  const purchasePrice = Number(vehicle.purchasePrice) || 0;
  const expenses = vehicle.expenses || [];
  
  const totalExpenses = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalInvestment = purchasePrice + totalExpenses;

  const isSold = vehicle.status === 'sold';
  const targetPrice = isSold 
    ? (Number(vehicle.soldPrice) || Number(vehicle.estimatedSalePrice) || 0)
    : (Number(vehicle.estimatedSalePrice) || 0);

  const netProfit = targetPrice - totalInvestment;
  const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
  const daysInStock = calculateDaysInStock(vehicle.purchaseDate);

  return {
    purchasePrice,
    totalExpenses,
    totalInvestment,
    targetPrice,
    netProfit,
    roi,
    isSold,
    daysInStock,
  };
};

/**
 * Calculates dynamic KPI metrics across the entire fleet
 */
export const calculateFleetKPIs = (vehicles = []) => {
  let activeInventoryCapital = 0;
  let totalSpentRepairs = 0;
  let projectedProfit = 0;
  let realizedProfit = 0;
  let soldCount = 0;
  let activeCount = 0;

  vehicles.forEach((v) => {
    const fin = calculateVehicleFinancials(v);
    totalSpentRepairs += fin.totalExpenses;

    if (v.status === 'sold') {
      realizedProfit += fin.netProfit;
      soldCount += 1;
    } else {
      activeInventoryCapital += fin.totalInvestment;
      projectedProfit += fin.netProfit;
      activeCount += 1;
    }
  });

  return {
    activeInventoryCapital,
    totalSpentRepairs,
    projectedProfit,
    realizedProfit,
    activeCount,
    soldCount,
    totalVehicles: vehicles.length,
  };
};
