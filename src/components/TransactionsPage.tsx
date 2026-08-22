import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '../store/useStore';
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'sonner';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Calendar,
  History,
  Download,
  Loader2,
  Tag
} from 'lucide-react';

interface Transaction {
  id: string;
  item_id: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  notes: string;
  created_at: string;
  items: {
    name: string;
    category: string;
  } | null;
}

export const TransactionsPage: React.FC = () => {
  const db = useStore((state) => state.db);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch Transactions
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions-full'],
    queryFn: () => db.getTransactions(),
  });

  // Extract unique reason codes for filter dropdown
  const reasons = Array.from(new Set(transactions.map(t => t.reason))).filter(Boolean);

  // Extract unique categories for filter dropdown
  const categories = Array.from(new Set(transactions.map(t => t.items?.category).filter(Boolean)));

  // Filter calculations
  const filteredTx = transactions.filter(tx => {
    const itemName = tx.items?.name || '';
    const itemCategory = tx.items?.category || '';
    
    const matchesSearch = itemName.toLowerCase().includes(search.toLowerCase()) || 
                          itemCategory.toLowerCase().includes(search.toLowerCase()) ||
                          (tx.notes || '').toLowerCase().includes(search.toLowerCase());
                          
    const matchesType = typeFilter === '' || tx.type === typeFilter;
    const matchesCategory = categoryFilter === '' || itemCategory === categoryFilter;
    const matchesReason = reasonFilter === '' || tx.reason === reasonFilter;

    // Date range filter
    let matchesDate = true;
    const txDate = new Date(tx.created_at);
    if (startDate) {
      matchesDate = matchesDate && (isAfter(txDate, startOfDay(new Date(startDate))) || txDate.getTime() >= startOfDay(new Date(startDate)).getTime());
    }
    if (endDate) {
      matchesDate = matchesDate && (isBefore(txDate, endOfDay(new Date(endDate))) || txDate.getTime() <= endOfDay(new Date(endDate)).getTime());
    }

    return matchesSearch && matchesType && matchesCategory && matchesReason && matchesDate;
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredTx.length === 0) {
      toast.warning('No transactions found to export.');
      return;
    }

    const headers = ['Timestamp', 'Product Name', 'Category', 'Movement', 'Quantity', 'Reason', 'Notes'];
    const rows = filteredTx.map(tx => [
      format(new Date(tx.created_at), 'yyyy-MM-dd HH:mm:ss'),
      tx.items?.name || 'Deleted Product',
      tx.items?.category || 'N/A',
      tx.type.toUpperCase(),
      tx.quantity,
      tx.reason || '',
      tx.notes || ''
    ].map(val => {
      const stringVal = String(val).replace(/"/g, '""');
      return `"${stringVal}"`;
    }).join(','));

    const csvString = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `warehouse_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Transactions CSV Export downloaded.');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100 font-sans flex items-center gap-2">
            <History className="w-7 h-7 text-[#c06c3c]" />
            <span>Audit <span className="text-[#c06c3c]">Trail</span></span>
          </h1>
          <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mt-1">
            Historical movements log • Restocks & releases
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={filteredTx.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 border border-[#2b2724] hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export History CSV</span>
        </button>
      </div>

      {/* Advanced Filters Panel */}
      <div className="space-y-4 p-5 glass-card bg-[#191715]/15 border border-[#2b2724] rounded-2xl shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search items, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950/80 border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl pl-10 pr-4 py-2.5 text-zinc-200 placeholder-zinc-500 text-sm outline-none transition-all"
            />
          </div>

          {/* Movement Type */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-500"><Filter className="w-4 h-4" /></span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-[#181615] border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-3 py-2.5 text-zinc-300 text-sm outline-none cursor-pointer transition-all"
            >
              <option value="">All Movements</option>
              <option value="in">Restock (In)</option>
              <option value="out">Deduction (Out)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-500"><Tag className="w-4 h-4" /></span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#181615] border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-3 py-2.5 text-zinc-300 text-sm outline-none cursor-pointer transition-all"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Reason Filter */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-500"><Calendar className="w-4 h-4" /></span>
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="w-full bg-[#181615] border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-3 py-2.5 text-zinc-300 text-sm outline-none cursor-pointer transition-all"
            >
              <option value="">All Reasons</option>
              {reasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-[#2b2724]">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider min-w-[50px] font-mono">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-zinc-950 border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-3 py-2 text-zinc-300 text-xs outline-none transition-all cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider min-w-[50px] font-mono">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-zinc-950 border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-3 py-2 text-zinc-300 text-xs outline-none transition-all cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4">
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-xs text-[#c06c3c] hover:text-[#a6562a] underline cursor-pointer font-bold"
              >
                Clear Date range
              </button>
            )}
            <div className="text-zinc-500 text-[10px] font-mono pl-2">
              Audits loaded: {filteredTx.length} / {transactions.length}
            </div>
          </div>
        </div>
      </div>

      {/* Log list / Table */}
      <div className="glass-card bg-[#191715]/10 border border-[#2b2724] rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-550 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#c06c3c]" />
            <span className="text-sm font-semibold tracking-wider font-mono">Extracting audit trail history...</span>
          </div>
        ) : filteredTx.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 flex flex-col items-center gap-3">
            <History className="w-8 h-8 text-zinc-650" />
            <span className="text-sm font-semibold">No movements recorded under selected parameters.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2b2724] text-zinc-500 text-[10px] font-bold uppercase tracking-widest pb-3">
                  <th className="py-4 pl-6">Product</th>
                  <th className="py-4">Category</th>
                  <th className="py-4">Type</th>
                  <th className="py-4 text-center">Adjustment</th>
                  <th className="py-4">Reason Code</th>
                  <th className="py-4 pl-4">Details / Notes</th>
                  <th className="py-4 text-right pr-6">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2b2724]/60 text-sm text-zinc-300">
                {filteredTx.map((tx) => {
                  const isAdd = tx.type === 'in';
                  return (
                    <tr key={tx.id} className="hover:bg-zinc-900/30 transition-colors">
                      {/* Product Name */}
                      <td className="py-3.5 pl-6 font-bold text-zinc-200">
                        {tx.items?.name || <span className="text-zinc-600 font-normal italic">Deleted Product</span>}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 text-zinc-450 font-medium">
                        {tx.items?.category || 'N/A'}
                      </td>

                      {/* Movement Type */}
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isAdd 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/10'
                        }`}>
                          {isAdd ? (
                            <>
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                              <span>IN</span>
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              <span>OUT</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Quantity */}
                      <td className={`py-3.5 text-center font-mono font-bold ${isAdd ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isAdd ? '+' : '-'}{tx.quantity}
                      </td>

                      {/* Reason */}
                      <td className="py-3.5">
                        <span className="bg-[#181615] px-2.5 py-1 rounded-lg text-xs border border-[#2b2724] text-zinc-300 font-semibold shadow-sm">
                          {tx.reason || 'Manual Adjustment'}
                        </span>
                      </td>

                      {/* Notes */}
                      <td className="py-3.5 pl-4 text-zinc-500 max-w-[200px] truncate font-mono text-[11px]" title={tx.notes}>
                        {tx.notes || '—'}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 text-right pr-6 font-mono text-zinc-500 text-xs">
                        {format(new Date(tx.created_at), 'yyyy-MM-dd HH:mm:ss')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
