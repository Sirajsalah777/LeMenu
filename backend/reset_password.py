"""
Réinitialise le mot de passe admin d'un restaurant (colonne hashed_password).

Prérequis : DATABASE_URL pointant vers la même base que la prod (ex. chaîne Postgres Supabase).
Fichier .env à la racine de backend/ ou variable d'environnement.

Usage:
  cd backend
  python reset_password.py admin@gusto-temara.ma "MonNouveauMotDePasse"
"""
import argparse
import sys

from dotenv import load_dotenv

load_dotenv()

from database import SessionLocal
import models
from auth import get_password_hash


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Réinitialiser le mot de passe (bcrypt) d'un restaurant par email."
    )
    parser.add_argument("email", help="Email du restaurant (login admin)")
    parser.add_argument("password", help="Nouveau mot de passe en clair")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        r = (
            db.query(models.Restaurant)
            .filter(models.Restaurant.email == args.email)
            .first()
        )
        if not r:
            print(f"Aucun restaurant avec l'email {args.email!r}.", file=sys.stderr)
            sys.exit(1)
        r.hashed_password = get_password_hash(args.password)
        db.commit()
        print(f"OK — mot de passe mis à jour pour « {r.name} » ({args.email}).")
    finally:
        db.close()


if __name__ == "__main__":
    main()
