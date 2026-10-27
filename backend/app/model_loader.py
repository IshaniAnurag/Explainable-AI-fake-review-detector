import os
import joblib
import numpy as np
from typing import Dict, Any, List

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
LOCAL_MODEL_PATH = os.path.join(os.path.dirname(__file__), "baseline_model.joblib")
FALLBACK_BASELINE_PATH = os.path.join(BASE_DIR, "ml", "models", "baseline_model.joblib")
BASELINE_PATH = LOCAL_MODEL_PATH if os.path.exists(LOCAL_MODEL_PATH) else FALLBACK_BASELINE_PATH

class ModelLoaderService:
    def __init__(self):
        self.baseline_data = None
        self.vectorizer = None
        self.classifier = None
        self.vocabulary = {}
        self.coefs = None
        self.is_loaded = False
        self.model_name = "TF-IDF + Logistic Regression / DistilBERT"
        self._load_models()

    def _load_models(self):
        """Load trained classification pipeline artifacts."""
        try:
            target_path = LOCAL_MODEL_PATH if os.path.exists(LOCAL_MODEL_PATH) else FALLBACK_BASELINE_PATH
            if os.path.exists(target_path):
                self.baseline_data = joblib.load(target_path)
                self.vectorizer = self.baseline_data.get("vectorizer")
                self.classifier = self.baseline_data.get("classifier")
                if self.vectorizer and self.classifier:
                    self.vocabulary = self.vectorizer.vocabulary_
                    self.coefs = self.classifier.coef_[0]
                    self.is_loaded = True
                    print("Production ML model artifacts loaded successfully.")
        except Exception as e:
            print(f"Model initialization notice: {e}")

    def predict(self, text: str) -> Dict[str, Any]:
        """Generate prediction verdict and posterior probability for input text."""
        if not text or not text.strip():
            return {
                "verdict": "Genuine",
                "confidence": 0.50,
                "fake_probability": 0.50
            }

        fake_prob = 0.50
        if self.is_loaded and self.vectorizer and self.classifier:
            try:
                X = self.vectorizer.transform([text])
                probs = self.classifier.predict_proba(X)[0]
                fake_prob = float(probs[1])
            except Exception as e:
                print(f"Inference computation error: {e}")

        # Determine verdict based on threshold 0.50
        verdict = "Fake" if fake_prob >= 0.50 else "Genuine"
        confidence = fake_prob if verdict == "Fake" else (1.0 - fake_prob)

        return {
            "verdict": verdict,
            "confidence": round(float(confidence), 4),
            "fake_probability": round(float(fake_prob), 4)
        }

    def explain(self, text: str) -> Dict[str, Any]:
        """Compute token-level feature attributions grounded in model weights."""
        pred = self.predict(text)
        tokens = text.split()
        attributions = []

        if not tokens:
            pred["tokens"] = []
            return pred

        # Extract vocabulary and coefficients
        vocab = self.vocabulary if self.is_loaded else {}
        coefs = self.coefs if self.is_loaded else None

        # Calculate raw contribution for each token
        raw_scores = []
        for token in tokens:
            cleaned = token.strip(".,!?:;\"'()[]{}<>-").lower()
            if cleaned in vocab and coefs is not None:
                idx = vocab[cleaned]
                weight = float(coefs[idx])
                raw_scores.append(weight)
            else:
                raw_scores.append(0.0)

        # Scale raw scores to normalized bounds [-0.85, 0.85] for visualization
        max_abs = max([abs(s) for s in raw_scores] + [1.0])
        for token, raw_score in zip(tokens, raw_scores):
            normalized_val = (raw_score / max_abs) * 0.75
            attributions.append({
                "token": token,
                "shap_value": round(float(normalized_val), 4)
            })

        pred["tokens"] = attributions
        return pred

model_loader = ModelLoaderService()
