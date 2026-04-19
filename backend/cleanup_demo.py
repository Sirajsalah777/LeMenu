import sqlite3

def cleanup():
    conn = sqlite3.connect('menu_v2.db')
    cursor = conn.cursor()
    
    # 1. Get IDs of restaurants to delete
    cursor.execute("SELECT id FROM restaurants WHERE slug IN ('al-mounia', 'tokyo-sushi')")
    ids = [row[0] for row in cursor.fetchall()]
    
    if ids:
        # 2. Delete dishes belonging to these restaurants
        placeholders = ','.join(['?'] * len(ids))
        cursor.execute(f"DELETE FROM dishes WHERE restaurant_id IN ({placeholders})", ids)
        
        # 3. Delete the restaurants
        cursor.execute(f"DELETE FROM restaurants WHERE id IN ({placeholders})", ids)
        
        print(f"Deleted restaurants with IDs: {ids} and their dishes.")
    else:
        print("No restaurants found with slugs 'al-mounia' or 'tokyo-sushi'.")
        
    conn.commit()
    conn.close()
    print("Cleanup complete.")

if __name__ == "__main__":
    cleanup()
