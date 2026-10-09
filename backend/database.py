import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_DIR = BASE_DIR / "database"
DATABASE_DIR.mkdir(parents=True, exist_ok=True)
DATABASE_NAME = str(DATABASE_DIR / "finpilot.db")


def get_connection():
    connection = sqlite3.connect(DATABASE_NAME)
    connection.row_factory = sqlite3.Row
    return connection

def create_tables():

    connection = get_connection()

    cursor = connection.cursor()

    # ==========================
    # Users Table
    # ==========================

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        full_name TEXT NOT NULL,

        email TEXT UNIQUE NOT NULL,

        password TEXT NOT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    )
    """)

    # ==========================
    # Income Table
    # ==========================

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS income (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER,

        source TEXT,

        amount REAL,

        date TEXT,

        FOREIGN KEY(user_id) REFERENCES users(id)

    )
    """)

    # ==========================
    # Expense Table
    # ==========================

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS expenses (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER,

        category TEXT,

        amount REAL,

        date TEXT,

        notes TEXT,

        FOREIGN KEY(user_id) REFERENCES users(id)

    )
    """)

    # ==========================
    # Budget Table
    # ==========================

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS budgets (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER,

        category TEXT,

        limit_amount REAL,

        FOREIGN KEY(user_id) REFERENCES users(id)

    )
    """)

        # ==========================
    # Goals Table
    # ==========================

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS goals (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER,

        goal_name TEXT NOT NULL,

        target_amount REAL NOT NULL,

        saved_amount REAL DEFAULT 0,

        target_date TEXT,

        FOREIGN KEY(user_id) REFERENCES users(id)

    )
    """)

    connection.commit()

    connection.close()