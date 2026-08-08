import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Download, 
  Edit2, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  X, 
  Settings,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2
} from 'lucide-react';

interface Item {
  id: string;
  name: string;
  category: string;
  quantity: number;
  min_stock_level: number;
  unit: string;
  notes: string;
  is_active: boolean;
  created_at: string;
}

export const InventoryPage: React.FC = () => {
  const db = useStore((state) => state.db);
  const queryClient = useQueryClient();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  
  // Selected items for edit / adjust
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Soft Drinks & Juices');
  const [formMinStock, setFormMinStock] = useState(5);
  const [formUnit, setFormUnit] = useState('pcs');
  const [formNotes, setFormNotes] = useState('');
  const [formQuantity, setFormQuantity] = useState(0); // only for adding new item

  // Stock Adjustment Form states
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [adjustQuantity, setAdjustQuantity] = useState(1);
  const [adjustReason, setAdjustReason] = useState('Purchase Addition');
  const [adjustNotes, setAdjustNotes] = useState('');

  // Fetch Items
  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: () => db.getItems(),
  });

  // Extract unique categories for filter list
  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  // Mutations
  const addItemMutation = useMutation({
    mutationFn: (newItem: Omit<Item, 'id' | 'created_at'>) => db.createItem(newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Successfully added product.');
      setShowAddModal(false);
      resetAddForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error inserting item. Make sure name is unique.');
    }
  });

  const editItemMutation = useMutation({
    mutationFn: (updatedFields: Partial<Item>) => {
      if (!selectedItem) throw new Error('No item selected');
      return db.updateItem(selectedItem.id, updatedFields);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Product details updated.');
      setShowEditModal(false);
      setSelectedItem(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update item details.');
    }
  });

  const adjustStockMutation = useMutation({
    mutationFn: () => {
      if (!selectedItem) throw new Error('No item selected');
      return db.adjustStock(selectedItem.id, adjustType, adjustQuantity, adjustReason, adjustNotes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Stock adjusted and audit logged.');
      setShowAdjustModal(false);
      setSelectedItem(null);
      resetAdjustForm();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to adjust stock levels.');
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => db.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Product soft deleted from inventory.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete item.');
    }
  });

  const resetAllMutation = useMutation({
    mutationFn: () => db.resetAllInventoryToZero(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-full'] });
      toast.success('Inventory cleared! All stock levels set to 0 and logs emptied.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reset inventory.');
    }
  });

  const handleResetAll = () => {
    if (confirm('Are you absolutely sure you want to clear all audit logs and reset ALL products stock levels to 0? This action cannot be undone.')) {
      resetAllMutation.mutate();
    }
  };

  // Form Resets
  const resetAddForm = () => {
    setFormName('');
    setFormCategory('Soft Drinks & Juices');
    setFormMinStock(5);
    setFormUnit('pcs');
    setFormNotes('');
    setFormQuantity(0);
  };

  const resetAdjustForm = () => {
    setAdjustType('in');
    setAdjustQuantity(1);
    setAdjustReason('Purchase Addition');
    setAdjustNotes('');
  };

  // Trigger Edit Modal
  const handleOpenEdit = (item: Item) => {
    setSelectedItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormMinStock(item.min_stock_level);
    setFormUnit(item.unit || 'pcs');
    setFormNotes(item.notes || '');
    setShowEditModal(true);
  };

  // Trigger Adjust Stock Modal
  const handleOpenAdjust = (item: Item, type: 'in' | 'out') => {
    setSelectedItem(item);
    setAdjustType(type);
    setAdjustReason(type === 'in' ? 'Purchase Addition' : 'Drawn to Beach Bar');
    setShowAdjustModal(true);
  };

  // Trigger Soft Delete
  const handleDelete = (item: Item) => {
    if (confirm(`Are you sure you want to delete ${item.name} from the catalog?`)) {
      deleteItemMutation.mutate(item.id);
    }
  };

  // Filter Logic
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          (item.category || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === '' || item.category === categoryFilter;
    
    let matchesStatus = true;
    if (statusFilter !== '') {
      if (statusFilter === 'out') {
        matchesStatus = item.quantity === 0;
      } else if (statusFilter === 'low') {
        matchesStatus = item.quantity > 0 && item.quantity <= item.min_stock_level;
      } else if (statusFilter === 'instock') {
        matchesStatus = item.quantity > item.min_stock_level;
      }
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredItems.length === 0) {
      toast.warning('No items to export.');
      return;
    }

    const headers = ['Name', 'Category', 'Quantity', 'Unit', 'Min Stock Level', 'Status', 'Notes'];
    const rows = filteredItems.map(item => {
      let status = 'In Stock';
      if (item.quantity === 0) status = 'Out of Stock';
      else if (item.quantity <= item.min_stock_level) status = 'Low Stock';
      
      return [
        item.name,
        item.category || '',
        item.quantity,
        item.unit || 'pcs',
        item.min_stock_level,
        status,
        item.notes || ''
      ].map(val => {
        const stringVal = String(val).replace(/"/g, '""');
        return `"${stringVal}"`;
      }).join(',');
    });

    const csvString = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `amir_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Export downloaded successfully.');
  };

  const getStatusBadge = (quantity: number, minStock: number) => {
    if (quantity === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/15">
          <XCircle className="w-3.5 h-3.5" />
          <span>Out of Stock</span>
        </span>
      );
    }
    if (quantity <= minStock) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/15">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Low Stock</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>In Stock</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner / Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 font-sans">Inventory Hub</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage stocks, adjust levels, and track categories.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetAll}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-950/40 text-rose-400 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Stock (Zero All)</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#c06c3c] hover:bg-[#a6562a] text-[#faf8f5] rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Item</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 glass-card rounded-2xl">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search catalog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#181615] border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl pl-10 pr-4 py-2.5 text-zinc-200 placeholder-zinc-500 text-sm outline-none transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-500"><Filter className="w-4 h-4" /></span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-[#181615] border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-3 py-2.5 text-zinc-300 text-sm outline-none transition-all duration-200 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-500"><Settings className="w-4 h-4" /></span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-[#181615] border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-3 py-2.5 text-zinc-300 text-sm outline-none transition-all duration-200 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="instock">In Stock Only</option>
            <option value="low">Low Stock Alerts</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>

        <div className="flex items-center justify-end text-zinc-500 text-xs font-mono pr-2">
          Filtered: {filteredItems.length} / {items.length} items
        </div>
      </div>

      {/* Catalog Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <span className="text-sm font-medium">Retrieving active products...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <span className="text-sm font-semibold">No stock item matches current filter settings.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs font-semibold uppercase tracking-wider pb-3">
                  <th className="py-3.5 pl-6">Product</th>
                  <th className="py-3.5">Category</th>
                  <th className="py-3.5 text-center">Quantity</th>
                  <th className="py-3.5">Stock Level Badge</th>
                  <th className="py-3.5 text-center pr-6">Quick Adjust / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60 text-sm text-zinc-300">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-900/30 transition-colors">
                    {/* Product Name */}
                    <td className="py-3.5 pl-6 font-semibold text-zinc-200">
                      <div>
                        <span>{item.name}</span>
                        {item.notes && <span className="block text-[11px] font-normal text-zinc-500 mt-0.5 truncate max-w-[250px]">{item.notes}</span>}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 text-zinc-400 font-medium">
                      {item.category}
                    </td>

                    {/* Quantity */}
                    <td className="py-3.5 text-center font-mono font-bold">
                      <span className="text-zinc-100">{item.quantity}</span>
                      <span className="text-[11px] font-normal text-zinc-500 ml-1 uppercase">{item.unit || 'pcs'}</span>
                    </td>

                    {/* Stock Status Badge */}
                    <td className="py-3.5">
                      {getStatusBadge(item.quantity, item.min_stock_level)}
                    </td>

                    {/* Quick Adjust & Actions */}
                    <td className="py-3.5 text-center pr-6">
                      <div className="flex items-center justify-center gap-4">
                        {/* Adjust buttons */}
                        <div className="flex items-center gap-1.5 bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-1">
                          <button
                            onClick={() => handleOpenAdjust(item, 'in')}
                            title="Restock Items"
                            className="p-1 hover:bg-emerald-500/10 text-emerald-500 hover:text-emerald-400 rounded transition-colors cursor-pointer"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <div className="h-4 w-[1px] bg-zinc-800"></div>
                          <button
                            onClick={() => handleOpenAdjust(item, 'out')}
                            title="Deduct/Release Items"
                            disabled={item.quantity === 0}
                            className="p-1 hover:bg-rose-500/10 text-rose-500 hover:text-rose-400 rounded transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Edit & Delete */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Product"
                            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-zinc-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            title="Delete Product"
                            className="p-1.5 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-zinc-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- ADD NEW PRODUCT MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-card rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/80 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80">
              <h3 className="text-lg font-bold text-zinc-100">Add New Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-zinc-300 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!formName.trim()) {
                toast.error('Product name is required.');
                return;
              }
              addItemMutation.mutate({
                name: formName.trim(),
                category: formCategory,
                quantity: formQuantity,
                min_stock_level: formMinStock,
                unit: formUnit,
                notes: formNotes.trim(),
                is_active: true
              });
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coke"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#181615] border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-4 py-2.5 text-zinc-200 text-sm outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#181615] border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-4 py-2.5 text-zinc-200 text-sm outline-none cursor-pointer transition-all"
                  >
                    <option value="Soft Drinks & Juices">Soft Drinks & Juices</option>
                    <option value="Beers & Ciders">Beers & Ciders</option>
                    <option value="Spirits">Spirits</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Unit type</label>
                  <input
                    type="text"
                    required
                    placeholder="pcs, tots, cans"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full bg-[#181615] border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-4 py-2.5 text-zinc-200 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Starting Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#181615] border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-4 py-2.5 text-zinc-200 text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Min Stock Alert Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(parseInt(e.target.value) || 5)}
                    className="w-full bg-[#181615] border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-4 py-2.5 text-zinc-200 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Internal Notes (Optional)</label>
                <textarea
                  placeholder="Storage or batch information..."
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-[#181615] border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-4 py-2.5 text-zinc-200 text-sm outline-none resize-none transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#282421]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-zinc-900 border border-[#2b2724] hover:border-zinc-800 text-zinc-300 rounded-lg text-sm transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addItemMutation.isPending}
                  className="px-4 py-2 bg-[#c06c3c] hover:bg-[#a6562a] text-[#faf8f5] rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  {addItemMutation.isPending ? 'Inserting...' : 'Confirm Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT PRODUCT DETAILS MODAL --- */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-card rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/80 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80">
              <h3 className="text-lg font-bold text-zinc-100">Edit Product: {selectedItem.name}</h3>
              <button onClick={() => { setShowEditModal(false); setSelectedItem(null); }} className="text-zinc-500 hover:text-zinc-300 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!formName.trim()) {
                toast.error('Product name is required.');
                return;
              }
              editItemMutation.mutate({
                name: formName.trim(),
                category: formCategory,
                min_stock_level: formMinStock,
                unit: formUnit,
                notes: formNotes.trim(),
              });
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Product Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#181615] border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-4 py-2.5 text-zinc-200 text-sm outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#181615] border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-4 py-2.5 text-zinc-200 text-sm outline-none cursor-pointer transition-all"
                  >
                    <option value="Soft Drinks & Juices">Soft Drinks & Juices</option>
                    <option value="Beers & Ciders">Beers & Ciders</option>
                    <option value="Spirits">Spirits</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Unit type</label>
                  <input
                    type="text"
                    required
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full bg-[#181615] border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-4 py-2.5 text-zinc-200 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Min Stock Alert Limit</label>
                <input
                  type="number"
                  min="1"
                  value={formMinStock}
                  onChange={(e) => setFormMinStock(parseInt(e.target.value) || 5)}
                  className="w-full bg-[#181615] border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-4 py-2.5 text-zinc-200 text-sm outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Internal Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-[#181615] border border-[#2b2724] focus:border-[#c06c3c] focus:ring-1 focus:ring-[#c06c3c]/20 rounded-xl px-4 py-2.5 text-zinc-200 text-sm outline-none resize-none transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#282421]">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedItem(null); }}
                  className="px-4 py-2 bg-zinc-900 border border-[#2b2724] hover:border-zinc-800 text-zinc-300 rounded-lg text-sm transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editItemMutation.isPending}
                  className="px-4 py-2 bg-[#c06c3c] hover:bg-[#a6562a] text-[#faf8f5] rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  {editItemMutation.isPending ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- STOCK ADJUSTMENT (IN/OUT) MODAL --- */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card rounded-2xl overflow-hidden shadow-2xl border border-zinc-800/80 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80">
              <h3 className="text-lg font-bold text-zinc-100">
                {adjustType === 'in' ? 'Restock Product' : 'Deduct Stock'}: {selectedItem.name}
              </h3>
              <button onClick={() => { setShowAdjustModal(false); setSelectedItem(null); resetAdjustForm(); }} className="text-zinc-500 hover:text-zinc-300 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              adjustStockMutation.mutate();
            }} className="p-6 space-y-4">
              <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-between text-sm">
                <span className="text-zinc-400">Current Stock Quantity:</span>
                <span className="font-mono font-bold text-zinc-100">{selectedItem.quantity} {selectedItem.unit || 'pcs'}</span>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Adjustment Quantity ({selectedItem.unit || 'pcs'})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 text-sm outline-none focus:border-amber-500/60"
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Reason Code</label>
                {adjustType === 'in' ? (
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 text-sm outline-none focus:border-amber-500/60 cursor-pointer"
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
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 text-sm outline-none focus:border-amber-500/60 cursor-pointer"
                  >
                    <option value="Drawn to Beach Bar">Drawn to Beach Bar</option>
                    <option value="Expired">Expired</option>
                    <option value="Broken / Spoilt">Broken / Spoilt</option>
                    <option value="Stock Correction">Stock Correction</option>
                    <option value="Other Release">Other Release</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Action Notes (Optional)</label>
                <textarea
                  placeholder="Details of batch, staff name or reference..."
                  rows={2}
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 text-sm outline-none focus:border-amber-500/60 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => { setShowAdjustModal(false); setSelectedItem(null); resetAdjustForm(); }}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-lg text-sm transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustStockMutation.isPending}
                  className={`px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 ${
                    adjustType === 'in' 
                      ? 'bg-emerald-600 hover:bg-emerald-500' 
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {adjustStockMutation.isPending ? 'Logging...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
