import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Please provide SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) as environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const items = [
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

async function seed() {
  console.log(`Starting seeding of ${items.length} items...`);
  
  // Insert items one by one or in batches, and ignore duplicates
  for (const item of items) {
    const { data, error } = await supabase
      .from('items')
      .upsert(
        { 
          name: item.name, 
          category: item.category, 
          quantity: 0, 
          min_stock_level: item.min_stock_level, 
          unit: item.unit,
          is_active: true
        }, 
        { onConflict: 'name' }
      );
    
    if (error) {
      console.error(`Failed to insert ${item.name}:`, error.message);
    } else {
      console.log(`Successfully seeded/updated: ${item.name}`);
    }
  }

  console.log('Seeding complete!');
}

seed().catch(err => {
  console.error('Seeding crashed:', err);
  process.exit(1);
});
