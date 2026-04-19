from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models
from auth import get_current_restaurant
from datetime import datetime, timedelta

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.post("/log")
def log_event(
    event_type: str, 
    restaurant_id: int, 
    target_id: str = None, 
    db: Session = Depends(get_db)
):
    event = models.AnalyticEvent(
        restaurant_id=restaurant_id,
        event_type=event_type,
        target_id=target_id
    )
    db.add(event)
    db.commit()
    return {"ok": True}

@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db), 
    current_restaurant: models.Restaurant = Depends(get_current_restaurant)
):
    # Today's scans
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    scans_today = db.query(models.AnalyticEvent).filter(
        models.AnalyticEvent.restaurant_id == current_restaurant.id,
        models.AnalyticEvent.event_type == 'scan',
        models.AnalyticEvent.created_at >= today_start
    ).count()

    # Total scans
    total_scans = db.query(models.AnalyticEvent).filter(
        models.AnalyticEvent.restaurant_id == current_restaurant.id,
        models.AnalyticEvent.event_type == 'scan'
    ).count()

    # Top Dishes (views)
    top_dishes = db.query(
        models.AnalyticEvent.target_id, 
        func.count(models.AnalyticEvent.id).label('view_count')
    ).filter(
        models.AnalyticEvent.restaurant_id == current_restaurant.id,
        models.AnalyticEvent.event_type == 'dish_view'
    ).group_by(models.AnalyticEvent.target_id).order_by(func.count(models.AnalyticEvent.id).desc()).limit(5).all()

    dish_stats = []
    for target_id, count in top_dishes:
        dish = db.query(models.Dish).filter(models.Dish.id == int(target_id)).first()
        if dish:
            dish_stats.append({
                "name": dish.name,
                "views": count
            })

    return {
        "scans_today": scans_today,
        "total_scans": total_scans,
        "top_dishes": dish_stats
    }
