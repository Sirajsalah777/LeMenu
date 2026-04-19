import sqlite3

def migrate():
    conn = sqlite3.connect('menu_v2.db')
    cursor = conn.cursor()
    
    # Add new columns to dishes
    columns_to_add = [
        ('name_ar', 'TEXT'),
        ('name_en', 'TEXT'),
        ('description_ar', 'TEXT'),
        ('description_en', 'TEXT')
    ]
    
    for col_name, col_type in columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE dishes ADD COLUMN {col_name} {col_type}")
            print(f"Added column {col_name} to dishes table.")
        except sqlite3.OperationalError:
            print(f"Column {col_name} already exists in dishes table.")

    # Create analytic_events table if not exists
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS analytic_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        restaurant_id INTEGER,
        event_type TEXT,
        target_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
    )
    """)
    print("Ensured analytic_events table exists.")
    
    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
