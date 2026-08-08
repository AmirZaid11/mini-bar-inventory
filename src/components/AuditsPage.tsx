import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';
import { 
  ClipboardList, 
  Play, 
  CheckSquare, 
  AlertCircle, 
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Search,
  Loader2
} from 'lucide-react';

interface Item {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
}

interface AuditRowState {
  itemId: string;
  expected: number;
  physical: string; // string type to support empty input field easily
}

export const AuditsPage: React.FC = () => {
  const db = useStore((state) => state.db);
  const queryClient = useQueryClient();

  // Active session flag
  const [sessionActive, setSessionActive] = useState(false);
  // Audit rows state
  const [auditRows, setAuditRows] = useState<AuditRowState[]>([]);
  // Search filter
  const [search, setSearch] = useState('');

  // Fetch Items
  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: () => db.getItems(),
  });

  // Start new stocktake
  const handleStartSession = () => {
    const initialRows = items.map(item => ({
      itemId: item.id,
      expected: item.quantity,
      physical: '' // blank by default
    }));
    setAuditRows(initialRows);
    setSessionActive(true);
    toast.info('Stocktake session started. Enter physical counts.');
  };

  // Update physical count input
  const handleCountChange = (itemId: string, value: string) => {
    setAuditRows(prev =>
      prev.map(row => (row.itemId === itemId ? { ...row, physical: value } : row))
    );
  };

  // Pre-fill all blank fields with expected quantity (shortcut helper)
  const handleFillExpected = () => {
    setAuditRows(prev =>
      prev.map(row => (row.physical === '' ? { ...row, physical: String(row.expected) } : row))
    );
    toast.success('Pre-filled remaining counts with expected quantities.');
  };

  // Clear all physical inputs
  const handleClearCounts = () => {
    setAuditRows(prev => prev.map(row => ({ ...row, physical: '' })));
    toast.info('Cleared entered counts.');
  };

  // Batch update stock audit mutation
  const submitAuditMutation = useMutation({
    mutationFn: async () => {
      // Find rows that have a physical count entered
      const auditedRows = auditRows.filter(r => r.physical !== '');
      if (auditedRows.length === 0) throw new Error('No physical counts entered.');

      const promises = auditedRows.map(async (row) => {
        const physicalVal = parseInt(row.physical);
        if (isNaN(physicalVal) || physicalVal < 0) {
          throw new Error(`Invalid count entered.`);
        }

        const discrepancy = physicalVal - row.expected;
        if (discrepancy !== 0) {
          const type = discrepancy > 0 ? 'in' : 'out';
          const absQty = Math.abs(discrepancy);
          const reason = 'Stock Correction';
          const notes = `Stocktake discrepancy adjusted (expected: ${row.expected}, found: ${physicalVal})`;

          // Perform adjustment
          await db.adjustStock(row.itemId, type, absQty, reason, notes);
        }
      });

      await Promise.all(promises);
      return auditedRows.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success(`Stocktake submitted successfully. Adjusted ${count} items.`);
      setSessionActive(false);
      setAuditRows([]);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error occurred during stocktake submission.');
    }
  });

  const handleSubmitAudit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCount = auditRows.filter(r => r.physical !== '').length;
    if (enteredCount === 0) {
      toast.error('You must enter a physical count for at least one item before submitting.');
      return;
    }

    if (confirm(`Submit stocktake? This will adjust inventory levels and log correction trails for ${enteredCount} products.`)) {
      submitAuditMutation.mutate();
    }
  };

  // Filtered view logic
  const filteredAuditRows = auditRows.filter(row => {
    const item = items.find(i => i.id === row.itemId);
    if (!item) return false;
    return item.name.toLowerCase().includes(search.toLowerCase()) || 
           item.category.toLowerCase().includes(search.toLowerCase());
  });

  // Session stats calculations
  const totalItems = items.length;
  const countedItemsCount = auditRows.filter(r => r.physical !== '').length;
  const pendingItemsCount = totalItems - countedItemsCount;
  const discrepanciesCount = auditRows.filter(r => {
    if (r.physical === '') return false;
    const phys = parseInt(r.physical);
    return !isNaN(phys) && phys !== r.expected;
  }).length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#c06c3c]" />
        <span>Loading warehouse items for audit...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#faf8f5] flex items-center gap-2 font-sans">
          <ClipboardList className="w-5.5 h-5.5 text-[#c06c3c]" />
          <span>Discrepancy Audits (Stocktake)</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Start physical audit sessions, record warehouse hand-counts, and let the system correct balances automatically.
        </p>
      </div>

      {/* --- INITIAL LANDING STATE --- */}
      {!sessionActive ? (
        <div className="p-10 glass-card rounded-2xl text-center space-y-6 max-w-2xl mx-auto border border-[#282421]">
          <div className="w-16 h-16 rounded-full bg-zinc-950/60 border border-[#2b2724] flex items-center justify-center mx-auto text-zinc-400">
            <ClipboardList className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-zinc-100">Ready to audit?</h3>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-md mx-auto">
              Starting a stocktake freezes a snapshot of your expected warehouse items. 
              Entering physical hand-counts will instantly update database levels and log discrepancy trails in the Audit Log.
            </p>
          </div>
          <button
            onClick={handleStartSession}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#c06c3c] hover:bg-[#a6562a] text-[#faf8f5] rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-sm"
          >
            <Play className="w-4 h-4" />
            <span>Start New Audit Session</span>
          </button>
        </div>
      ) : (
        /* --- ACTIVE SESSION STATE --- */
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 glass-card rounded-2xl border border-[#282421]">
            <div className="text-center md:border-r border-[#282421] py-2">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Total Catalog</p>
              <h4 className="text-lg font-extrabold mt-0.5">{totalItems} items</h4>
            </div>
            <div className="text-center md:border-r border-[#282421] py-2">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Audited (Counted)</p>
              <h4 className="text-lg font-extrabold text-emerald-500 mt-0.5">{countedItemsCount}</h4>
            </div>
            <div className="text-center md:border-r border-[#282421] py-2">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Pending (Uncounted)</p>
              <h4 className="text-lg font-extrabold text-zinc-400 mt-0.5">{pendingItemsCount}</h4>
            </div>
            <div className="text-center py-2">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Discrepancies</p>
              <h4 className={`text-lg font-extrabold mt-0.5 ${discrepanciesCount > 0 ? 'text-rose-400' : 'text-zinc-300'}`}>
                {discrepanciesCount} detected
              </h4>
            </div>
          </div>

          {/* Action buttons bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-zinc-950/40 border border-[#282421] rounded-2xl">
            {/* Quick search input */}
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search audit items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#181615] border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl pl-10 pr-4 py-2 text-zinc-200 placeholder-zinc-500 text-xs outline-none transition-all"
              />
            </div>

            {/* Session Utilities */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleFillExpected}
                className="text-xs px-3 py-2 bg-zinc-900 border border-[#2b2724] hover:border-zinc-800 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                Fill Rest with Expected
              </button>
              <button
                type="button"
                onClick={handleClearCounts}
                className="text-xs px-3 py-2 bg-zinc-900 border border-[#2b2724] hover:border-zinc-800 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                Clear Entered Counts
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Cancel stocktake session? Entered counts will be discarded.')) {
                    setSessionActive(false);
                    setAuditRows([]);
                  }
                }}
                className="text-xs px-3 py-2 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-950/40 text-rose-400 rounded-lg transition-colors cursor-pointer"
              >
                Cancel Session
              </button>
            </div>
          </div>

          {/* Audit Rows Form table */}
          <form onSubmit={handleSubmitAudit} className="glass-card rounded-2xl overflow-hidden border border-[#282421] p-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#282421] text-zinc-500 text-xs font-semibold uppercase tracking-wider pb-3">
                    <th className="py-3.5 pl-6">Product</th>
                    <th className="py-3.5">Category</th>
                    <th className="py-3.5 text-center">Expected Stock</th>
                    <th className="py-3.5 text-center">Physical Count</th>
                    <th className="py-3.5 text-center pr-6">Discrepancy Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40 text-sm text-zinc-300">
                  {filteredAuditRows.map((row) => {
                    const item = items.find(i => i.id === row.itemId)!;
                    const phys = parseInt(row.physical);
                    const discrepancy = !isNaN(phys) ? phys - row.expected : 0;
                    const isEntered = row.physical !== '';

                    return (
                      <tr key={row.itemId} className="hover:bg-zinc-900/10 transition-colors">
                        {/* Name */}
                        <td className="py-3.5 pl-6 font-semibold text-zinc-200">
                          {item.name}
                        </td>
                        {/* Category */}
                        <td className="py-3.5 text-zinc-400">
                          {item.category}
                        </td>
                        {/* Expected Stock */}
                        <td className="py-3.5 text-center font-mono font-bold text-zinc-300">
                          {row.expected} <span className="text-[10px] font-normal text-zinc-500 uppercase">{item.unit || 'pcs'}</span>
                        </td>
                        {/* Physical Count Input */}
                        <td className="py-3.5 text-center">
                          <div className="inline-flex items-center gap-1.5 justify-center">
                            <input
                              type="number"
                              min="0"
                              placeholder="Uncounted"
                              value={row.physical}
                              onChange={(e) => handleCountChange(row.itemId, e.target.value)}
                              className="w-24 bg-[#181615] border border-[#2b2724] focus:border-[#c06c3c] outline-none rounded-lg px-2.5 py-1 text-center font-mono text-xs text-zinc-100"
                            />
                            <span className="text-[10px] text-zinc-500 uppercase font-mono">{item.unit || 'pcs'}</span>
                          </div>
                        </td>
                        {/* Discrepancy Status Badge */}
                        <td className="py-3.5 text-center pr-6">
                          {!isEntered ? (
                            <span className="inline-flex text-[10px] text-zinc-500 font-mono italic">Pending Count</span>
                          ) : discrepancy === 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/10">
                              <CheckSquare className="w-3.5 h-3.5" />
                              <span>Match</span>
                            </span>
                          ) : (
                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                              discrepancy > 0 
                                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10' 
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/10'
                            }`}>
                              {discrepancy > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                              <span>{discrepancy > 0 ? `+${discrepancy}` : discrepancy} units</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Form actions footer */}
            <div className="p-4 border-t border-[#282421] bg-zinc-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <AlertCircle className="w-4 h-4 text-[#c06c3c]" />
                <span>Auditing {countedItemsCount} / {totalItems} items. Uncounted items will remain unchanged.</span>
              </div>
              <button
                type="submit"
                disabled={countedItemsCount === 0 || submitAuditMutation.isPending}
                className="px-6 py-2.5 bg-[#c06c3c] hover:bg-[#a6562a] text-[#faf8f5] font-bold rounded-xl text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              >
                {submitAuditMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Audit...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    <span>Submit Audit Session ({countedItemsCount} items)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
