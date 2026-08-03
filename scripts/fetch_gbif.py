# fetch_gbif.py
import requests
import json
import os
import time

SPECIES_LIST = [
    "Panthera tigris",      # Tiger
    "Panthera leo",          # Lion
    "Loxodonta africana",    # Elephant
    "Equus quagga",          # Zebra
    "Cervus elaphus",        # Deer
    "Vulpes vulpes",         # Fox
    "Ursus arctos",          # Bear
    "Panthera pardus",       # Leopard
    "Canis lupus",           # Wolf
    "Bubo bubo",             # Owl
    "Aquila chrysaetos",     # Eagle
    "Sciurus vulgaris"       # Squirrel
]

OUTPUT_DIR = "data/occurrence-samples"
os.makedirs(OUTPUT_DIR, exist_ok=True)

for species in SPECIES_LIST:
    url = "https://api.gbif.org/v1/occurrence/search"
    params = {"scientificName": species, "limit": 50}

    response = requests.get(url, params=params)
    data = response.json()

    filename = species.replace(" ", "_") + ".json"
    filepath = os.path.join(OUTPUT_DIR, filename)

    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)

    record_count = data.get("count", 0)
    print(f"{species}: {record_count} total records available, saved 50")

    time.sleep(1)  # be polite to the API, avoid hammering it