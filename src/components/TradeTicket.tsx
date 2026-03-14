import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import {
  Instrument,
  generateId,
  saveOrder,
  savePosition,
  getBalance,
  getAccount,
  saveAccount,
  getPositions,
  getInstruments,
  calculateMetrics,
  estimatePostTradeMetrics,
} from '@/lib/trading-store';

interface Props {
  instrument: Instrument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderPlaced?: () => void;
}

const LEVERAGE_OPTIONS = [1, 5, 10, 20, 50, 100, 200, 500];

const fmt = (n: number) =>
  `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const pctFmt = (n: number) => (n === Infinity ? '∞' : `${n.toFixed(1)}%`);

export default function TradeTicket({
  instrument,
  open,
  onOpenChange,
  onOrderPlaced,
}: Props) {
  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');
  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market');
  const [quantity, setQuantity] = useState('1');
  const [leverage, setLeverage] = useState('100');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const inst = instrument;
  const price = inst ? (side === 'Buy' ? inst.ask : inst.bid) : 0;
  const qty = parseFloat(quantity) || 0;
  const lev = parseInt(leverage) || 1;

  const calc = useMemo(() => {
    if (!inst || qty <= 0) return null;
    const notional = price * qty * inst.lotSize;
    const margin = notional / lev;
    const spreadCost = inst.spread * qty * inst.lotSize;
    return { notional, margin, spreadCost };
  }, [inst, qty, price, lev]);

  // Post-trade risk preview
  const postTradeMetrics = useMemo(() => {
    if (!calc || !inst) return null;
    const positions = getPositions();
    const instruments = getInstruments();
    return estimatePostTradeMetrics(
      instruments,
      positions,
      calc.margin,
      calc.notional,
      inst.assetClass
    );
  }, [calc, inst]);

  const currentMetrics = useMemo(() => {
    const positions = getPositions();
    const instruments = getInstruments();
    return calculateMetrics(instruments, positions);
  }, []);

  const availableLeverages = LEVERAGE_OPTIONS.filter((l) =>
    inst ? l <= inst.leverageMax : true
  );

  const resetForm = () => {
    setSide('Buy');
    setOrderType('Market');
    setQuantity('1');
    setLeverage('100');
    setLimitPrice('');
    setStopLoss('');
    setTakeProfit('');
    setSuccess(false);
  };

  const handleSubmit = () => {
    if (!inst || !calc || qty <= 0) return;
    const bal = getBalance();
    if (calc.margin > bal) return;

    setSubmitting(true);
    setTimeout(() => {
      const orderId = generateId();
      const entryPrice =
        orderType === 'Market' ? price : parseFloat(limitPrice) || price;

      saveOrder({
        id: orderId,
        symbol: inst.symbol,
        instrumentName: inst.name,
        side,
        type: orderType,
        quantity: qty,
        leverage: lev,
        entryPrice,
        limitPrice:
          orderType === 'Limit'
            ? parseFloat(limitPrice) || undefined
            : undefined,
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
        takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
        status: orderType === 'Market' ? 'Filled' : 'Pending',
        timestamp: Date.now(),
        margin: calc.margin,
      });

      if (orderType === 'Market') {
        savePosition({
          id: orderId,
          symbol: inst.symbol,
          instrumentName: inst.name,
          side,
          size: qty,
          entryPrice,
          currentPrice: entryPrice,
          pnl: 0,
          marginUsed: calc.margin,
          leverage: lev,
          openedAt: Date.now(),
          status: 'Open',
        });
        // Deduct margin from balance
        const account = getAccount();
        account.balance -= calc.margin;
        saveAccount(account);
      }

      setSubmitting(false);
      setSuccess(true);
      onOrderPlaced?.();
    }, 800);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  if (!inst) return null;

  const insufficientMargin = calc ? calc.margin > getBalance() : false;
  const willStressAccount =
    postTradeMetrics && postTradeMetrics.marginWarning !== 'none';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            Trade <span className="font-mono text-primary">{inst.symbol}</span>
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            {inst.name} · Simulated Order Entry
          </p>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 mx-auto text-success" />
            <p className="text-sm font-medium text-foreground">
              Simulated Order Placed
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {side} {qty} lot(s) of {inst.symbol} at{' '}
              {price.toFixed(inst.pipSize < 0.001 ? 4 : 2)}
            </p>
            <Button onClick={handleClose} variant="outline" size="sm">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Side */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={side === 'Buy' ? 'default' : 'outline'}
                className={
                  side === 'Buy'
                    ? 'bg-success hover:bg-success/90 text-success-foreground'
                    : ''
                }
                onClick={() => setSide('Buy')}
              >
                Buy
              </Button>
              <Button
                variant={side === 'Sell' ? 'default' : 'outline'}
                className={
                  side === 'Sell'
                    ? 'bg-destructive hover:bg-destructive/90'
                    : ''
                }
                onClick={() => setSide('Sell')}
              >
                Sell
              </Button>
            </div>

            {/* Price display */}
            <div className="grid grid-cols-2 gap-3 text-center rounded-lg bg-muted/30 p-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Bid
                </p>
                <p className="font-mono text-sm text-foreground">
                  {inst.bid.toFixed(inst.pipSize < 0.001 ? 4 : 2)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Ask
                </p>
                <p className="font-mono text-sm text-foreground">
                  {inst.ask.toFixed(inst.pipSize < 0.001 ? 4 : 2)}
                </p>
              </div>
            </div>

            {/* Order Type */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Order Type
              </Label>
              <Select
                value={orderType}
                onValueChange={(v) => setOrderType(v as 'Market' | 'Limit')}
              >
                <SelectTrigger className="bg-muted/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Market">Market</SelectItem>
                  <SelectItem value="Limit">Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {orderType === 'Limit' && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Limit Price
                </Label>
                <Input
                  type="number"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="bg-muted/30 border-border/50 font-mono"
                  placeholder={price.toString()}
                />
              </div>
            )}

            {/* Quantity + Leverage */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Quantity (Lots)
                </Label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="bg-muted/30 border-border/50 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Leverage
                </Label>
                <Select value={leverage} onValueChange={setLeverage}>
                  <SelectTrigger className="bg-muted/30 border-border/50 font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLeverages.map((l) => (
                      <SelectItem key={l} value={l.toString()}>
                        1:{l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* SL / TP */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Stop Loss
                </Label>
                <Input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="bg-muted/30 border-border/50 font-mono"
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Take Profit
                </Label>
                <Input
                  type="number"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="bg-muted/30 border-border/50 font-mono"
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Calc preview */}
            {calc && (
              <div className="rounded-lg bg-muted/20 p-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Notional Exposure
                  </span>
                  <span className="font-mono text-foreground">
                    {fmt(calc.notional)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Estimated Margin
                  </span>
                  <span className="font-mono text-foreground">
                    {fmt(calc.margin)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Est. Spread Cost
                  </span>
                  <span className="font-mono text-foreground">
                    {fmt(calc.spreadCost)}
                  </span>
                </div>
              </div>
            )}

            {/* Post-trade risk impact */}
            {postTradeMetrics && calc && (
              <div className="rounded-lg bg-muted/10 border border-border/30 p-3 space-y-1.5 text-xs">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3" /> Post-Trade Account Impact
                </p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Margin Used</span>
                  <span className="font-mono text-foreground">
                    {fmt(currentMetrics.marginUsed)} →{' '}
                    {fmt(postTradeMetrics.marginUsed)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Free Margin</span>
                  <span
                    className={`font-mono ${postTradeMetrics.freeMargin < 0 ? 'text-destructive' : 'text-foreground'}`}
                  >
                    {fmt(currentMetrics.freeMargin)} →{' '}
                    {fmt(postTradeMetrics.freeMargin)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Margin Level</span>
                  <span
                    className={`font-mono ${
                      postTradeMetrics.marginWarning === 'critical'
                        ? 'text-destructive'
                        : postTradeMetrics.marginWarning === 'warning'
                          ? 'text-primary'
                          : 'text-foreground'
                    }`}
                  >
                    {pctFmt(currentMetrics.marginLevel)} →{' '}
                    {pctFmt(postTradeMetrics.marginLevel)}
                  </span>
                </div>
              </div>
            )}

            {/* Warnings */}
            {insufficientMargin && (
              <p className="text-xs text-destructive flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3" /> Insufficient simulated
                margin
              </p>
            )}

            {!insufficientMargin && willStressAccount && (
              <div
                className={`rounded-lg px-3 py-2 text-xs flex items-center gap-1.5 ${
                  postTradeMetrics?.marginWarning === 'critical'
                    ? 'bg-destructive/10 border border-destructive/20 text-destructive'
                    : 'bg-primary/10 border border-primary/20 text-primary'
                }`}
              >
                <AlertTriangle className="h-3 w-3 shrink-0" />
                {postTradeMetrics?.marginWarning === 'critical'
                  ? 'This trade would bring your account into critical margin territory.'
                  : 'This trade would reduce your margin level below the 150% warning threshold.'}
              </div>
            )}

            {/* Risk notice */}
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              This is a simulated order. No real funds or market execution is
              involved. Leveraged CFD trading carries significant risk.
            </p>

            <Button
              onClick={handleSubmit}
              disabled={submitting || qty <= 0 || insufficientMargin}
              className="w-full gold-gradient text-primary-foreground font-semibold"
            >
              {submitting ? 'Processing…' : `Place ${orderType} ${side} Order`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
