export type CurrencyCode = "JPY" | "USD" | "KRW" | "TWD" | "EUR" | "GBP" | "SGD" | "HKD" | "CNY" | "AUD";

export const CURRENCIES: { code: CurrencyCode; label: string; symbol: string; flag: string; defaultRate: number }[] = [
  { code: "JPY", label: "日本円", symbol: "¥", flag: "🇯🇵", defaultRate: 1 },
  { code: "USD", label: "米ドル", symbol: "$", flag: "🇺🇸", defaultRate: 155 },
  { code: "KRW", label: "韓国ウォン", symbol: "₩", flag: "🇰🇷", defaultRate: 0.11 },
  { code: "TWD", label: "台湾ドル", symbol: "NT$", flag: "🇹🇼", defaultRate: 4.8 },
  { code: "EUR", label: "ユーロ", symbol: "€", flag: "🇪🇺", defaultRate: 168 },
  { code: "GBP", label: "英ポンド", symbol: "£", flag: "🇬🇧", defaultRate: 196 },
  { code: "SGD", label: "シンガポールドル", symbol: "S$", flag: "🇸🇬", defaultRate: 115 },
  { code: "HKD", label: "香港ドル", symbol: "HK$", flag: "🇭🇰", defaultRate: 20 },
  { code: "CNY", label: "中国元", symbol: "¥", flag: "🇨🇳", defaultRate: 21 },
  { code: "AUD", label: "豪ドル", symbol: "A$", flag: "🇦🇺", defaultRate: 102 },
];

export function getCurrency(code: CurrencyCode) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

/**
 * Convert local amount → JPY using the provided rate (1 unit local = rate JPY).
 */
export function toJpy(amountLocal: number, rate: number): number {
  return Math.round(amountLocal * rate);
}

/**
 * Format JPY for display: ¥1,234,567 (no decimals).
 */
export function formatJpy(amount: number, opts: { sign?: boolean } = {}): string {
  const sign = opts.sign && amount > 0 ? "+" : "";
  return `${sign}${amount < 0 ? "−" : ""}¥${Math.abs(amount).toLocaleString("ja-JP")}`;
}

/**
 * Format a non-JPY currency for display (using locale).
 */
export function formatCurrency(amount: number, code: CurrencyCode): string {
  const c = getCurrency(code);
  if (code === "JPY") return formatJpy(amount);
  if (code === "KRW") {
    return `${c.symbol}${Math.round(amount).toLocaleString("ko-KR")}`;
  }
  return `${c.symbol}${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

/**
 * Format a P/L number compactly for chart axes / cards (1.2M, 250K, etc.)
 */
export function formatCompactJpy(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "−" : "";
  if (abs >= 100_000_000) return `${sign}¥${(abs / 100_000_000).toFixed(1)}億`;
  if (abs >= 10_000) return `${sign}¥${(abs / 10_000).toFixed(1)}万`;
  if (abs >= 1_000) return `${sign}¥${(abs / 1_000).toFixed(1)}K`;
  return `${sign}¥${abs}`;
}
