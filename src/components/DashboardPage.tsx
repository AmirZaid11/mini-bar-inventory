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
  Loader2
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        <span className="text-sm font-medium">Assembling live metrics...</span>
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

  const colors = ['#818cf8', '#6366f1', '#4f46e5', '#4338ca', '#3730a3'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Bar Overview</h1>
          <p className="text-zinc-400 text-sm mt-1">Real-time status updates and critical stock levels.</p>
        </div>
        <button
          onClick={() => setActiveTab('inventory')}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-300 hover:text-white font-medium text-sm transition-all duration-200 cursor-pointer shadow-sm"
        >
          <span>Access Inventory Manager</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Items */}
        <div className="glass-card rounded-2xl p-6 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total Products</p>
            <h3 className="text-2xl font-extrabold text-zinc-100 mt-1">{totalItems}</h3>
            <p className="text-zinc-400 text-xs mt-1">Unique catalog references</p>
          </div>
        </div>

        {/* Total Stock Units */}
        <div className="glass-card rounded-2xl p-6 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total Stock Units</p>
            <h3 className="text-2xl font-extrabold text-zinc-100 mt-1">{totalUnits}</h3>
            <p className="text-zinc-400 text-xs mt-1">Total combined quantities</p>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="glass-card rounded-2xl p-6 flex items-start gap-4">
          <div className={`p-3 rounded-xl border text-amber-400 ${lowStockCount > 0 ? 'bg-amber-500/10 border-amber-500/20 animate-pulse' : 'bg-zinc-800/40 border-zinc-700/50'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Low Stock</p>
            <h3 className={`text-2xl font-extrabold mt-1 ${lowStockCount > 0 ? 'text-amber-400' : 'text-zinc-100'}`}>
              {lowStockCount}
            </h3>
            <p className="text-zinc-400 text-xs mt-1">Below critical threshold</p>
          </div>
        </div>

        {/* Out of Stock Items */}
        <div className="glass-card rounded-2xl p-6 flex items-start gap-4">
          <div className={`p-3 rounded-xl border text-rose-400 ${outOfStockCount > 0 ? 'bg-rose-500/10 border-rose-500/20 animate-pulse' : 'bg-zinc-800/40 border-zinc-700/50'}`}>
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Out of Stock</p>
            <h3 className={`text-2xl font-extrabold mt-1 ${outOfStockCount > 0 ? 'text-rose-400' : 'text-zinc-100'}`}>
              {outOfStockCount}
            </h3>
            <p className="text-zinc-400 text-xs mt-1">Requires immediate restocking</p>
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6 lg:col-span-2 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-zinc-100">Stock Distribution by Category</h2>
          </div>
          <div className="h-[280px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                  labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                  itemStyle={{ color: '#f4f4f5' }}
                />
                <Bar dataKey="units" radius={[4, 4, 0, 0]} barSize={35}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick alerts list */}
        <div className="glass-card rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Stock Alerts</span>
            </h2>
            <span className="text-zinc-500 font-mono text-xs">{lowStockCount + outOfStockCount} items</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[280px] pr-1">
            {alertsList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8 text-zinc-500">
                <span className="text-sm font-semibold text-zinc-400">All Levels Secure</span>
                <span className="text-xs mt-1">No low or out-of-stock items detected.</span>
              </div>
            ) : (
              alertsList.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/40 hover:border-zinc-700/60 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-200 truncate">{item.name}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{item.category}</p>
                  </div>
                  <div className="text-right ml-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.quantity === 0 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {item.quantity === 0 ? 'Out' : `${item.quantity} Left`}
                    </span>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Min: {item.min_stock_level}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-zinc-100">Audit Trail (Recent Activity)</h2>
        </div>

        <div className="overflow-x-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-zinc-500">
              <span className="text-sm font-medium">No recent transactions recorded.</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs font-semibold uppercase tracking-wider pb-3">
                  <th className="pb-3 pl-2">Product</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3 text-right">Adjustment</th>
                  <th className="pb-3 pl-8">Reason</th>
                  <th className="pb-3 text-right pr-2">Logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60 text-sm text-zinc-300">
                {transactions.map((tx: any) => {
                  const isAdd = tx.type === 'in';
                  return (
                    <tr key={tx.id} className="hover:bg-zinc-900/40 transition-colors group">
                      <td className="py-3 pl-2 max-w-[200px] truncate">
                        <span className="font-semibold text-zinc-200">{tx.items?.name || 'Unknown Product'}</span>
                        <span className="block text-[11px] text-zinc-500 truncate">{tx.items?.category}</span>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          isAdd 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
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
                      <td className={`py-3 text-right font-mono font-bold ${isAdd ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isAdd ? '+' : '-'}{tx.quantity}
                      </td>
                      <td className="py-3 pl-8 max-w-[220px] truncate text-zinc-400">
                        <span className="capitalize">{tx.reason || 'Manual entry'}</span>
                        {tx.notes && <span className="block text-[11px] text-zinc-600 truncate">{tx.notes}</span>}
                      </td>
                      <td className="py-3 text-right pr-2 font-mono text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
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
