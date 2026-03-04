import json, requests, re, time
from bs4 import BeautifulSoup

with open('client/public/store-data/products.json', 'r') as f:
    data = json.load(f)

products = data['products']
total = len(products)
success = 0
failed = 0
skipped = 0

for i, p in enumerate(products):
    handle = p.get('handle', '')
    if not handle:
        skipped += 1
        continue
    
    # Skip if already has Arabic description
    if p.get('descriptionAr') and len(p['descriptionAr']) > 10:
        skipped += 1
        continue
    
    url = f"https://makanifoods.com/ar/products/{handle}"
    
    try:
        resp = requests.get(url, timeout=8)
        if resp.status_code != 200:
            failed += 1
            if (i+1) % 50 == 0:
                print(f"[{i+1}/{total}] Failed {handle}: status {resp.status_code}")
            continue
        
        soup = BeautifulSoup(resp.text, 'html.parser')
        
        # Find Arabic description
        desc_text = ''
        for tag in soup.find_all(['div'], class_=re.compile(r'accordion__content.*rte|rte')):
            text = tag.get_text(strip=True)
            if len(text) > 20:
                desc_text = tag.decode_contents()
                break
        
        if not desc_text:
            # Try meta description
            meta = soup.find('meta', {'name': 'description'})
            if meta and meta.get('content'):
                desc_text = meta['content']
        
        if desc_text and len(desc_text) > 10:
            p['descriptionAr'] = desc_text
            success += 1
        else:
            failed += 1
        
    except Exception as e:
        failed += 1
    
    if (i+1) % 50 == 0:
        print(f"[{i+1}/{total}] Success: {success}, Failed: {failed}, Skipped: {skipped}")
        # Save progress
        with open('client/public/store-data/products.json', 'w') as f:
            json.dump(data, f, ensure_ascii=False)
    
    time.sleep(0.3)

# Final save
with open('client/public/store-data/products.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False)

print(f"\nDone! Success: {success}, Failed: {failed}, Skipped: {skipped}")
