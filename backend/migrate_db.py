#!/usr/bin/env python3
"""
Database migration script to add car_make and fuel_consumption fields to the User table.
This script safely adds new columns to existing users with default values.
"""

import sys
import os
from sqlalchemy import create_engine, text, inspect

def migrate_database():
    """Add car_make and fuel_consumption columns to User table if they don't exist"""
    
    # Get database URI from environment or use default
    db_uri = os.getenv('SQLALCHEMY_DATABASE_URI', 'sqlite:///instance/cheapfuel.db')
    
    print(f"Connecting to database: {db_uri}")
    engine = create_engine(db_uri)
    
    try:
        with engine.connect() as conn:
            # Check if table exists
            inspector = inspect(engine)
            if 'user' not in inspector.get_table_names():
                print("ERROR: User table does not exist. Please run the app first to create tables.")
                return False
            
            # Get existing columns
            existing_columns = [col['name'] for col in inspector.get_columns('user')]
            print(f"Existing columns in User table: {existing_columns}")
            
            migrations_applied = []
            
            # Add car_make column if it doesn't exist
            if 'car_make' not in existing_columns:
                print("Adding car_make column...")
                conn.execute(text("ALTER TABLE user ADD COLUMN car_make VARCHAR(100)"))
                conn.commit()
                migrations_applied.append('car_make')
                print("✓ Added car_make column")
            else:
                print("✓ car_make column already exists")
            
            # Add fuel_consumption column if it doesn't exist
            if 'fuel_consumption' not in existing_columns:
                print("Adding fuel_consumption column...")
                conn.execute(text("ALTER TABLE user ADD COLUMN fuel_consumption FLOAT"))
                conn.commit()
                migrations_applied.append('fuel_consumption')
                print("✓ Added fuel_consumption column")
            else:
                print("✓ fuel_consumption column already exists")
            
            # For SQLite, we need to handle the car_model column migration differently
            # SQLite doesn't support modifying columns, so we'll just ensure it exists
            if 'car_model' not in existing_columns:
                print("Adding car_model column (if missing)...")
                conn.execute(text("ALTER TABLE user ADD COLUMN car_model VARCHAR(100)"))
                conn.commit()
                migrations_applied.append('car_model')
                print("✓ Added car_model column")
            else:
                print("✓ car_model column already exists")
            
            if migrations_applied:
                print(f"\n✅ Migration completed successfully! Added columns: {', '.join(migrations_applied)}")
            else:
                print("\n✅ Database is already up to date. No migrations needed.")
            
            # Show updated schema
            inspector = inspect(engine)
            updated_columns = [col['name'] for col in inspector.get_columns('user')]
            print(f"\nUpdated User table columns: {updated_columns}")
            
            return True
            
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("=" * 60)
    print("CheapFuel Database Migration")
    print("=" * 60)
    print("\nThis script will add the following columns to the User table:")
    print("  - car_make (VARCHAR(100))")
    print("  - fuel_consumption (FLOAT)")
    print("\nExisting data will be preserved.\n")
    
    success = migrate_database()
    
    if success:
        print("\n" + "=" * 60)
        print("Migration completed successfully!")
        print("=" * 60)
        sys.exit(0)
    else:
        print("\n" + "=" * 60)
        print("Migration failed. Please check the errors above.")
        print("=" * 60)
        sys.exit(1)

