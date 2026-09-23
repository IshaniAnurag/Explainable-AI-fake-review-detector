import os
import sqlite3
import uuid
from datetime import datetime
from typing import List, Dict, Any

# PHASE 2: In Phase 2 AWS migration, replace this local SQLite storage class 
# with a DynamoDB resource wrapper (boto3.resource('dynamodb').Table('ReviewSubmissions'))

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "submissions.db")

class StorageService:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        """Initialize SQLite database with schema identical to DynamoDB attributes."""
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
        """
        Save submission to persistent storage.
        
        # PHASE 2: DynamoDB PutItem mapping:
        # table.put_item(Item={
        #     'reviewId': review_id,
        #     'reviewText': review_text,
        #     'verdict': verdict,
        #     'confidence': str(confidence),
        #     'timestamp': timestamp
        # })
        """
        review_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat() + "Z"

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO review_submissions (reviewId, reviewText, verdict, confidence, timestamp)
            VALUES (?, ?, ?, ?, ?)
        """, (review_id, review_text, verdict, float(confidence), timestamp))
        conn.commit()
        conn.close()

        return {
            "reviewId": review_id,
            "reviewText": review_text,
            "verdict": verdict,
            "confidence": round(float(confidence), 4),
            "timestamp": timestamp
        }

    def get_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Retrieve recent review submissions.
        
        # PHASE 2: DynamoDB Scan or Query operation:
        # response = table.scan(Limit=limit)
        """
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

# Instantiated storage provider instance
storage_service = StorageService()
