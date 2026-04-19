import requests

BASE_URL = "http://localhost:8000/api"

print("1. Seed Restaurant Multi-Tenant Accounts...")
res1 = requests.post(f"{BASE_URL}/restaurants/", json={
    "name": "Restaurant Al Mounia",
    "slug": "al-mounia",
    "email": "almounia@menu3d.com",
    "password": "password123",
    "theme_color": "#8B5E3C",
    "address": "Casablanca, Maroc",
    "phone": "+212 6 00 00 00 00"
})
print("Resto 1:", res1.text)
try:
    print("JSON:", res1.json())
except:
    pass

res2 = requests.post(f"{BASE_URL}/restaurants/", json={
    "name": "Tokyo Sushi",
    "slug": "tokyo-sushi",
    "email": "tokyo@menu3d.com",
    "password": "password123",
    "theme_color": "#D32F2F",
    "address": "Paris, France",
    "phone": "+33 1 00 00 00 00"
})
print("Resto 2:", res2.json())

# 2. Login to get JWT for Al Mounia
print("2. Login to get Auth token...")
login_res = requests.post(f"{BASE_URL}/auth/login", data={
    "username": "almounia@menu3d.com",
    "password": "password123"
})
token = login_res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

print("3. Add secured dishes to Al Mounia...")
dishes = [
    {
        "name": "Tajine d'agneau aux pruneaux",
        "category": "Plats",
        "price": "145",
        "description": "Un tajine traditionnel marocain.",
        "allergens": '["Fruits à coque"]',
        "weight_grams": "320",
        "calories": "580"
    },
    {
        "name": "Couscous royal",
        "category": "Plats",
        "price": "175",
        "description": "Le couscous marocain par excellence."
    }
]

for d in dishes:
    r = requests.post(f"{BASE_URL}/dishes/", data=d, headers=headers)
    print(r.json())

print("Seeding Complete!")
