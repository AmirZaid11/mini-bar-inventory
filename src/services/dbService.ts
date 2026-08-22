import { Firestore, collection, getDocs, doc, addDoc, updateDoc, writeBatch, getDoc, runTransaction } from 'firebase/firestore';

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
  private db: Firestore | null = null;
  private isDemoMode = false;

  constructor(firestore: Firestore | null) {
    this.db = firestore;
    this.isDemoMode = !firestore;

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

  // --- GET ITEMS ---
  async getItems(includeInactive = false): Promise<Item[]> {
    if (this.isDemoMode) {
      const items = JSON.parse(localStorage.getItem('amir_demo_items') || '[]');
      return includeInactive ? items : items.filter((item: Item) => item.is_active);
    }

    const itemsCol = collection(this.db!, 'items');
    const snapshot = await getDocs(itemsCol);
    const items: Item[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (includeInactive || data.is_active !== false) {
        items.push({ id: docSnap.id, ...data } as Item);
      }
    });

    // Sort by name ascending (case insensitive)
    return items.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
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

    // Live Firebase mode
    const itemsCol = collection(this.db!, 'items');
    const snapshot = await getDocs(itemsCol);
    const exists = snapshot.docs.some(docSnap => {
      const data = docSnap.data();
      return data.is_active !== false && data.name.toLowerCase() === newItem.name.toLowerCase();
    });

    if (exists) {
      throw new Error('A product with this name already exists in the catalog.');
    }

    const createdAt = new Date().toISOString();
    const docRef = await addDoc(itemsCol, {
      ...newItem,
      created_at: createdAt,
      updated_at: createdAt
    });

    if (newItem.quantity > 0) {
      try {
        const txCol = collection(this.db!, 'transactions');
        await addDoc(txCol, {
          item_id: docRef.id,
          type: 'in',
          quantity: newItem.quantity,
          reason: 'Opening Balance',
          notes: 'Initialized starting quantity',
          created_at: createdAt
        });
      } catch (txError) {
        console.error('Failed to log transaction:', txError);
      }
    }

    return {
      id: docRef.id,
      ...newItem,
      created_at: createdAt
    };
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

    // Live Firebase mode
    const itemsCol = collection(this.db!, 'items');
    if (fields.name) {
      const snapshot = await getDocs(itemsCol);
      const exists = snapshot.docs.some(docSnap => {
        const data = docSnap.data();
        return docSnap.id !== id && data.is_active !== false && data.name.toLowerCase() === fields.name!.toLowerCase();
      });
      if (exists) {
        throw new Error('Another product is already registered with this name.');
      }
    }

    const docRef = doc(this.db!, 'items', id);
    const updatedFields = {
      ...fields,
      updated_at: new Date().toISOString()
    };
    await updateDoc(docRef, updatedFields);
    
    const docSnap = await getDoc(docRef);
    return { id, ...docSnap.data() } as Item;
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

    // Live Firebase mode using Transactions for atomic stock adjustment
    const itemRef = doc(this.db!, 'items', id);
    
    await runTransaction(this.db!, async (transaction) => {
      const itemSnap = await transaction.get(itemRef);
      if (!itemSnap.exists()) {
        throw new Error('Product not found');
      }

      const currentQty = itemSnap.data().quantity || 0;
      const newQty = type === 'in' ? currentQty + quantity : currentQty - quantity;
      if (newQty < 0) {
        throw new Error('Deduction exceeds stock level.');
      }

      // Update item quantity
      transaction.update(itemRef, {
        quantity: newQty,
        updated_at: new Date().toISOString()
      });

      // Log transaction record
      const txCol = collection(this.db!, 'transactions');
      const newTxRef = doc(txCol);
      transaction.set(newTxRef, {
        item_id: id,
        type,
        quantity,
        reason,
        notes,
        created_at: new Date().toISOString()
      });
    });
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

    const docRef = doc(this.db!, 'items', id);
    await updateDoc(docRef, { 
      is_active: false,
      updated_at: new Date().toISOString()
    });
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

    // Live Firebase mode
    const txCol = collection(this.db!, 'transactions');
    const txSnapshot = await getDocs(txCol);

    // Fetch items list to resolve item name/category mapping
    const itemsCol = collection(this.db!, 'items');
    const itemsSnapshot = await getDocs(itemsCol);
    const itemsMap: Record<string, { name: string; category: string }> = {};
    itemsSnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      itemsMap[docSnap.id] = { name: d.name || '', category: d.category || '' };
    });

    const transactions: Transaction[] = [];
    txSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const itemId = data.item_id;
      transactions.push({
        id: docSnap.id,
        item_id: itemId,
        type: data.type,
        quantity: data.quantity,
        reason: data.reason || '',
        notes: data.notes || '',
        created_at: data.created_at,
        items: itemsMap[itemId] || null
      });
    });

    const sorted = transactions.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return limit ? sorted.slice(0, limit) : sorted;
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

    // Live Firebase mode using batches
    const itemsCol = collection(this.db!, 'items');
    const itemsSnap = await getDocs(itemsCol);
    const batch = writeBatch(this.db!);
    itemsSnap.forEach((docSnap) => {
      batch.update(docSnap.ref, { quantity: 0, updated_at: new Date().toISOString() });
    });
    await batch.commit();

    const txCol = collection(this.db!, 'transactions');
    const txSnap = await getDocs(txCol);
    let deleteBatch = writeBatch(this.db!);
    let count = 0;
    
    for (const docSnap of txSnap.docs) {
      deleteBatch.delete(docSnap.ref);
      count++;
      if (count === 500) {
        await deleteBatch.commit();
        deleteBatch = writeBatch(this.db!);
        count = 0;
      }
    }
    if (count > 0) {
      await deleteBatch.commit();
    }
  }
}
