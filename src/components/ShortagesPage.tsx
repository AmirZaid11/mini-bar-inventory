import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '../store/useStore';
import { Printer, AlertTriangle, CheckCircle, Package, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Item {
  id: string;
  name: string;
  category: string;
  quantity: number;
  min_stock_level: number;
  unit: string;
  notes: string;
}

export const ShortagesPage: React.FC = () => {
  const db = useStore((state) => state.db);

  // Fetch Items
  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: () => db.getItems(),
  });

  // Shortage calculation: items where quantity <= min_stock_level
  const shortages = items.filter(item => item.quantity <= item.min_stock_level);
  const outOfStock = shortages.filter(item => item.quantity === 0);
  const lowStock = shortages.filter(item => item.quantity > 0);

  const handlePrint = () => {
    window.print();
    toast.success('Purchase checklist sent to printer.');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Printable Header */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#faf8f5] flex items-center gap-2 font-sans">
            <AlertTriangle className="w-5.5 h-5.5 text-[#c06c3c]" />
            <span>Shortages & Restock List</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Shortage checklist of all products currently below warning levels.
          </p>
        </div>
        <button
          onClick={handlePrint}
          disabled={shortages.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#c06c3c] hover:bg-[#a6562a] text-[#faf8f5] rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Printer className="w-4 h-4" />
          <span>Print Purchase Sheet</span>
        </button>
      </div>

      {/* Screen Summary Cards (Hidden during Print) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 print:hidden">
        <div className="glass-card rounded-2xl p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-400">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total Shortages</p>
            <h3 className="text-xl font-extrabold text-zinc-100 mt-1">{shortages.length}</h3>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Out of Stock</p>
            <h3 className="text-xl font-extrabold text-rose-400 mt-1">{outOfStock.length}</h3>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-900 text-amber-400">
            <ArrowDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Low Stock Warning</p>
            <h3 className="text-xl font-extrabold text-amber-400 mt-1">{lowStock.length}</h3>
          </div>
        </div>
      </div>

      {/* PRINT-ONLY HEADER BLOCK */}
      <div className="hidden print:block text-black space-y-2 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Amir Warehouse - Shortage Purchase Checklist</h1>
        <p className="text-sm text-gray-600">Generated on {format(new Date(), 'yyyy-MM-dd HH:mm')}</p>
        <div className="border-b-2 border-black w-full my-4"></div>
      </div>

      {/* Shortage List Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-[#282421] print:bg-white print:border-collapse print:border-black print:text-black">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-zinc-500">
            <span>Checking catalog stock...</span>
          </div>
        ) : shortages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
            <h3 className="text-sm font-semibold text-zinc-300">Warehouse Stock Secure</h3>
            <p className="text-xs text-zinc-500">All items are currently above their warning limits.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse print:table print:w-full">
            <thead>
              <tr className="border-b border-[#282421] print:border-black text-zinc-500 print:text-black text-xs font-semibold uppercase tracking-wider pb-3">
                <th className="py-3.5 pl-6">Product</th>
                <th className="py-3.5">Category</th>
                <th className="py-3.5 text-center">In Stock</th>
                <th className="py-3.5 text-center">Alert Limit</th>
                <th className="py-3.5 text-center">Shortage Quantity</th>
                <th className="py-3.5 pl-4 pr-6 print:table-cell hidden print:block">Order Notes / Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/40 print:divide-black text-sm text-zinc-300 print:text-black">
              {shortages.map((item) => {
                const isOut = item.quantity === 0;
                const deficit = item.min_stock_level - item.quantity;
                return (
                  <tr key={item.id} className="hover:bg-zinc-900/10 print:hover:bg-transparent">
                    <td className="py-3.5 pl-6 font-semibold">
                      {item.name}
                    </td>
                    <td className="py-3.5 text-zinc-400 print:text-black">
                      {item.category}
                    </td>
                    <td className="py-3.5 text-center font-mono font-bold">
                      <span className={isOut ? 'text-rose-400 print:text-black font-extrabold' : 'text-amber-400 print:text-black'}>
                        {item.quantity}
                      </span>{' '}
                      <span className="text-[11px] font-normal text-zinc-500 print:text-black uppercase">{item.unit || 'pcs'}</span>
                    </td>
                    <td className="py-3.5 text-center font-mono text-zinc-400 print:text-black">
                      {item.min_stock_level}
                    </td>
                    <td className="py-3.5 text-center font-mono font-bold text-rose-400 print:text-black">
                      {deficit > 0 ? `-${deficit}` : 'Out'}
                    </td>
                    <td className="py-3.5 pl-4 pr-6 print:table-cell hidden print:block border-l border-gray-200">
                      <div className="h-6 w-full border-b border-gray-300"></div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* CSS Rule for Clean Print Layout */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          /* Hide sidebar, headers, scrollbars, wrappers */
          aside, header, .print\\:hidden {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          .glass-card {
            border: 1px solid black !important;
            background: white !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};
