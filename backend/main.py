from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import restaurants, dishes, media, tables, auth, analytics
import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Menu3D API")

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
