from pydantic import BaseModel, Field
from typing import List, Optional

class ReviewInput(BaseModel):
    reviewText: str = Field(..., example="This product broke on day one! Terrible experience.")

class TokenAttribution(BaseModel):
    token: str
    shap_value: float

class PredictResponse(BaseModel):
    reviewId: str
    reviewText: str
    verdict: str  # "Fake" or "Genuine"
    confidence: float  # float between 0.0 and 1.0
    fake_probability: float
    timestamp: str

class ExplainResponse(BaseModel):
    reviewId: str
    reviewText: str
    verdict: str
    confidence: float
    fake_probability: float
    tokens: List[TokenAttribution]
    timestamp: str

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    storage_type: str
    version: str
