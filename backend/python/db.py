import os
# pyrefly: ignore [missing-import]
from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGOOSE_URL

client: AsyncIOMotorClient = None
db = None

def get_database():
    global client, db
    if db is None and MONGOOSE_URL:
        client = AsyncIOMotorClient(MONGOOSE_URL)
        # Extract default db name or default to 'test' / cluster default
        db = client.get_default_database()
    return db
