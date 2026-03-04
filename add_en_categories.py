import json

# English translations for all categories
en_translations = {
    # Main categories
    'frozen': 'Frozen Foods',
    'chilled-dry': 'Chilled & Dry Foods',
    'promotion': 'Offers',
    'new-arrivals': 'New Arrivals',
    
    # Frozen subcategories
    'frozen_poultry': 'Poultry',
    'frozen_poultry_whole': 'Whole Poultry',
    'frozen_poultry_breasts': 'Breasts',
    'frozen_poultry_legs': 'Legs & Thighs',
    'frozen_poultry_wings': 'Wings',
    'frozen_poultry_livers': 'Livers & Gizzards',
    'frozen_poultry_ready': 'Ready to Cook',
    
    'frozen_beef': 'Beef & Veal',
    'frozen_beef_steaks': 'Steaks',
    'frozen_beef_ribs': 'Ribs & Cuts',
    'frozen_beef_ground': 'Ground Beef',
    'frozen_beef_ready': 'Ready to Cook',
    
    'frozen_buffalo': 'Buffalo',
    
    'frozen_seafood': 'Seafood',
    'frozen_seafood_wholefish': 'Whole Fish',
    'frozen_seafood_fillets': 'Fillets & Cuts',
    'frozen_seafood_shrimp': 'Shrimp',
    'frozen_seafood_shellfish': 'Shellfish & Mollusks',
    'frozen_seafood_ready': 'Ready to Cook',
    
    'frozen_lamb-mutton': 'Lamb & Mutton',
    'frozen_lamb_primals': 'Primal Cuts',
    'frozen_lamb_ground': 'Ground Lamb',
    
    'frozen_fries-appetizers': 'Fries & Appetizers',
    'frozen_fries_potatoes': 'French Fries',
    'frozen_fries_appetizers': 'Appetizers',
    
    'frozen_vegetables-fruits': 'Vegetables & Fruits',
    'frozen_veg_vegetables': 'Vegetables',
    'frozen_veg_fruits': 'Fruits',
    
    'frozen_pasta-pizza': 'Pasta & Pizza',
    'frozen_pasta': 'Pasta',
    'frozen_pizza': 'Pizza',
    
    'frozen_bakery-desserts': 'Bakery & Desserts',
    'frozen_bakery_bread': 'Bread',
    'frozen_bakery_desserts': 'Desserts, Pastries & Viennoiserie',
    'frozen_bakery_icecream': 'Ice Cream',
    
    'frozen_cheese-butter': 'Cheese & Butter',
    'frozen_cheese': 'Cheese',
    'frozen_butter': 'Butter',
    
    # Chilled & Dry subcategories
    'chilled-dry_condiments-sauces': 'Sauces & Condiments',
    'chilled_sauces': 'Sauces',
    'chilled_pickles': 'Pickles',
    
    'chilled-dry_seasonings-spices': 'Seasonings, Spices & Sugar',
    'chilled_spices': 'Spices & Seasonings',
    
    'chilled-dry_grains-pulses': 'Grains, Pulses & Pantry',
    'chilled_rice': 'Rice',
    'chilled_grains': 'Grains & Pulses',
    'chilled_pantry': 'Pantry Items',
    
    'chilled-dry_nuts-dried-fruits': 'Nuts & Dried Fruits',
    'chilled_nuts': 'Nuts',
    'chilled_driedfruits': 'Dried Fruits',
    
    'chilled-dry_canned': 'Canned Goods',
    'chilled_canned_tomatoes': 'Tomatoes',
    'chilled_canned_others': 'Others',
    
    'chilled-dry_cooking-oils-fats': 'Cooking Oils & Fats',
    'chilled_oils': 'Oils',
    'chilled_ghee': 'Ghee',
    'chilled_tallow': 'Tallow',
    'chilled_blendedfats': 'Blended Fats',
    
    'chilled-dry_cheese': 'Cold Cuts, Dairy, Cheese & Eggs',
    'chilled_cheese': 'Cheese',
    'chilled_creams': 'Cream',
    'chilled_dairy': 'Dairy & Yogurt',
    'chilled_delimeat': 'Cold Cuts',
    
    'chilled-dry_beverages': 'Beverages & Syrups',
    'chilled_juices': 'Juices',
    'chilled_coffee': 'Coffee Beans & Blends',
    'chilled_tea': 'Tea',
    'chilled_water': 'Water',
    'chilled_syrups': 'Syrups & Sweeteners',
    
    'chilled-dry_snacks': 'Breakfast Cereals & Snacks',
    'chilled_cereals': 'Breakfast Cereals',
    'chilled_snacks': 'Snacks',
}

def add_en_to_subcats(subcats):
    for sub in subcats:
        handle = sub['handle']
        if handle in en_translations:
            sub['titleEn'] = en_translations[handle]
        else:
            # Fallback: use handle as English title
            sub['titleEn'] = handle.replace('_', ' ').replace('-', ' ').title()
        if sub.get('subcategories'):
            add_en_to_subcats(sub['subcategories'])

with open('client/public/store-data/products.json') as f:
    data = json.load(f)

# Update categories
for key, cat in data['categories'].items():
    if key in en_translations:
        cat['titleEn'] = en_translations[key]
    if cat.get('subcategories'):
        add_en_to_subcats(cat['subcategories'])

with open('client/public/store-data/products.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False)

print("Done! English translations added to all categories.")

# Verify
for key, cat in data['categories'].items():
    print(f'{cat["title"]} -> {cat.get("titleEn", "MISSING")}')
    if cat.get('subcategories'):
        for sub in cat['subcategories'][:2]:
            print(f'  {sub["title"]} -> {sub.get("titleEn", "MISSING")}')
            if sub.get('subcategories'):
                for nested in sub['subcategories'][:2]:
                    print(f'    {nested["title"]} -> {nested.get("titleEn", "MISSING")}')
