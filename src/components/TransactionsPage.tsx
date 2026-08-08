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
  Loader2
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

  // Filter calculations
  const filteredTx = transactions.filter(tx => {
    const itemName = tx.items?.name || '';
    const itemCategory = tx.items?.category || '';
    
    const matchesSearch = itemName.toLowerCase().includes(search.toLowerCase()) || 
                          itemCategory.toLowerCase().includes(search.toLowerCase()) ||
                          (tx.notes || '').toLowerCase().includes(search.toLowerCase());
                          
    const matchesType = typeFilter === '' || tx.type === typeFilter;
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

    return matchesSearch && matchesType && matchesReason && matchesDate;
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
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#faf8f5] flex items-center gap-2 font-sans">
            <History className="w-5.5 h-5.5 text-[#c06c3c]" />
            <span>Audit Trail</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Historical log of additions, beach bar releases, and warehouse adjustments.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={filteredTx.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 border border-[#2b2724] hover:border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span>Export History CSV</span>
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="space-y-4 p-4 glass-card rounded-2xl">
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
              className="w-full bg-[#181615] border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl pl-10 pr-4 py-2.5 text-zinc-200 placeholder-zinc-500 text-sm outline-none transition-all"
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
              <option value="">All Movement Types</option>
              <option value="in">Restock (In)</option>
              <option value="out">Deduction (Out)</option>
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
              <option value="">All Reason Codes</option>
              {reasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end text-zinc-500 text-xs font-mono pr-2">
            Logs Found: {filteredTx.length} / {transactions.length}
          </div>
        </div>

        {/* Date Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-3 border-t border-[#282421]">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider min-w-[70px]">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#181615] border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-3 py-2 text-zinc-300 text-xs outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider min-w-[70px]">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#181615] border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-3 py-2 text-zinc-300 text-xs outline-none transition-all"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-xs text-[#c06c3c] hover:text-[#a6562a] underline cursor-pointer"
              >
                Clear Date Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Log list / Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-[#282421]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#c06c3c]" />
            <span className="text-sm font-medium">Extracting transactional history...</span>
          </div>
        ) : filteredTx.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <span className="text-sm font-semibold">No transactions match the selected criteria.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#282421] text-zinc-500 text-xs font-semibold uppercase tracking-wider pb-3">
                  <th className="py-3.5 pl-6">Product</th>
                  <th className="py-3.5">Category</th>
                  <th className="py-3.5">Type</th>
                  <th className="py-3.5 text-center">Adjustment</th>
                  <th className="py-3.5">Reason Code</th>
                  <th className="py-3.5 pl-4">Details / Notes</th>
                  <th className="py-3.5 text-right pr-6">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/40 text-sm text-zinc-300">
                {filteredTx.map((tx) => {
                  const isAdd = tx.type === 'in';
                  return (
                    <tr key={tx.id} className="hover:bg-zinc-900/20 transition-colors">
                      {/* Product Name */}
                      <td className="py-3.5 pl-6 font-semibold text-zinc-200">
                        {tx.items?.name || 'Deleted Product'}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 text-zinc-400">
                        {tx.items?.category || 'N/A'}
                      </td>

                      {/* Movement Type */}
                      <td className="py-3.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          isAdd 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
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
                        <span className="bg-[#181615] px-2 py-1 rounded-md text-xs border border-[#2b2724] text-zinc-300 font-medium">
                          {tx.reason || 'Manual Adjustment'}
                        </span>
                      </td>

                      {/* Notes */}
                      <td className="py-3.5 pl-4 text-zinc-500 max-w-[200px] truncate" title={tx.notes}>
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
