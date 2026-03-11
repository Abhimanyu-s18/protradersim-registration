// Trading data store with localStorage persistence
// Designed to be replaceable with a real API layer later

export interface Instrument {
  symbol: string;
  name: string;
  assetClass: "Forex" | "Commodities" | "Indices" | "Stocks" | "Crypto";
  bid: number;
  ask: number;
  spread: number;
  changePercent: number;
  pipSize: number;
  lotSize: number;
  leverageMax: number;
}

export interface WatchlistItem {
  symbol: string;
}

export interface Order {
  id: string;
  symbol: string;
  instrumentName: string;
  side: "Buy" | "Sell";
  type: "Market" | "Limit";
  quantity: number;
  leverage: number;
  entryPrice: number;
  limitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  status: "Filled" | "Pending" | "Cancelled" | "Rejected";
  timestamp: number;
  margin: number;
}

export interface Position {
  id: string;
  symbol: string;
  instrumentName: string;
  side: "Buy" | "Sell";
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  marginUsed: number;
  leverage: number;
  openedAt: number;
  status: "Open" | "Closed";
}

// ── Mock Instruments ──

const BASE_INSTRUMENTS: Instrument[] = [
  // Forex
  { symbol: "EUR/USD", name: "Euro / US Dollar", assetClass: "Forex", bid: 1.0862, ask: 1.0864, spread: 0.0002, changePercent: 0.12, pipSize: 0.0001, lotSize: 100000, leverageMax: 500 },
  { symbol: "GBP/USD", name: "British Pound / US Dollar", assetClass: "Forex", bid: 1.2715, ask: 1.2718, spread: 0.0003, changePercent: -0.08, pipSize: 0.0001, lotSize: 100000, leverageMax: 500 },
  { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", assetClass: "Forex", bid: 149.85, ask: 149.88, spread: 0.03, changePercent: 0.25, pipSize: 0.01, lotSize: 100000, leverageMax: 500 },
  { symbol: "AUD/USD", name: "Australian Dollar / US Dollar", assetClass: "Forex", bid: 0.6543, ask: 0.6546, spread: 0.0003, changePercent: -0.15, pipSize: 0.0001, lotSize: 100000, leverageMax: 500 },
  { symbol: "USD/CHF", name: "US Dollar / Swiss Franc", assetClass: "Forex", bid: 0.8812, ask: 0.8815, spread: 0.0003, changePercent: 0.05, pipSize: 0.0001, lotSize: 100000, leverageMax: 500 },
  { symbol: "EUR/GBP", name: "Euro / British Pound", assetClass: "Forex", bid: 0.8545, ask: 0.8548, spread: 0.0003, changePercent: 0.03, pipSize: 0.0001, lotSize: 100000, leverageMax: 400 },
  // Commodities
  { symbol: "XAU/USD", name: "Gold / US Dollar", assetClass: "Commodities", bid: 2345.50, ask: 2346.10, spread: 0.60, changePercent: 0.42, pipSize: 0.01, lotSize: 100, leverageMax: 200 },
  { symbol: "XAG/USD", name: "Silver / US Dollar", assetClass: "Commodities", bid: 27.42, ask: 27.46, spread: 0.04, changePercent: -0.31, pipSize: 0.01, lotSize: 5000, leverageMax: 200 },
  { symbol: "WTI", name: "Crude Oil WTI", assetClass: "Commodities", bid: 78.45, ask: 78.50, spread: 0.05, changePercent: 1.15, pipSize: 0.01, lotSize: 1000, leverageMax: 100 },
  { symbol: "BRENT", name: "Brent Crude Oil", assetClass: "Commodities", bid: 82.30, ask: 82.36, spread: 0.06, changePercent: 0.98, pipSize: 0.01, lotSize: 1000, leverageMax: 100 },
  { symbol: "NGAS", name: "Natural Gas", assetClass: "Commodities", bid: 2.85, ask: 2.87, spread: 0.02, changePercent: -1.22, pipSize: 0.001, lotSize: 10000, leverageMax: 100 },
  { symbol: "COPPER", name: "Copper", assetClass: "Commodities", bid: 4.12, ask: 4.13, spread: 0.01, changePercent: 0.35, pipSize: 0.01, lotSize: 25000, leverageMax: 100 },
  // Indices
  { symbol: "US500", name: "S&P 500", assetClass: "Indices", bid: 5248.50, ask: 5249.30, spread: 0.80, changePercent: 0.35, pipSize: 0.01, lotSize: 1, leverageMax: 200 },
  { symbol: "US30", name: "Dow Jones 30", assetClass: "Indices", bid: 39125.00, ask: 39128.00, spread: 3.00, changePercent: 0.18, pipSize: 1, lotSize: 1, leverageMax: 200 },
  { symbol: "NAS100", name: "Nasdaq 100", assetClass: "Indices", bid: 18320.50, ask: 18322.00, spread: 1.50, changePercent: 0.52, pipSize: 0.01, lotSize: 1, leverageMax: 200 },
  { symbol: "UK100", name: "FTSE 100", assetClass: "Indices", bid: 7935.20, ask: 7936.80, spread: 1.60, changePercent: -0.12, pipSize: 0.01, lotSize: 1, leverageMax: 200 },
  { symbol: "DE40", name: "DAX 40", assetClass: "Indices", bid: 18245.00, ask: 18247.50, spread: 2.50, changePercent: 0.28, pipSize: 0.01, lotSize: 1, leverageMax: 200 },
  { symbol: "JP225", name: "Nikkei 225", assetClass: "Indices", bid: 39650.00, ask: 39658.00, spread: 8.00, changePercent: -0.45, pipSize: 1, lotSize: 1, leverageMax: 200 },
  // Stocks
  { symbol: "AAPL", name: "Apple Inc.", assetClass: "Stocks", bid: 178.52, ask: 178.58, spread: 0.06, changePercent: 0.72, pipSize: 0.01, lotSize: 1, leverageMax: 20 },
  { symbol: "MSFT", name: "Microsoft Corp.", assetClass: "Stocks", bid: 415.80, ask: 415.92, spread: 0.12, changePercent: 0.45, pipSize: 0.01, lotSize: 1, leverageMax: 20 },
  { symbol: "TSLA", name: "Tesla Inc.", assetClass: "Stocks", bid: 172.35, ask: 172.48, spread: 0.13, changePercent: -1.85, pipSize: 0.01, lotSize: 1, leverageMax: 20 },
  { symbol: "AMZN", name: "Amazon.com Inc.", assetClass: "Stocks", bid: 182.45, ask: 182.55, spread: 0.10, changePercent: 0.38, pipSize: 0.01, lotSize: 1, leverageMax: 20 },
  { symbol: "NVDA", name: "NVIDIA Corp.", assetClass: "Stocks", bid: 875.30, ask: 875.60, spread: 0.30, changePercent: 2.15, pipSize: 0.01, lotSize: 1, leverageMax: 20 },
  { symbol: "META", name: "Meta Platforms", assetClass: "Stocks", bid: 502.10, ask: 502.35, spread: 0.25, changePercent: 0.62, pipSize: 0.01, lotSize: 1, leverageMax: 20 },
  // Crypto
  { symbol: "BTC/USD", name: "Bitcoin / US Dollar", assetClass: "Crypto", bid: 67450.00, ask: 67520.00, spread: 70.00, changePercent: 1.85, pipSize: 0.01, lotSize: 1, leverageMax: 50 },
  { symbol: "ETH/USD", name: "Ethereum / US Dollar", assetClass: "Crypto", bid: 3520.50, ask: 3524.80, spread: 4.30, changePercent: 2.42, pipSize: 0.01, lotSize: 1, leverageMax: 50 },
  { symbol: "XRP/USD", name: "Ripple / US Dollar", assetClass: "Crypto", bid: 0.5245, ask: 0.5255, spread: 0.001, changePercent: -0.65, pipSize: 0.0001, lotSize: 1, leverageMax: 50 },
  { symbol: "SOL/USD", name: "Solana / US Dollar", assetClass: "Crypto", bid: 148.20, ask: 148.55, spread: 0.35, changePercent: 3.12, pipSize: 0.01, lotSize: 1, leverageMax: 50 },
  { symbol: "ADA/USD", name: "Cardano / US Dollar", assetClass: "Crypto", bid: 0.4520, ask: 0.4535, spread: 0.0015, changePercent: -1.08, pipSize: 0.0001, lotSize: 1, leverageMax: 50 },
];

// ── Price simulation ──

export function simulatePriceTick(instruments: Instrument[]): Instrument[] {
  return instruments.map((inst) => {
    const volatility = inst.assetClass === "Crypto" ? 0.002 : inst.assetClass === "Forex" ? 0.0003 : 0.001;
    const change = (Math.random() - 0.5) * 2 * volatility * inst.bid;
    const newBid = Math.max(inst.bid * 0.9, inst.bid + change);
    const newAsk = newBid + inst.spread;
    const newChange = inst.changePercent + (change / inst.bid) * 100;
    return {
      ...inst,
      bid: parseFloat(newBid.toFixed(inst.pipSize < 0.001 ? 4 : inst.pipSize < 0.1 ? 2 : inst.bid > 1000 ? 2 : 4)),
      ask: parseFloat(newAsk.toFixed(inst.pipSize < 0.001 ? 4 : inst.pipSize < 0.1 ? 2 : inst.bid > 1000 ? 2 : 4)),
      changePercent: parseFloat(newChange.toFixed(2)),
    };
  });
}

// ── LocalStorage helpers ──

const KEYS = {
  watchlist: "pts_watchlist",
  orders: "pts_orders",
  positions: "pts_positions",
  balance: "pts_balance",
};

export function getInstruments(): Instrument[] {
  return [...BASE_INSTRUMENTS];
}

export function getWatchlist(): string[] {
  try {
    const raw = localStorage.getItem(KEYS.watchlist);
    return raw ? JSON.parse(raw) : ["EUR/USD", "XAU/USD", "US500", "BTC/USD", "AAPL"];
  } catch { return []; }
}

export function setWatchlist(symbols: string[]) {
  localStorage.setItem(KEYS.watchlist, JSON.stringify(symbols));
}

export function toggleWatchlist(symbol: string): string[] {
  const current = getWatchlist();
  const next = current.includes(symbol) ? current.filter((s) => s !== symbol) : [...current, symbol];
  setWatchlist(next);
  return next;
}

export function getOrders(): Order[] {
  try {
    const raw = localStorage.getItem(KEYS.orders);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveOrder(order: Order) {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(KEYS.orders, JSON.stringify(orders));
}

export function getPositions(): Position[] {
  try {
    const raw = localStorage.getItem(KEYS.positions);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function savePosition(position: Position) {
  const positions = getPositions();
  positions.unshift(position);
  localStorage.setItem(KEYS.positions, JSON.stringify(positions));
}

export function closePosition(id: string) {
  const positions = getPositions();
  const updated = positions.map((p) => (p.id === id ? { ...p, status: "Closed" as const } : p));
  localStorage.setItem(KEYS.positions, JSON.stringify(updated));
  return updated;
}

export function getBalance(): number {
  try {
    const raw = localStorage.getItem(KEYS.balance);
    return raw ? parseFloat(raw) : 100000;
  } catch { return 100000; }
}

export function setBalance(bal: number) {
  localStorage.setItem(KEYS.balance, bal.toString());
}

export function generateId(): string {
  return "SIM-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function getInstrumentBySymbol(symbol: string): Instrument | undefined {
  return BASE_INSTRUMENTS.find((i) => i.symbol === symbol);
}
