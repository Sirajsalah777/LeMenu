import requests
import json
import time

base_url = "http://localhost:8000/api"

# Wait a moment for server to make sure it's up
time.sleep(1)

rest_data = {
    "name": "Restaurant Al Mounia",
    "slug": "al-mounia",
    "theme_color": "#8B5E3C",
    "address": "Casablanca, Maroc",
    "phone": "+212 6 00 00 00 00"
}
try:
    res = requests.post(f"{base_url}/restaurants/", json=rest_data)
    rest = res.json()
    print("Restaurant created:", rest)
except Exception as e:
    print("Error creating restaurant:", e)

dishes = [
    {"name": "Tajine d'agneau aux pruneaux", "category": "Plats", "price": 145, "description": "Un tajine traditionnel marocain mijotté lentement avec des pruneaux fondants, des amandes grillées et des épices ancestrales.", "allergens": ["Fruits à coque"], "weight_grams": 320, "calories": 580, "restaurant_id": 1},
    {"name": "Pastilla au poulet", "category": "Entrées", "price": 85, "description": "La pastilla royale, croustillante feuilletée farcie au poulet et amandes, parfumée à la cannelle et au sucre glace.", "allergens": ["Gluten", "Oeufs", "Fruits à coque"], "weight_grams": 200, "calories": 420, "restaurant_id": 1},
    {"name": "Couscous royal", "category": "Plats", "price": 175, "description": "Le couscous marocain par excellence, servi avec merguez, poulet, légumes de saison et bouillon parfumé.", "allergens": ["Gluten"], "weight_grams": 450, "calories": 720, "restaurant_id": 1},
    {"name": "Salade marocaine", "category": "Entrées", "price": 45, "description": "Tomates, concombres, poivrons et persil avec huile d'argan et citron confit.", "allergens": [], "weight_grams": 180, "calories": 120, "restaurant_id": 1},
    {"name": "Cornes de gazelle", "category": "Desserts", "price": 35, "description": "Pâtisserie marocaine fine à la pâte d'amandes parfumée à la fleur d'oranger.", "allergens": ["Fruits à coque", "Gluten"], "weight_grams": 80, "calories": 280, "restaurant_id": 1},
    {"name": "Thé à la menthe", "category": "Boissons", "price": 25, "description": "Thé vert gunpowder infusé avec de la menthe fraîche et du sucre, servi à la traditionnelle.", "allergens": [], "weight_grams": 250, "calories": 60, "restaurant_id": 1}
]

for d in dishes:
    data = {
        "restaurant_id": d["restaurant_id"],
        "name": d["name"],
        "description": d["description"],
        "price": d["price"],
        "category": d["category"],
        "allergens": json.dumps(d["allergens"]),
        "weight_grams": d["weight_grams"],
        "calories": d["calories"]
    }
    try:
        r = requests.post(f"{base_url}/dishes/", data=data)
        print("Dish created:", r.status_code, r.text)
    except Exception as e:
        print("Error creating dish:", e)
