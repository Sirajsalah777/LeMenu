from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from pydantic import BaseModel
from auth import get_current_restaurant, get_password_hash

router = APIRouter(prefix="/restaurants", tags=["restaurants"])

class RestaurantCreate(BaseModel):
    name: str
    slug: str
    email: str
    password: str
    logo_url: str = None
    theme_color: str = "#185FA5"
    address: str = None
    phone: str = None

@router.post("/")
def create_restaurant(rest: RestaurantCreate, db: Session = Depends(get_db)):
    # Check if slug or email exists
    if db.query(models.Restaurant).filter(models.Restaurant.slug == rest.slug).first():
        raise HTTPException(400, "Slug already taken")
    if db.query(models.Restaurant).filter(models.Restaurant.email == rest.email).first():
        raise HTTPException(400, "Email already taken")
        
    db_rest = models.Restaurant(
        name=rest.name,
        slug=rest.slug,
        email=rest.email,
        hashed_password=get_password_hash(rest.password),
        logo_url=rest.logo_url,
        theme_color=rest.theme_color,
        address=rest.address,
        phone=rest.phone
    )
    db.add(db_rest)
    db.commit()
    db.refresh(db_rest)
    return {"id": db_rest.id, "slug": db_rest.slug}

@router.get("/me")
def get_me(current_restaurant: models.Restaurant = Depends(get_current_restaurant)):
    return {
        "id": current_restaurant.id,
        "name": current_restaurant.name,
        "slug": current_restaurant.slug,
        "logo_url": current_restaurant.logo_url,
        "theme_color": current_restaurant.theme_color,
        "address": current_restaurant.address,
        "phone": current_restaurant.phone
    }

@router.get("/{slug}")
def get_restaurant(slug: str, db: Session = Depends(get_db)):
    rest = db.query(models.Restaurant).filter(models.Restaurant.slug == slug).first()
    if not rest:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    dishes = db.query(models.Dish).filter(models.Dish.restaurant_id == rest.id).all()
    
    categories = {}
    for dish in dishes:
        cat = dish.category or "Autres"
        if cat not in categories:
            categories[cat] = []
        categories[cat].append({
            "id": dish.id,
            "name": dish.name,
            "name_ar": dish.name_ar,
            "name_en": dish.name_en,
            "description": dish.description,
            "description_ar": dish.description_ar,
            "description_en": dish.description_en,
            "price": dish.price,
            "is_available": dish.is_available,
            "model_url": dish.model_url,
            "video_url": dish.video_url,
            "photos": dish.photos,
            "allergens": dish.allergens,
            "weight_grams": dish.weight_grams,
            "calories": dish.calories
        })
    return {
        "restaurant": {
            "id": rest.id,
            "name": rest.name,
            "slug": rest.slug,
            "logo_url": rest.logo_url,
            "theme_color": rest.theme_color,
            "address": rest.address,
            "phone": rest.phone
        },
        "dishes_by_category": categories
    }

class RestaurantUpdate(BaseModel):
    name: str = None
    theme_color: str = None
    logo_url: str = None
    password: str = None

@router.put("/me")
def update_restaurant(rest_update: RestaurantUpdate, db: Session = Depends(get_db), current_restaurant: models.Restaurant = Depends(get_current_restaurant)):
    if rest_update.name: current_restaurant.name = rest_update.name
    if rest_update.theme_color: current_restaurant.theme_color = rest_update.theme_color
    if rest_update.logo_url: current_restaurant.logo_url = rest_update.logo_url
    if rest_update.password:
        current_restaurant.hashed_password = get_password_hash(rest_update.password)
    
    db.commit()
    db.refresh(current_restaurant)
    return current_restaurant
