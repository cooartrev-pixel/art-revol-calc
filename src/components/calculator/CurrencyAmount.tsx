import { formatCurrency } from "@/lib/mortgage-calculations";

interface CurrencyAmountProps {
  amount: number;
  usdRate: number;
  eurRate: number;
  showMain?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CurrencyAmount({ amount, usdRate, eurRate, showMain = true, size = 'sm', className = '' }: CurrencyAmountProps) {
  if (amount <= 0) return null;
  
  const usd = Math.round(amount / usdRate);
  const eur = Math.round(amount / eurRate);
  const fmtNum = (n: number) => new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 }).format(n);
  
  const textSize = size === 'lg' ? 'text-sm' : size === 'md' ? 'text-xs' : 'text-[10px]';
  
  return (
    <span className={className}>
      {showMain && <span className="font-semibold">{formatCurrency(amount)}</span>}
      <span className={`${textSize} text-muted-foreground ml-1`}>
        (${fmtNum(usd)} · €{fmtNum(eur)})
      </span>
    </span>
  );
}

/** Inline text-only version for tight spaces */
export function currencyText(amount: number, usdRate: number, eurRate: number): string {
  if (amount <= 0) return '';
  const fmtNum = (n: number) => new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 }).format(Math.round(n));
  return `≈ $${fmtNum(amount / usdRate)} · €${fmtNum(amount / eurRate)}`;
}
