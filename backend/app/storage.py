import os
import sqlite3
import uuid
from datetime import datetime
from typing import List, Dict, Any

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "submissions.db")
USE_DYNAMODB = os.getenv("USE_DYNAMODB", "false").lower() == "true"
DYNAMODB_TABLE_NAME = os.getenv("DYNAMODB_TABLE", "AnalysisHistory")

class StorageService:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self.use_dynamodb = USE_DYNAMODB
        self.table = None

        if self.use_dynamodb:
            try:
                import boto3
                dynamodb = boto3.resource('dynamodb')
                self.table = dynamodb.Table(DYNAMODB_TABLE_NAME)
                print(f"DynamoDB storage initialized on table: {DYNAMODB_TABLE_NAME}")
            except Exception as e:
                print(f"DynamoDB connection warning (falling back to SQLite): {e}")
                self.use_dynamodb = False

        if not self.use_dynamodb:
            self._init_sqlite()

    def _init_sqlite(self):
        """Initialize SQLite database with schema matching DynamoDB attributes."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS review_submissions (
                reviewId TEXT PRIMARY KEY,
                reviewText TEXT NOT NULL,
                verdict TEXT NOT NULL,
                confidence REAL NOT NULL,
                timestamp TEXT NOT NULL
            )
        """)
        conn.commit()
        conn.close()

    def save_submission(self, review_text: str, verdict: str, confidence: float) -> Dict[str, Any]:
        """Save review submission to DynamoDB in production or SQLite in local development."""
        review_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat() + "Z"
        record = {
            "reviewId": review_id,
            "reviewText": review_text,
            "verdict": verdict,
            "confidence": round(float(confidence), 4),
            "timestamp": timestamp
        }

        if self.use_dynamodb and self.table:
            try:
                self.table.put_item(Item={
                    "reviewId": review_id,
                    "reviewText": review_text,
                    "verdict": verdict,
                    "confidence": str(confidence),
                    "timestamp": timestamp
                })
                return record
            except Exception as e:
                print(f"DynamoDB PutItem error: {e}")

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO review_submissions (reviewId, reviewText, verdict, confidence, timestamp)
            VALUES (?, ?, ?, ?, ?)
        """, (review_id, review_text, verdict, float(confidence), timestamp))
        conn.commit()
        conn.close()

        return record

    def get_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve recent review submissions from storage."""
        if self.use_dynamodb and self.table:
            try:
                response = self.table.scan(Limit=limit)
                items = response.get('Items', [])
                for item in items:
                    if 'confidence' in item:
                        item['confidence'] = float(item['confidence'])
                return sorted(items, key=lambda x: x.get('timestamp', ''), reverse=True)
            except Exception as e:
                print(f"DynamoDB scan error: {e}")

        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("""
            SELECT reviewId, reviewText, verdict, confidence, timestamp 
            FROM review_submissions 
            ORDER BY timestamp DESC 
            LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()
        conn.close()

        return [dict(row) for row in rows]

# Instantiated storage provider
storage_service = StorageService()
