from sqlalchemy import Column, Integer, String, Boolean, JSON, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Restaurant(Base):
    __tablename__ = "restaurants"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    slug = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    theme_color = Column(String, nullable=True)
    address = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    dishes = relationship("Dish", back_populates="restaurant")
    tables = relationship("Table", back_populates="restaurant")

class Dish(Base):
    __tablename__ = "dishes"
    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    name = Column(String, index=True)
    name_ar = Column(String, nullable=True)
    name_en = Column(String, nullable=True)
    description = Column(String, nullable=True)
    description_ar = Column(String, nullable=True)
    description_en = Column(String, nullable=True)
    price = Column(Float)
    category = Column(String, index=True)
    is_available = Column(Boolean, default=True)
    model_url = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    photos = Column(JSON, default=[])
    allergens = Column(JSON, default=[])
    weight_grams = Column(Integer, nullable=True)
    calories = Column(Integer, nullable=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    restaurant = relationship("Restaurant", back_populates="dishes")

class AnalyticEvent(Base):
    __tablename__ = "analytic_events"
    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    event_type = Column(String)  # 'scan', 'dish_view', 'ar_view'
    target_id = Column(String, nullable=True) # dish_id if event_type is dish_view
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Table(Base):
    __tablename__ = "tables"
    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    table_number = Column(Integer)
    qr_code_url = Column(String, nullable=True)
    
    restaurant = relationship("Restaurant", back_populates="tables")
