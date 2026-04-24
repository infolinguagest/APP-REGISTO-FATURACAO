export const formatNumber = (value: number | undefined): string => {
  return new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0);
};
