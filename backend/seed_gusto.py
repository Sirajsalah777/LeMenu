import requests

BASE_URL = "http://localhost:8000/api"

# 1. Create Gusto restaurant
print("Creating Gusto l'Italien Autrement...")
res = requests.post(f"{BASE_URL}/restaurants/", json={
    "name": "Gusto l'Italien Autrement",
    "slug": "gusto",
    "email": "admin@gusto-temara.ma",
    "password": "gusto2026",
    "theme_color": "#2D5F2D",
    "address": "Lot n3, Quartier Oulad M'Taa, Temara, Maroc",
    "phone": "+212 5 37 00 00 00"
})
print("Restaurant:", res.text)

# 2. Login
print("Logging in...")
login_res = requests.post(f"{BASE_URL}/auth/login", data={
    "username": "admin@gusto-temara.ma",
    "password": "gusto2026"
})
token = login_res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("Logged in OK")

# 3. Seed the Italian menu
dishes = [
    # Antipasti / Entrees
    {"name": "Bruschetta Classica", "category": "Antipasti", "price": "35", "description": "Toasts croustillants garnis de tomates fraiches, basilic, ail et huile d'olive extra vierge."},
    {"name": "Carpaccio di Manzo", "category": "Antipasti", "price": "65", "description": "Fines tranches de boeuf cru, roquette, parmesan et vinaigrette au citron."},
    {"name": "Calamari Fritti", "category": "Antipasti", "price": "55", "description": "Calamars frits dores et croustillants, servis avec sauce tartare maison."},
    {"name": "Caprese", "category": "Antipasti", "price": "45", "description": "Mozzarella di Bufala, tomates coeur de boeuf, basilic frais et reduction balsamique."},
    {"name": "Soupe Minestrone", "category": "Antipasti", "price": "30", "description": "Soupe traditionnelle italienne aux legumes de saison et pates."},

    # Pizzas
    {"name": "Pizza Margherita", "category": "Pizzas", "price": "45", "description": "Sauce tomate San Marzano, mozzarella fior di latte, basilic frais. La classique intemporelle."},
    {"name": "Pizza Quattro Formaggi", "category": "Pizzas", "price": "65", "description": "Mozzarella, gorgonzola, parmesan et chevre sur base creme fraiche."},
    {"name": "Pizza Diavola", "category": "Pizzas", "price": "55", "description": "Sauce tomate, mozzarella, pepperoni piquant et piments rouges."},
    {"name": "Pizza Calzone", "category": "Pizzas", "price": "60", "description": "Pizza pliee farcie au jambon, champignons, mozzarella et oeuf."},
    {"name": "Pizza Vegetariana", "category": "Pizzas", "price": "50", "description": "Poivrons grilles, champignons, olives, artichauts et mozzarella."},
    {"name": "Pizza Tonno", "category": "Pizzas", "price": "55", "description": "Thon, oignons rouges, olives noires et capres sur base tomate."},
    {"name": "Pizza Truffle", "category": "Pizzas", "price": "85", "description": "Creme de truffe noire, mozzarella, champignons et roquette. Notre pizza premium."},

    # Pates / Pasta
    {"name": "Spaghetti Bolognese", "category": "Pates", "price": "50", "description": "Spaghetti al dente avec sauce bolognaise traditionnelle mijoitee pendant 4 heures."},
    {"name": "Penne Arrabiata", "category": "Pates", "price": "45", "description": "Penne rigate, sauce tomate piquante a l'ail et piment rouge."},
    {"name": "Tagliatelle Carbonara", "category": "Pates", "price": "55", "description": "Tagliatelle fraiches, pancetta croustillante, oeuf, parmesan et poivre noir."},
    {"name": "Lasagne al Forno", "category": "Pates", "price": "60", "description": "Lasagnes maison gratinees au four, bechamel onctueuse et ragout de viande."},
    {"name": "Risotto ai Funghi", "category": "Pates", "price": "65", "description": "Risotto cremeux aux champignons sauvages, parmesan et truffe."},
    {"name": "Ravioli Ricotta Epinards", "category": "Pates", "price": "60", "description": "Ravioli faits maison farcis ricotta et epinards, sauce beurre sauge."},
    {"name": "Penne al Salmone", "category": "Pates", "price": "70", "description": "Penne au saumon fume, creme fraiche, aneth et zeste de citron."},

    # Viandes & Poissons
    {"name": "Escalope Milanese", "category": "Viandes & Poissons", "price": "75", "description": "Escalope de veau panee a la milanaise, servie avec spaghetti sauce tomate."},
    {"name": "Saltimbocca alla Romana", "category": "Viandes & Poissons", "price": "85", "description": "Veau enveloppe de prosciutto et sauge, sauce au vin blanc."},
    {"name": "Supremes de Poulet Parmigiana", "category": "Viandes & Poissons", "price": "70", "description": "Poulet pane gratine au parmesan, sauce tomate et mozzarella fondante."},
    {"name": "Saumon Grille", "category": "Viandes & Poissons", "price": "90", "description": "Filet de saumon grille, puree de patates douces et legumes du jardin."},
    {"name": "Osso Buco", "category": "Viandes & Poissons", "price": "95", "description": "Jarret de veau braise lentement avec gremolata, servi avec risotto safrane."},

    # Salades
    {"name": "Salade Cesar", "category": "Salades", "price": "45", "description": "Romaine, poulet grille, croutons, parmesan et sauce cesar maison."},
    {"name": "Salade Nicoise", "category": "Salades", "price": "50", "description": "Thon, haricots verts, olives, oeufs, tomates et anchois."},
    {"name": "Salade Roquette Parmesan", "category": "Salades", "price": "40", "description": "Roquette fraiche, copeaux de parmesan, tomates sechees et pignons grilles."},

    # Desserts
    {"name": "Tiramisu", "category": "Desserts", "price": "40", "description": "Le classique italien: mascarpone, cafe, biscuits Savoiardi et cacao amer."},
    {"name": "Panna Cotta", "category": "Desserts", "price": "35", "description": "Creme onctueuse a la vanille bourbon, coulis de fruits rouges."},
    {"name": "Fondant al Cioccolato", "category": "Desserts", "price": "45", "description": "Fondant au chocolat noir 70% au coeur coulant, glace vanille."},
    {"name": "Gelato Artigianale", "category": "Desserts", "price": "30", "description": "Glace artisanale italienne - 3 boules au choix: vanille, chocolat, pistache, fraise."},

    # Boissons
    {"name": "Limonata Fresca", "category": "Boissons", "price": "25", "description": "Citronnade fraiche maison avec menthe et gingembre."},
    {"name": "Espresso Italiano", "category": "Boissons", "price": "15", "description": "Espresso pur arabica, torrefaction italienne."},
    {"name": "Eau San Pellegrino", "category": "Boissons", "price": "20", "description": "Eau minerale petillante italienne, 75cl."},
    {"name": "Jus d'Orange Frais", "category": "Boissons", "price": "25", "description": "Jus d'oranges fraiches pressees a la minute."},
]

print(f"Seeding {len(dishes)} dishes...")
for i, d in enumerate(dishes):
    r = requests.post(f"{BASE_URL}/dishes/", data=d, headers=headers)
    if r.status_code == 200:
        print(f"  [{i+1}/{len(dishes)}] OK {d['name']}")
    else:
        print(f"  [{i+1}/{len(dishes)}] FAIL {d['name']} - {r.text}")

print(f"\nDone! {len(dishes)} dishes seeded for Gusto.")
print(f"   Frontend: http://localhost:5173/gusto")
print(f"   Admin:    http://localhost:5174 (admin@gusto-temara.ma / gusto2026)")
