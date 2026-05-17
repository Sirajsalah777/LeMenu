from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from database import engine, get_db
from routes import restaurants, dishes, media, tables, auth, analytics
import models
import traceback

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        models.Base.metadata.create_all(bind=engine)
    except Exception as exc:
        logger.warning("create_all ignoré au démarrage: %s", exc)
    yield


app = FastAPI(title="Menu3D API", lifespan=lifespan)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal Server Error",
            "detail": str(exc),
            "traceback": traceback.format_exc()
        }
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/api")
app.include_router(restaurants.router, prefix="/api")
app.include_router(dishes.router, prefix="/api")
app.include_router(media.router, prefix="/api")
app.include_router(tables.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")

@app.get("/")
def root():
    return {"status": "menu3d API running"}

@app.get("/api/health")
def health(db: Session = Depends(get_db)):
    try:
        from sqlalchemy import text
        # Check if restaurants table exists and count
        count = db.execute(text("SELECT count(*) FROM restaurants")).scalar()
        return {"status": "ok", "db": "connected", "restaurants_count": count}
    except Exception as e:
        return {"status": "error", "error": str(e)}
