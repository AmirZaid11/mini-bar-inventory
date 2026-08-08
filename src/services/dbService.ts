import { SupabaseClient } from '@supabase/supabase-js';

export interface Item {
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

export interface Transaction {
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

// Initial items seed for LocalStorage demo mode
const INITIAL_DEMO_ITEMS = [
  // Soft Drinks & Juices
  { name: 'Coke', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },
  { name: 'Coke zero', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },
  { name: 'Fanta orange', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },
  { name: 'Fanta passion', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },
  { name: 'Fanta Black current', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },
  { name: 'Krest bitterlemon', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },
  { name: 'Tonic', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },
  { name: 'Alvaro', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },
  { name: 'Novida', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },
  { name: 'Stoney', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },
  { name: 'Sprite', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },
  { name: 'Mayers sparkling water 330ml', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },
  { name: 'Mayers sparkling water 500ml', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },
  { name: 'Mayers still water 330ml', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },
  { name: 'Mayers still waters 500ml', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },
  { name: 'Mayers still water 750ml', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },
  { name: 'Redbull', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },
  { name: 'Mango juice', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },
  { name: 'Orange juice', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },
  { name: 'Apple juice', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },
  { name: 'Pineapple juice', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },
  { name: 'Passion juice', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },
  { name: 'Tropical', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },
  { name: 'Mixed Berry', category: 'Soft Drinks & Juices', min_stock_level: 5, unit: 'pcs' },

  // Beers & Ciders
  { name: 'Hunters Gold / Hunters Dry', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Savvana Dry/lemon', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Snap', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Pineapple Punch-Smirnoff', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Guarana Raspbery', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Guarana', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Black ice', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Gordons Can', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Kingfisher', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Kenya Original Tonic/IceTea Cans', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Desperado', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Kenya original cider', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Manyatta', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'White sweet', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'white dry', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Red sweet', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Red dry /Asconi', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Pilsner', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Tusker', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Balozi', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'White cap', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'White cap lite', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Tusker light', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Tusker Malt', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Tusker ndimu', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Guiness Kubwa', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Heineken', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Heineken zero', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Tusker cider', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Tusker Cans', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Uprise', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Whitecap cans', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Guiness Cans', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },
  { name: 'Windhoek', category: 'Beers & Ciders', min_stock_level: 5, unit: 'pcs' },

  // Spirits
  { name: 'Smirnoff vodka 750', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Smirnoff vodka 350', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Smirnoff vodka tot', category: 'Spirits', min_stock_level: 10, unit: 'tots' },
  { name: 'Tanguaray Gin 1litre', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Tanguaray Gin 750', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Tanguaray 10yrs 750', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Gilbeys Gin 750', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Gilbeys Gin 350', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Gilbeys gin tot', category: 'Spirits', min_stock_level: 10, unit: 'tots' },
  { name: 'Gordons gin 750', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Gordons gin 1litre', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Gordons gin tot', category: 'Spirits', min_stock_level: 10, unit: 'tots' },
  { name: 'Hennessey brandy', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Hennessy VSOP', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Hennesy 350', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Viceroy 750', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Viceroy 375', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Vicery tot', category: 'Spirits', min_stock_level: 10, unit: 'tots' },
  { name: 'Richot 750ml', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Richot 375ml', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Richot tots', category: 'Spirits', min_stock_level: 10, unit: 'tots' },
  { name: 'Captain Morgan Gold 750ml', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Captain Morgan ltr', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Malibu 750ml', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Malibu tot', category: 'Spirits', min_stock_level: 10, unit: 'tots' },
  { name: 'VAT 69 750ml', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'VAT 69 350ml', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'J&B 750ml/1ltre', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'J&B 350ML', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'William lawsons 750ml', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'William lawson 350ml', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Famouse grouse 1litre', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Famouse grouse 750ml', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Famouse grouse 350ml', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Jameson 1litre', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Jameson 350ml', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Jameson tot', category: 'Spirits', min_stock_level: 10, unit: 'tots' },
  { name: 'Jameson black barrel', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Jack daniels 1litre', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Jack daniels 350', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Jack daniel tot', category: 'Spirits', min_stock_level: 10, unit: 'tots' },
  { name: 'JW Red 1litre', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'JW Red 350', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'JW Red tot', category: 'Spirits', min_stock_level: 10, unit: 'tots' },
  { name: 'JW Black 1litre', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'JW Black 350', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'JW Black tot', category: 'Spirits', min_stock_level: 10, unit: 'tots' },
  { name: 'JW Gold reserve', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Ballentines 750', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Ballentines ltr', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Singleton 12yrs 750', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Singleton 15yrs', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Singleton tot', category: 'Spirits', min_stock_level: 10, unit: 'tots' },
  { name: 'Chivas 750ml', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Chivas 1 litre', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Glenlivet 12 yrs', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Glenlivet 15 yrs', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Glenfiddich 12yrs 750', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Glenfiddich 15ys 750', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Glenfiddich 18yrs 750', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'JW Double Black 1 litre', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'JW Double Black 750ml', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Black and white 750ml', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Black and white 350ml', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Martel vs', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Martel vsop', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Southern comfort 750ml', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Southern comfort tot', category: 'Spirits', min_stock_level: 10, unit: 'tots' },
  { name: 'Amarula 750ml', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Amarula 350ml', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Amarula tot', category: 'Spirits', min_stock_level: 10, unit: 'tots' },
  { name: 'Baileys 750ml', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Baileys 350ml', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Baileys tot', category: 'Spirits', min_stock_level: 10, unit: 'tots' },
  { name: 'Jagermeister 1litre', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Jagermeister tot', category: 'Spirits', min_stock_level: 10, unit: 'tots' },
  { name: 'Tequila Jose Cuevo 750', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Tequila Jose Cuevo tot', category: 'Spirits', min_stock_level: 10, unit: 'tots' },
  { name: 'Camino Tequila 750ml', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Camino Tequila tot', category: 'Spirits', min_stock_level: 10, unit: 'tots' },
  { name: 'Grants 750ml', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Grants 1ltre', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },
  { name: 'Cordial Lime 1.5litre/Tots/ 700ML', category: 'Spirits', min_stock_level: 5, unit: 'pcs' },

  // Others
  { name: 'CIGGARRETS', category: 'Others', min_stock_level: 5, unit: 'pcs' },
  { name: 'Gas lighters', category: 'Others', min_stock_level: 5, unit: 'pcs' },
  { name: 'Mosquito rep', category: 'Others', min_stock_level: 5, unit: 'pcs' },
  { name: 'NUTS', category: 'Others', min_stock_level: 5, unit: 'pcs' },
  { name: 'CASHEWNUTS', category: 'Others', min_stock_level: 5, unit: 'pcs' }
];

export class DBService {
  private supabase: SupabaseClient | null = null;
  private isDemoMode = false;

  constructor(supabaseClient: SupabaseClient | null) {
    this.supabase = supabaseClient;
    this.isDemoMode = !supabaseClient;

    if (this.isDemoMode) {
      this.initDemoDatabase();
    }
  }

  private initDemoDatabase() {
    const localItems = localStorage.getItem('amir_demo_items');
    if (!localItems) {
      // Seed initial items with quantities ranging from 0 to 12 for visual realism in demo!
      const seeded = INITIAL_DEMO_ITEMS.map((item, idx) => ({
        id: `demo-item-${idx}`,
        ...item,
        quantity: idx % 7 === 0 ? 0 : idx % 5 === 0 ? Math.floor(Math.random() * 4) + 1 : Math.floor(Math.random() * 20) + 5,
        is_active: true,
        created_at: new Date(Date.now() - idx * 3600000).toISOString()
      }));
      localStorage.setItem('amir_demo_items', JSON.stringify(seeded));

      // Seed initial transactions
      const seededTx: Transaction[] = [];
      seeded.slice(0, 15).forEach((item, idx) => {
        if (item.quantity > 0) {
          seededTx.push({
            id: `demo-tx-${idx}`,
            item_id: item.id,
            type: 'in',
            quantity: item.quantity,
            reason: idx % 3 === 0 ? 'Opening Balance' : 'Purchase Restock',
            notes: 'Demo auto-seeded record',
            created_at: new Date(Date.now() - idx * 1000 * 3000).toISOString(),
            items: { name: item.name, category: item.category }
          });
        }
      });
      localStorage.setItem('amir_demo_transactions', JSON.stringify(seededTx));
    }
  }

  // --- GET ALL ACTIVE ITEMS ---
  async getItems(): Promise<Item[]> {
    if (this.isDemoMode) {
      const items = JSON.parse(localStorage.getItem('amir_demo_items') || '[]');
      return items.filter((item: Item) => item.is_active);
    }

    const { data, error } = await this.supabase!
      .from('items')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // --- ADD NEW ITEM ---
  async createItem(newItem: Omit<Item, 'id' | 'created_at'>): Promise<Item> {
    if (this.isDemoMode) {
      const items = JSON.parse(localStorage.getItem('amir_demo_items') || '[]');
      
      const exists = items.some((i: Item) => i.name.toLowerCase() === newItem.name.toLowerCase() && i.is_active);
      if (exists) {
        throw new Error('A product with this name already exists in the catalog.');
      }

      const item: Item = {
        id: `demo-item-${Date.now()}`,
        ...newItem,
        created_at: new Date().toISOString()
      };

      items.push(item);
      localStorage.setItem('amir_demo_items', JSON.stringify(items));

      // Log transaction if quantity > 0
      if (item.quantity > 0) {
        await this.logTransaction({
          item_id: item.id,
          type: 'in',
          quantity: item.quantity,
          reason: 'Opening Balance',
          notes: 'Initialized starting quantity',
          items: { name: item.name, category: item.category }
        });
      }

      return item;
    }

    const { data: insertedData, error: itemError } = await this.supabase!
      .from('items')
      .insert([newItem])
      .select()
      .single();

    if (itemError) throw itemError;

    if (newItem.quantity > 0 && insertedData) {
      const { error: txError } = await this.supabase!
        .from('transactions')
        .insert([{
          item_id: insertedData.id,
          type: 'in',
          quantity: newItem.quantity,
          reason: 'Opening Balance',
          notes: 'Initialized starting quantity'
        }]);
      if (txError) console.error('Failed to log transaction:', txError);
    }

    return insertedData;
  }

  // --- EDIT PRODUCT DETAILS ---
  async updateItem(id: string, fields: Partial<Item>): Promise<Item> {
    if (this.isDemoMode) {
      const items = JSON.parse(localStorage.getItem('amir_demo_items') || '[]');
      const idx = items.findIndex((i: Item) => i.id === id);
      if (idx === -1) throw new Error('Product not found');

      // Check name unique
      if (fields.name) {
        const nameExists = items.some((i: Item) => i.id !== id && i.name.toLowerCase() === fields.name!.toLowerCase() && i.is_active);
        if (nameExists) throw new Error('Another product is already registered with this name.');
      }

      const updated = { ...items[idx], ...fields };
      items[idx] = updated;
      localStorage.setItem('amir_demo_items', JSON.stringify(items));
      return updated;
    }

    const { data, error } = await this.supabase!
      .from('items')
      .update(fields)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // --- STOCK ADJUSTMENT ---
  async adjustStock(id: string, type: 'in' | 'out', quantity: number, reason: string, notes: string): Promise<void> {
    if (this.isDemoMode) {
      const items = JSON.parse(localStorage.getItem('amir_demo_items') || '[]');
      const idx = items.findIndex((i: Item) => i.id === id);
      if (idx === -1) throw new Error('Product not found');

      const item = items[idx];
      const newQty = type === 'in' ? item.quantity + quantity : item.quantity - quantity;
      if (newQty < 0) throw new Error('Deduction exceeds stock level.');

      item.quantity = newQty;
      localStorage.setItem('amir_demo_items', JSON.stringify(items));

      // Log transaction
      await this.logTransaction({
        item_id: item.id,
        type,
        quantity,
        reason,
        notes,
        items: { name: item.name, category: item.category }
      });
      return;
    }

    // Supabase implementation: fetch current quantity
    const { data: itemData, error: fetchError } = await this.supabase!
      .from('items')
      .select('quantity')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;

    const newQty = type === 'in' ? itemData.quantity + quantity : itemData.quantity - quantity;
    if (newQty < 0) throw new Error('Deduction exceeds stock level.');

    // Update quantity
    const { error: itemError } = await this.supabase!
      .from('items')
      .update({ quantity: newQty, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (itemError) throw itemError;

    // Log transaction
    const { error: txError } = await this.supabase!
      .from('transactions')
      .insert([{
        item_id: id,
        type,
        quantity,
        reason,
        notes
      }]);

    if (txError) throw txError;
  }

  // --- SOFT DELETE ---
  async deleteItem(id: string): Promise<void> {
    if (this.isDemoMode) {
      const items = JSON.parse(localStorage.getItem('amir_demo_items') || '[]');
      const idx = items.findIndex((i: Item) => i.id === id);
      if (idx === -1) throw new Error('Product not found');

      items[idx].is_active = false;
      localStorage.setItem('amir_demo_items', JSON.stringify(items));
      return;
    }

    const { error } = await this.supabase!
      .from('items')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }

  // --- GET TRANSACTIONS ---
  async getTransactions(limit?: number): Promise<Transaction[]> {
    if (this.isDemoMode) {
      const transactions = JSON.parse(localStorage.getItem('amir_demo_transactions') || '[]');
      const sorted = transactions.sort((a: Transaction, b: Transaction) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      return limit ? sorted.slice(0, limit) : sorted;
    }

    let query = this.supabase!
      .from('transactions')
      .select(`
        id,
        item_id,
        type,
        quantity,
        reason,
        notes,
        created_at,
        items (
          name,
          category
        )
      `)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as any[];
  }

  // Helper to log transaction in demo mode
  private async logTransaction(tx: Omit<Transaction, 'id' | 'created_at'>) {
    const transactions = JSON.parse(localStorage.getItem('amir_demo_transactions') || '[]');
    const newTx: Transaction = {
      id: `demo-tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ...tx,
      created_at: new Date().toISOString()
    };
    transactions.push(newTx);
    localStorage.setItem('amir_demo_transactions', JSON.stringify(transactions));
  }

  // Reset all stock levels to 0 and empty transaction history log
  async resetAllInventoryToZero(): Promise<void> {
    if (this.isDemoMode) {
      const items = JSON.parse(localStorage.getItem('amir_demo_items') || '[]');
      const resetItems = items.map((item: any) => ({
        ...item,
        quantity: 0
      }));
      localStorage.setItem('amir_demo_items', JSON.stringify(resetItems));
      localStorage.setItem('amir_demo_transactions', JSON.stringify([]));
      return;
    }

    // Live Supabase integration
    const { error: txError } = await this.supabase!
      .from('transactions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (txError) throw txError;

    const { error: itemError } = await this.supabase!
      .from('items')
      .update({ quantity: 0 })
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (itemError) throw itemError;
  }
}
