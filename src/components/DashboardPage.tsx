import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '../store/useStore';
import { formatDistanceToNow } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  Package, 
  Layers, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Activity, 
  ShieldAlert,
  Loader2,
  CheckCircle
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const db = useStore((state) => state.db);
  const setActiveTab = useStore((state) => state.setActiveTab);

  // Fetch Items
  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['items'],
    queryFn: () => db.getItems(),
  });

  // Fetch Transactions with Item Info
  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => db.getTransactions(10),
  });

  if (itemsLoading || txLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-550 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#c06c3c]" />
        <span className="text-sm font-semibold tracking-wider font-mono">Assembling live metrics...</span>
      </div>
    );
  }

  // Summary Metrics calculations
  const totalItems = items.length;
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);
  
  const outOfStockItems = items.filter(item => item.quantity === 0);
  const lowStockItems = items.filter(item => item.quantity > 0 && item.quantity <= item.min_stock_level);
  
  const outOfStockCount = outOfStockItems.length;
  const lowStockCount = lowStockItems.length;

  // Chart data: Total Stock Units by Category
  const categoryDataMap: { [key: string]: number } = {};
  items.forEach((item) => {
    const cat = item.category || 'Uncategorized';
    categoryDataMap[cat] = (categoryDataMap[cat] || 0) + item.quantity;
  });

  const chartData = Object.keys(categoryDataMap).map((name) => ({
    name,
    units: categoryDataMap[name],
  })).sort((a, b) => b.units - a.units);

  // Alert items merged for display (Out of Stock first, then Low Stock)
  const alertsList = [...outOfStockItems, ...lowStockItems].slice(0, 8);

  // Premium warm amber theme colors for the chart
  const colors = ['#c06c3c', '#d38354', '#e28a50', '#eaab7a', '#783e1d'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 font-sans">
            Bar <span className="text-[#c06c3c]">Overview</span>
          </h1>
          <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mt-1">Real-time status updates and critical stock levels.</p>
        </div>
        <button
          onClick={() => setActiveTab('inventory')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#c06c3c] hover:bg-[#a6562a] text-[#faf8f5] rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md"
        >
          <span>Access Inventory Manager</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Items */}
        <div className="glass-card bg-[#191715]/40 border border-[#2b2724] rounded-2xl p-6 flex items-start gap-4 hover:border-zinc-800 transition-all">
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 text-[#c06c3c] shadow-inner">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider font-mono">Total Products</p>
            <h3 className="text-2xl font-extrabold text-zinc-100 mt-1 font-mono">{totalItems}</h3>
            <p className="text-zinc-450 text-[10px] mt-1 font-sans">Unique catalog references</p>
          </div>
        </div>

        {/* Total Stock Units */}
        <div className="glass-card bg-[#191715]/40 border border-[#2b2724] rounded-2xl p-6 flex items-start gap-4 hover:border-zinc-800 transition-all">
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 text-[#d38354] shadow-inner">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider font-mono">Total Stock Units</p>
            <h3 className="text-2xl font-extrabold text-zinc-100 mt-1 font-mono">{totalUnits}</h3>
            <p className="text-zinc-455 text-[10px] mt-1 font-sans">Total combined quantities</p>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="glass-card bg-[#191715]/40 border border-[#2b2724] rounded-2xl p-6 flex items-start gap-4 hover:border-amber-900/30 transition-all">
          <div className={`p-3 rounded-xl border text-amber-400 shadow-inner ${lowStockCount > 0 ? 'bg-amber-500/10 border-amber-500/20 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.15)]' : 'bg-zinc-950 border-zinc-900'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider font-mono">Low Stock</p>
            <h3 className={`text-2xl font-extrabold mt-1 font-mono transition-colors ${lowStockCount > 0 ? 'text-amber-400' : 'text-zinc-100'}`}>
              {lowStockCount}
            </h3>
            <p className="text-zinc-455 text-[10px] mt-1 font-sans">Below critical threshold</p>
          </div>
        </div>

        {/* Out of Stock Items */}
        <div className="glass-card bg-[#191715]/40 border border-[#2b2724] rounded-2xl p-6 flex items-start gap-4 hover:border-rose-900/30 transition-all">
          <div className={`p-3 rounded-xl border text-rose-400 shadow-inner ${outOfStockCount > 0 ? 'bg-rose-500/10 border-rose-500/20 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.15)]' : 'bg-zinc-950 border-zinc-900'}`}>
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider font-mono">Out of Stock</p>
            <h3 className={`text-2xl font-extrabold mt-1 font-mono transition-colors ${outOfStockCount > 0 ? 'text-rose-400' : 'text-zinc-100'}`}>
              {outOfStockCount}
            </h3>
            <p className="text-zinc-455 text-[10px] mt-1 font-sans">Requires immediate restock</p>
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card bg-[#191715]/10 border border-[#2b2724] rounded-2xl p-6 lg:col-span-2 flex flex-col shadow-xl">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-[#c06c3c]" />
            <h2 className="text-lg font-bold text-zinc-150 font-sans">Stock Distribution by Category</h2>
          </div>
          <div className="h-[280px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#25211e" vertical={false} />
                <XAxis dataKey="name" stroke="#70655d" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                <YAxis stroke="#70655d" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#181615', borderColor: '#2b2724', borderRadius: '12px' }}
                  labelStyle={{ color: '#8c8278', fontWeight: 'bold', fontSize: 11 }}
                  itemStyle={{ color: '#faf8f5', fontSize: 12 }}
                />
                <Bar dataKey="units" radius={[6, 6, 0, 0]} barSize={32}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick alerts list */}
        <div className="glass-card bg-[#191715]/10 border border-[#2b2724] rounded-2xl p-6 flex flex-col shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-zinc-150 flex items-center gap-2 font-sans">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Stock Alerts</span>
            </h2>
            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/15 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
              {lowStockCount + outOfStockCount} Alerts
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[280px] pr-1">
            {alertsList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8 text-zinc-550 gap-2">
                <CheckCircle className="w-8 h-8 text-emerald-500/70" />
                <span className="text-sm font-semibold text-zinc-400">All Levels Secure</span>
                <span className="text-xs">No low or out-of-stock items detected.</span>
              </div>
            ) : (
              alertsList.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-900/60 hover:border-zinc-800 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-zinc-200 truncate">{item.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase tracking-wider truncate">{item.category}</p>
                  </div>
                  <div className="text-right ml-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      item.quantity === 0 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {item.quantity === 0 ? 'Out' : `${item.quantity} Left`}
                    </span>
                    <p className="text-[9px] font-mono text-zinc-500 mt-1">Min: {item.min_stock_level}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card bg-[#191715]/10 border border-[#2b2724] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-[#c06c3c]" />
          <h2 className="text-lg font-bold text-zinc-150 font-sans">Audit Trail (Recent Activity)</h2>
        </div>

        <div className="overflow-x-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-zinc-550 flex flex-col items-center gap-2">
              <Activity className="w-8 h-8 text-zinc-700" />
              <span className="text-sm font-semibold">No recent transactions recorded.</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#282421] text-zinc-500 text-[10px] font-bold uppercase tracking-widest pb-3">
                  <th className="pb-3 pl-2">Product</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3 text-right">Adjustment</th>
                  <th className="pb-3 pl-8">Reason</th>
                  <th className="pb-3 text-right pr-2">Logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#282421]/60 text-sm text-zinc-300">
                {transactions.map((tx: any) => {
                  const isAdd = tx.type === 'in';
                  return (
                    <tr key={tx.id} className="hover:bg-zinc-900/40 transition-colors group">
                      <td className="py-3.5 pl-2 max-w-[200px] truncate">
                        <span className="font-bold text-zinc-200">{tx.items?.name || 'Unknown Product'}</span>
                        <span className="block text-[10px] text-zinc-550 font-mono mt-0.5 uppercase tracking-wider truncate">{tx.items?.category}</span>
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isAdd 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/10'
                        }`}>
                          {isAdd ? (
                            <>
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                              <span>Restock</span>
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              <span>Released</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className={`py-3.5 text-right font-mono font-bold ${isAdd ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isAdd ? '+' : '-'}{tx.quantity}
                      </td>
                      <td className="py-3.5 pl-8 max-w-[220px] truncate text-zinc-400">
                        <span className="font-semibold text-xs text-zinc-350">{tx.reason || 'Manual entry'}</span>
                        {tx.notes && <span className="block text-[10px] text-zinc-500 font-mono mt-0.5 truncate">{tx.notes}</span>}
                      </td>
                      <td className="py-3.5 text-right pr-2 font-mono text-xs text-zinc-500 group-hover:text-zinc-450 transition-colors">
                        {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
