from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from database import get_db
import models
from pydantic import BaseModel
from typing import List
import json
from auth import get_current_restaurant

router = APIRouter(prefix="/dishes", tags=["dishes"])

@router.get("/restaurant/{restaurant_id}")
def list_dishes(restaurant_id: int, db: Session = Depends(get_db)):
    dishes = db.query(models.Dish).filter(models.Dish.restaurant_id == restaurant_id).order_by(models.Dish.sort_order).all()
    return dishes

@router.post("/")
def create_dish(
    name: str = Form(...),
    name_ar: str = Form(None),
    name_en: str = Form(None),
    description: str = Form(None),
    description_ar: str = Form(None),
    description_en: str = Form(None),
    price: float = Form(...),
    category: str = Form(...),
    allergens: str = Form("[]"),
    weight_grams: int = Form(None),
    calories: int = Form(None),
    photos: str = Form("[]"),
    video_url: str = Form(None),
    model_url: str = Form(None),
    db: Session = Depends(get_db),
    current_restaurant: models.Restaurant = Depends(get_current_restaurant)
):
    try:
        allergens_list = json.loads(allergens)
    except:
        allergens_list = []
        
    try:
        photos_list = json.loads(photos)
    except:
        photos_list = []
    
    db_dish = models.Dish(
        restaurant_id=current_restaurant.id,
        name=name,
        name_ar=name_ar,
        name_en=name_en,
        description=description,
        description_ar=description_ar,
        description_en=description_en,
        price=price,
        category=category,
        allergens=allergens_list,
        weight_grams=weight_grams,
        calories=calories,
        photos=photos_list,
        video_url=video_url,
        model_url=model_url
    )
    db.add(db_dish)
    db.commit()
    db.refresh(db_dish)
    return db_dish

@router.delete("/{dish_id}")
def delete_dish(dish_id: int, db: Session = Depends(get_db), current_restaurant: models.Restaurant = Depends(get_current_restaurant)):
    db_dish = db.query(models.Dish).filter(models.Dish.id == dish_id, models.Dish.restaurant_id == current_restaurant.id).first()
    if not db_dish:
        raise HTTPException(status_code=404, detail="Not found or unauthorized")
    db.delete(db_dish)
    db.commit()
    return {"ok": True}

@router.patch("/{dish_id}/toggle")
def toggle_dish(dish_id: int, db: Session = Depends(get_db), current_restaurant: models.Restaurant = Depends(get_current_restaurant)):
    db_dish = db.query(models.Dish).filter(models.Dish.id == dish_id, models.Dish.restaurant_id == current_restaurant.id).first()
    if not db_dish:
        raise HTTPException(status_code=404, detail="Not found or unauthorized")
    db_dish.is_available = not db_dish.is_available
    db.commit()
    return {"is_available": db_dish.is_available}

class ReorderItem(BaseModel):
    id: int
    sort_order: int

@router.patch("/reorder")
def reorder_dishes(items: List[ReorderItem], db: Session = Depends(get_db), current_restaurant: models.Restaurant = Depends(get_current_restaurant)):
    for item in items:
        db.query(models.Dish).filter(models.Dish.id == item.id, models.Dish.restaurant_id == current_restaurant.id).update({"sort_order": item.sort_order})
    db.commit()
    return {"ok": True}

@router.put("/{dish_id}")
def update_dish(dish_id: int, req: dict, db: Session = Depends(get_db), current_restaurant: models.Restaurant = Depends(get_current_restaurant)):
    db_dish = db.query(models.Dish).filter(models.Dish.id == dish_id, models.Dish.restaurant_id == current_restaurant.id).first()
    if not db_dish:
        raise HTTPException(status_code=404, detail="Not found or unauthorized")
    for key, value in req.items():
        if key != "restaurant_id":
            setattr(db_dish, key, value)
    db.commit()
    db.refresh(db_dish)
    return db_dish
