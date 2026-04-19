import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Determine default SQLite path: use /tmp on Vercel, else local directory
default_sqlite_path = "sqlite:////tmp/menu_v2.db" if os.getenv("VERCEL") else "sqlite:///./menu_v2.db"
DATABASE_URL = os.getenv("DATABASE_URL", default_sqlite_path)

engine_args = {}
if "sqlite" in DATABASE_URL:
    engine_args["connect_args"] = {"check_same_thread": False}
elif "postgres" in DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    # SQLAlchemy requires postgresql:// instead of postgres://
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
