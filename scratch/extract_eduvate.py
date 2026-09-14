import urllib.request
import re
import json

url = "https://www.eduvate.app"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')

js_files = re.findall(r'src="(/assets/[^"]+)"', html)
print("JS Files:", js_files)

if js_files:
    js_url = url + js_files[0]
    req_js = urllib.request.Request(js_url, headers={'User-Agent': 'Mozilla/5.0'})
    js_content = urllib.request.urlopen(req_js).read().decode('utf-8')
    
    with open('scratch/eduvate_bundle.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print("Bundle size:", len(js_content))
    
    # Extract French text strings from JS bundle
    strings = set(re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', js_content))
    french_strings = [s for s in strings if len(s) > 15 and (' ' in s or 'é' in s or 'è' in s or 'IA' in s or 'écoles' in s)]
    
    with open('scratch/eduvate_strings.json', 'w', encoding='utf-8') as f:
        json.dump(sorted(french_strings), f, ensure_ascii=False, indent=2)
        
    print(f"Extracted {len(french_strings)} text strings!")
