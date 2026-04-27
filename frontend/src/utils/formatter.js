/**
 * Formats a number as a USD currency string.
 * Hides .00 for whole numbers, but shows 2 decimals otherwise.
 * e.g., 15 -> $15
 * e.g., 1325.4 -> $1,325.40
 */
export const formatCurrency = (amount) => {
  const numericAmount = Number(amount) || 0;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: numericAmount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};
