import { useState, useEffect } from 'react';
import { Order, getOrders } from '@/lib/trading-store';
import DashboardShell from '@/components/DashboardShell';
import { ListOrdered } from 'lucide-react';

export default function DashboardOrders() {
  const [orders, setOrders] = useState<Order[]>(getOrders);
  const [tab, setTab] = useState<'open' | 'history'>('open');

  useEffect(() => {
    const interval = setInterval(() => setOrders(getOrders()), 2000);
    return () => clearInterval(interval);
  }, []);

  const openOrders = orders.filter((o) => o.status === 'Pending');
  const historyOrders = orders.filter((o) => o.status !== 'Pending');
  const display = tab === 'open' ? openOrders : historyOrders;

  return (
    <DashboardShell title="Orders" activeItem="Orders">
      <div className="space-y-4">
        <div className="flex gap-2">
          {(['open', 'history'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === t
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'text-muted-foreground bg-muted/30 border border-transparent'
              }`}
            >
              {t === 'open'
                ? `Open Orders (${openOrders.length})`
                : `Order History (${historyOrders.length})`}
            </button>
          ))}
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          {display.length === 0 ? (
            <div className="py-16 text-center">
              <ListOrdered className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                {tab === 'open' ? 'No open orders yet' : 'No order history yet'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Place a simulated trade from the Markets page
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    {[
                      'Time',
                      'ID',
                      'Symbol',
                      'Side',
                      'Type',
                      'Qty',
                      'Price',
                      'Status',
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {display.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b border-border/30 hover:bg-muted/20"
                    >
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                        {new Date(o.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                        {o.id}
                      </td>
                      <td className="px-4 py-3 font-mono font-medium text-foreground">
                        {o.symbol}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-semibold ${o.side === 'Buy' ? 'text-success' : 'text-destructive'}`}
                        >
                          {o.side}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {o.type}
                      </td>
                      <td className="px-4 py-3 font-mono text-foreground">
                        {o.quantity}
                      </td>
                      <td className="px-4 py-3 font-mono text-foreground">
                        {o.entryPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] uppercase tracking-wider font-semibold ${
                            o.status === 'Filled'
                              ? 'text-success'
                              : o.status === 'Pending'
                                ? 'text-primary'
                                : 'text-muted-foreground'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
