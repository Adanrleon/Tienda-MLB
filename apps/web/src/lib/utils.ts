export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(amountInCents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountInCents / 100);
}

export function toStockLabel(stock: number) {
  if (stock <= 0) return 'Sold out';
  if (stock <= 3) return `Only ${stock} left`;
  return 'Ready to ship';
}
