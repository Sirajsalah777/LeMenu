import requests

BASE_URL = "http://localhost:8000/api"

# 1. Create I Want Crispy restaurant
print("Creating I Want Crispy restaurant...")
res = requests.post(f"{BASE_URL}/restaurants/", json={
    "name": "I Want Crispy",
    "slug": "iwantcrispy",
    "email": "admin@iwantcrispy.ma",
    "password": "crispy2026",
    "theme_color": "#C00000",
    "address": "Casablanca, Maroc",
    "phone": "+212 5 00 00 00 00"
})
print("Restaurant:", res.text)

# 2. Login
print("Logging in...")
login_res = requests.post(f"{BASE_URL}/auth/login", data={
    "username": "admin@iwantcrispy.ma",
    "password": "crispy2026"
})
token = login_res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("Logged in OK")

# 3. Seed all dishes
dishes = [
    # Nos Formules
    {"name": "Formule Twister", "category": "Nos Formules", "price": "39", "description": "Twister + Onion Rings. La formule idéale pour un repas rapide et savoureux."},
    {"name": "Formule Duo", "category": "Nos Formules", "price": "49", "description": "Tacos Crispy + Mini Burger + Boisson. Le duo parfait pour les grands appétits."},
    {"name": "Pack Burger", "category": "Nos Formules", "price": "49", "description": "Crispy Burger + 3 Strips + Frites. Un pack complet pour les amateurs de burgers."},
    {"name": "Box Méga Crispy", "category": "Nos Formules", "price": "149", "description": "10 Strips + 10 Wings + 2 Frites + 2 Potatoes + 6 Onion Rings. Le festin ultime!"},
    
    # Family / Sharing Boxes
    {"name": "Box Wings x25", "category": "Family / Sharing Boxes", "price": "115", "description": "25 Wings croustillantes + 3 Frites + 1L Pepsi. Parfait pour partager en famille."},
    {"name": "Box Strips x20", "category": "Family / Sharing Boxes", "price": "125", "description": "20 Strips dorés + 3 Frites + 1L Pepsi. Le bonheur à partager."},
    {"name": "Bigg Box x20", "category": "Family / Sharing Boxes", "price": "150", "description": "10 Wings + 10 Strips + 2 Frites + 2 Potatoes + 1L Pepsi."},
    {"name": "With Family x34", "category": "Family / Sharing Boxes", "price": "190", "description": "12 Strips + 12 Wings + 6 Onion Rings + 4 Mozza Sticks + 2 Frites + 2 Potatoes + 1L Pepsi."},

    # Burgers
    {"name": "Crispy Burger", "category": "Burgers", "price": "26", "description": "Notre burger signature avec du poulet croustillant, salade, tomate et sauce maison."},
    {"name": "Cheese Burger", "category": "Burgers", "price": "28", "description": "Burger au poulet crispy avec cheddar fondu, salade et sauce spéciale."},
    {"name": "Big Burger", "category": "Burgers", "price": "40", "description": "Double steak de poulet crispy, cheddar, salade, tomate et sauce BBQ."},
    {"name": "Big Chicken", "category": "Burgers", "price": "38", "description": "4 Strips de poulet, cheddar, salade et sauce ranch dans un pain brioché."},

    # Mega Boca
    {"name": "Mega Boca Original", "category": "Mega Boca", "price": "32", "description": "Strips, cheddar, dinde et sauce originale dans un pain artisanal."},
    {"name": "Mega Boca Moroccan", "category": "Mega Boca", "price": "32", "description": "Strips, cheddar, dinde et épices marocaines traditionnelles."},
    {"name": "Mega Boca Tex Mex", "category": "Mega Boca", "price": "32", "description": "Strips, cheddar, dinde, jalapeños et sauce tex-mex épicée."},
    {"name": "Mega Boca Pizza", "category": "Mega Boca", "price": "32", "description": "Strips, mozzarella, sauce tomate et origan dans un pain gratiné."},

    # Snacks / Sandwichs
    {"name": "Twister Nugget", "category": "Snacks / Sandwichs", "price": "26", "description": "Tortilla garnie de nuggets croustillants, salade, fromage et sauce."},
    {"name": "Twister Crispy", "category": "Snacks / Sandwichs", "price": "28", "description": "Tortilla enroulée avec strips de poulet crispy et sauce maison."},

    # Tacos
    {"name": "Tacos Nugget", "category": "Tacos", "price": "32", "description": "Tacos garni de nuggets, frites, fromage fondu et sauce au choix."},
    {"name": "Tacos Crispy", "category": "Tacos", "price": "34", "description": "Tacos avec strips croustillants, frites, cheddar fondu et sauce."},
    {"name": "Tacos Luxe", "category": "Tacos", "price": "40", "description": "Notre tacos premium avec double garniture, triple fromage et sauce spéciale."},

    # Tacos Gratinés
    {"name": "Tacos Gratiné Carbonara", "category": "Tacos Gratinés", "price": "46", "description": "Tacos gratiné au four avec sauce carbonara crémeuse et fromage doré."},
    {"name": "Tacos Gratiné Fromagère", "category": "Tacos Gratinés", "price": "46", "description": "Tacos gratiné avec triple fromage fondu et sauce fromagère."},
    {"name": "Tacos Gratiné Pizza", "category": "Tacos Gratinés", "price": "46", "description": "Tacos gratiné à la sauce tomate, mozzarella et origan."},

    # Pizza
    {"name": "Pizza Margarita", "category": "Pizza", "price": "22", "description": "La classique: sauce tomate, mozzarella et basilic frais."},
    {"name": "Pizza Pepperoni", "category": "Pizza", "price": "32", "description": "Sauce tomate, mozzarella fondante et pepperoni grillé."},
    {"name": "Pizza Quatre Saisons", "category": "Pizza", "price": "34", "description": "Champignons, olives, poivrons et artichauts sur base tomate-mozzarella."},

    # Pasticcio
    {"name": "Pasticcio Poulet", "category": "Pasticcio", "price": "30", "description": "Pâtes gratinées au four avec poulet, béchamel et fromage doré."},
    {"name": "Pasticcio Crispy", "category": "Pasticcio", "price": "34", "description": "Pâtes gratinées au four avec strips crispy et sauce fromagère."},

    # Salades
    {"name": "Green Salade", "category": "Salades", "price": "23", "description": "Salade verte fraîche avec vinaigrette légère."},
    {"name": "Salade Italienne", "category": "Salades", "price": "25", "description": "Salade méditerranéenne avec tomates, mozzarella et basilic."},
    {"name": "Crispy Salade", "category": "Salades", "price": "28", "description": "Salade fraîche garnie de strips de poulet croustillants."},

    # Boissons
    {"name": "Pepsi 33cl", "category": "Boissons", "price": "10", "description": "Canette Pepsi fraîche."},
    {"name": "Pepsi 1L", "category": "Boissons", "price": "18", "description": "Bouteille Pepsi 1 litre."},
    {"name": "Eau minérale", "category": "Boissons", "price": "5", "description": "Eau minérale naturelle."},
]

print(f"Seeding {len(dishes)} dishes...")
for i, d in enumerate(dishes):
    r = requests.post(f"{BASE_URL}/dishes/", data=d, headers=headers)
    if r.status_code == 200:
        print(f"  [{i+1}/{len(dishes)}] OK {d['name']}")
    else:
        print(f"  [{i+1}/{len(dishes)}] FAIL {d['name']} - {r.text}")

print(f"\nDone! {len(dishes)} dishes seeded for I Want Crispy.")
print(f"   Frontend: http://localhost:5173/iwantcrispy")
print(f"   Admin:    http://localhost:5174 (admin@iwantcrispy.ma / crispy2026)")
