import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Check, 
  Plus, 
  Trash2, 
  ListChecks, 
  Loader2 
} from 'lucide-react';

interface Item {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
}

interface BulkItemAdjustment {
  item: Item;
  quantity: string;
}

export const BulkAdjustPage: React.FC = () => {
  const db = useStore((state) => state.db);
  const queryClient = useQueryClient();

  // Selected products for batch adjustments
  const [selectedItems, setSelectedItems] = useState<BulkItemAdjustment[]>([]);

  // Adjustment config
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [adjustReason, setAdjustReason] = useState('Purchase Addition');
  const [adjustNotes, setAdjustNotes] = useState('');

  // Dropdown select state for adding product to the batch
  const [productToAddId, setProductToAddId] = useState('');

  // Fetch Items
  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: () => db.getItems(),
  });

  // Filter out items already added to the batch list
  const availableItems = items.filter(
    item => !selectedItems.some(adj => adj.item.id === item.id)
  );

  // Handle adding an item to the list
  const handleAddItem = () => {
    if (!productToAddId) return;
    const foundItem = items.find(i => i.id === productToAddId);
    if (foundItem) {
      setSelectedItems([...selectedItems, { item: foundItem, quantity: '' }]);
      setProductToAddId('');
    }
  };

  // Remove item from adjust list
  const handleRemoveItem = (id: string) => {
    setSelectedItems(selectedItems.filter(adj => adj.item.id !== id));
  };

  // Update quantity for a specific item in the list
  const handleQtyChange = (id: string, qty: string) => {
    setSelectedItems(
      selectedItems.map(adj => 
        adj.item.id === id ? { ...adj, quantity: qty } : adj
      )
    );
  };

  // Execute batch adjustments mutation
  const executeBatchMutation = useMutation({
    mutationFn: async () => {
      if (selectedItems.length === 0) throw new Error('No items in batch adjustment list.');

      // Process adjustments sequentially or in parallel
      const promises = selectedItems.map(adj => {
        const qty = parseInt(adj.quantity);
        if (isNaN(qty) || qty <= 0) {
          throw new Error(`Please enter a valid quantity for ${adj.item.name}.`);
        }
        return db.adjustStock(
          adj.item.id,
          adjustType,
          qty,
          adjustReason,
          adjustNotes
        );
      });

      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success(`Successfully batch adjusted ${selectedItems.length} items.`);
      setSelectedItems([]);
      setAdjustNotes('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error occurred during batch adjustment.');
    }
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      toast.error('Please add at least one product to the list.');
      return;
    }
    
    // Check if any quantity is empty or invalid
    const invalidQty = selectedItems.find(adj => {
      const qty = parseInt(adj.quantity);
      return isNaN(qty) || qty <= 0;
    });
    if (invalidQty) {
      toast.error(`Please enter a valid quantity greater than 0 for ${invalidQty.item.name}.`);
      return;
    }

    // Validate stock levels if type is 'out' (cannot go below 0)
    if (adjustType === 'out') {
      const invalid = selectedItems.find(adj => {
        const qty = parseInt(adj.quantity) || 0;
        return adj.item.quantity < qty;
      });
      if (invalid) {
        toast.error(`Invalid deduction: ${invalid.item.name} has only ${invalid.item.quantity} units available.`);
        return;
      }
    }

    executeBatchMutation.mutate();
  };

  // Update default reason code when adjustment type toggles
  const handleTypeChange = (type: 'in' | 'out') => {
    setAdjustType(type);
    setAdjustReason(type === 'in' ? 'Purchase Addition' : 'Drawn to Beach Bar');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2 font-sans">
          <ListChecks className="w-5.5 h-5.5 text-[#c06c3c]" />
          <span>Bulk Adjustment Panel</span>
        </h1>
        <p className="text-zinc-450 text-sm mt-1">
          Perform batch restocking additions or beach bar release drawings in a single operation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Select details */}
        <form onSubmit={handleApply} className="lg:col-span-2 space-y-4 p-6 glass-card rounded-2xl">
          <h2 className="text-base font-bold text-zinc-200">1. Select Movement Type & Reason</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Movement Type select */}
            <div>
              <label className="block text-zinc-450 text-xs font-semibold uppercase tracking-wider mb-1.5">Adjustment Type</label>
              <div className="flex bg-zinc-900/60 border border-zinc-800 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => handleTypeChange('in')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    adjustType === 'in'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                      : 'text-zinc-550 hover:text-zinc-350'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Addition (In)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('out')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    adjustType === 'out'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                      : 'text-zinc-550 hover:text-zinc-350'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Release (Out)</span>
                </button>
              </div>
            </div>

            {/* Reason selection */}
            <div>
              <label className="block text-zinc-450 text-xs font-semibold uppercase tracking-wider mb-1.5">Reason Code</label>
              {adjustType === 'in' ? (
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-4 py-2.5 text-zinc-200 text-sm outline-none cursor-pointer"
                >
                  <option value="Purchase Addition">Purchase Addition</option>
                  <option value="Exchange">Exchange</option>
                  <option value="Received from Beach Bar">Received from Beach Bar</option>
                  <option value="Stock Correction">Stock Correction</option>
                  <option value="Other Addition">Other Addition</option>
                </select>
              ) : (
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-4 py-2.5 text-zinc-200 text-sm outline-none cursor-pointer"
                >
                  <option value="Drawn to Beach Bar">Drawn to Beach Bar</option>
                  <option value="Expired">Expired</option>
                  <option value="Broken / Spoilt">Broken / Spoilt</option>
                  <option value="Stock Correction">Stock Correction</option>
                  <option value="Other Release">Other Release</option>
                </select>
              )}
            </div>
          </div>

          <div>
            <label className="block text-zinc-450 text-xs font-semibold uppercase tracking-wider mb-1.5">Action Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Received container 4, beach bar restocking batch..."
              value={adjustNotes}
              onChange={(e) => setAdjustNotes(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-4 py-2.5 text-zinc-200 text-sm outline-none"
            />
          </div>

          {/* Adjust Items list */}
          <div className="pt-4 border-t border-zinc-800">
            <h2 className="text-base font-bold text-zinc-200 mb-3">2. Selected Batch Products</h2>
            
            {selectedItems.length === 0 ? (
              <div className="text-center py-8 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs">
                No items added to this adjustment batch. Add products from the right panel.
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {selectedItems.map((adj) => (
                  <div key={adj.item.id} className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-zinc-200 truncate">{adj.item.name}</p>
                      <p className="text-[10px] text-zinc-500 truncate">Current: {adj.item.quantity} {adj.item.unit}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 ml-4">
                      {/* Qty Input */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-zinc-550 uppercase font-mono mr-1">Qty:</span>
                        <input
                          type="number"
                          min="1"
                          required
                          placeholder="Qty"
                          value={adj.quantity}
                          onChange={(e) => handleQtyChange(adj.item.id, e.target.value)}
                          className="w-16 bg-zinc-900/40 border border-zinc-800 rounded px-2 py-1 text-center font-mono text-xs text-zinc-100 focus:border-[#c06c3c] outline-none"
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(adj.item.id)}
                        className="p-1 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end">
            <button
              type="submit"
              disabled={selectedItems.length === 0 || executeBatchMutation.isPending}
              className="px-6 py-2.5 bg-[#c06c3c] hover:bg-[#a6562a] text-[#faf8f5] font-bold rounded-xl text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            >
              {executeBatchMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Applying Batch...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Apply Bulk Adjustment ({selectedItems.length})</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right side panel: Product Catalog selector */}
        <div className="glass-card rounded-2xl p-5 flex flex-col h-[520px]">
          <h2 className="text-sm font-bold text-zinc-200 mb-3">Add Product to Batch</h2>
          
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-zinc-500 text-xs">
              Loading catalog...
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 space-y-4">
              {/* Select search block */}
              <div className="flex gap-2">
                <select
                  value={productToAddId}
                  onChange={(e) => setProductToAddId(e.target.value)}
                  className="flex-1 bg-zinc-900/60 border border-zinc-800 focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-3 py-2.5 text-zinc-300 text-xs outline-none cursor-pointer transition-all"
                >
                  <option value="">Select a product...</option>
                  {availableItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.quantity} {item.unit})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!productToAddId}
                  className="px-3 bg-[#c06c3c] hover:bg-[#a6562a] text-[#faf8f5] rounded-xl flex items-center justify-center cursor-pointer transition-all disabled:opacity-40"
                >
                  <Plus className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* List of items that are available to quickly click and add */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 border-t border-zinc-800 pt-3">
                <p className="text-[10px] text-zinc-550 uppercase tracking-wider font-semibold mb-2">Quick Add Catalog</p>
                {availableItems.length === 0 ? (
                  <p className="text-center py-6 text-zinc-655 text-xs">No remaining products.</p>
                ) : (
                  availableItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItems([...selectedItems, { item, quantity: '' }])}
                      className="w-full text-left p-2.5 bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800 hover:border-[#c06c3c]/30 rounded-lg text-xs flex justify-between items-center transition-all cursor-pointer group"
                    >
                      <span className="text-zinc-300 group-hover:text-zinc-200 truncate pr-2 font-medium">{item.name}</span>
                      <span className="text-[10px] font-mono text-zinc-550 bg-zinc-900/60 px-2 py-0.5 rounded border border-zinc-800 shrink-0 font-bold">
                        {item.quantity} {item.unit}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
