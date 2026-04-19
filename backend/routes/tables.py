from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
from pydantic import BaseModel
import qrcode
import os

router = APIRouter(prefix="/tables", tags=["tables"])

class GenerateTableReq(BaseModel):
    count: int

@router.post("/restaurant/{restaurant_id}/generate")
def generate_tables(restaurant_id: int, req: GenerateTableReq, db: Session = Depends(get_db)):
    rest = db.query(models.Restaurant).filter(models.Restaurant.id == restaurant_id).first()
    slug = rest.slug if rest else f"rest_{restaurant_id}"
    
    tables_created = []
    
    for i in range(1, req.count + 1):
        url = f"https://menu3d.app/{slug}?table={i}"
        img = qrcode.make(url)
        path = f"uploads/qr_{restaurant_id}_table_{i}.png"
        img.save(path)
        qr_url = f"http://localhost:8000/{path}"
        
        db_table = db.query(models.Table).filter(models.Table.restaurant_id == restaurant_id, models.Table.table_number == i).first()
        if not db_table:
            db_table = models.Table(restaurant_id=restaurant_id, table_number=i, qr_code_url=qr_url)
            db.add(db_table)
        else:
            db_table.qr_code_url = qr_url
        tables_created.append({"table_number": i, "qr_code_url": qr_url})
        
    db.commit()
    return tables_created
