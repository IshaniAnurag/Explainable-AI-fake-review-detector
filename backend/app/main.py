from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

from app.schemas import ReviewInput, PredictResponse, ExplainResponse, HealthResponse
from app.model_loader import model_loader
from app.storage import storage_service

# PHASE 2: In Phase 2 AWS migration, wrap this app instance with Mangum:
# from mangum import Mangum
# handler = Mangum(app)

app = FastAPI(
    title="Explainable AI Fake Review Detection API",
    description="Backend API serving DistilBERT predictions, SHAP token attributions, and review logging.",
    version="1.0.0"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint indicating API readiness and model load status."""
    return {
        "status": "healthy",
        "model_loaded": model_loader.is_loaded,
        "storage_type": "SQLite (Phase 1 Local)",  # PHASE 2: swap to "DynamoDB (Phase 2)"
        "version": "1.0.0"
    }

@app.post("/predict", response_model=PredictResponse)
def predict_review(input_data: ReviewInput):
    """Predict whether a review is Genuine or Fake and log submission to persistent storage."""
    if not input_data.reviewText or not input_data.reviewText.strip():
        raise HTTPException(status_code=400, detail="reviewText cannot be empty.")

    res = model_loader.predict(input_data.reviewText)
    saved = storage_service.save_submission(
        review_text=input_data.reviewText,
        verdict=res["verdict"],
        confidence=res["confidence"]
    )

    return {
        "reviewId": saved["reviewId"],
        "reviewText": saved["reviewText"],
        "verdict": saved["verdict"],
        "confidence": saved["confidence"],
        "fake_probability": res["fake_probability"],
        "timestamp": saved["timestamp"]
    }

@app.post("/explain", response_model=ExplainResponse)
def explain_review(input_data: ReviewInput):
    """Generate verdict, confidence, and token-level SHAP attributions for a review."""
    if not input_data.reviewText or not input_data.reviewText.strip():
        raise HTTPException(status_code=400, detail="reviewText cannot be empty.")

    exp = model_loader.explain(input_data.reviewText)
    saved = storage_service.save_submission(
        review_text=input_data.reviewText,
        verdict=exp["verdict"],
        confidence=exp["confidence"]
    )

    return {
        "reviewId": saved["reviewId"],
        "reviewText": saved["reviewText"],
        "verdict": exp["verdict"],
        "confidence": exp["confidence"],
        "fake_probability": exp["fake_probability"],
        "tokens": exp["tokens"],
        "timestamp": saved["timestamp"]
    }

@app.get("/history", response_model=List[Dict[str, Any]])
def get_submission_history(limit: int = 50):
    """Retrieve logged review submissions from storage."""
    return storage_service.get_history(limit=limit)
