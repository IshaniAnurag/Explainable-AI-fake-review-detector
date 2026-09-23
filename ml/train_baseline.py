import os
import json
import pandas as pd
import numpy as np
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix
)

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

TRAIN_PATH = os.path.join(DATA_DIR, "train.csv")
TEST_PATH = os.path.join(DATA_DIR, "test.csv")
MODEL_OUTPUT_PATH = os.path.join(MODELS_DIR, "baseline_model.joblib")
METRICS_OUTPUT_PATH = os.path.join(MODELS_DIR, "baseline_metrics.json")

def train_and_evaluate():
    if not os.path.exists(TRAIN_PATH) or not os.path.exists(TEST_PATH):
        raise FileNotFoundError("Train or test CSV files missing! Run data_loader.py first.")

    print("Loading train and test datasets for baseline training...")
    train_df = pd.read_csv(TRAIN_PATH)
    test_df = pd.read_csv(TEST_PATH)

    train_texts = train_df['cleaned_text'].fillna('').tolist()
    train_labels = train_df['binary_label'].values

    test_texts = test_df['cleaned_text'].fillna('').tolist()
    test_labels = test_df['binary_label'].values

    print(f"Training set size: {len(train_texts)}, Test set size: {len(test_texts)}")

    print("Fitting TF-IDF Vectorizer (max_features=5000, ngram_range=(1, 2))...")
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    X_train = vectorizer.fit_transform(train_texts)
    X_test = vectorizer.transform(test_texts)

    print("Training Logistic Regression model...")
    clf = LogisticRegression(max_iter=1000, random_state=42)
    clf.fit(X_train, train_labels)

    print("Evaluating baseline model on held-out test set...")
    preds = clf.predict(X_test)
    probs = clf.predict_proba(X_test)[:, 1]

    acc = accuracy_score(test_labels, preds)
    prec = precision_score(test_labels, preds, zero_division=0)
    rec = recall_score(test_labels, preds, zero_division=0)
    f1 = f1_score(test_labels, preds, zero_division=0)
    roc_auc = roc_auc_score(test_labels, probs)
    cm = confusion_matrix(test_labels, preds).tolist()

    metrics = {
        "model_type": "TF-IDF + Logistic Regression",
        "max_features": 5000,
        "ngram_range": [1, 2],
        "test_metrics": {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(roc_auc), 4),
            "confusion_matrix": cm  # [[TN, FP], [FN, TP]]
        }
    }

    print("\n--- BASELINE MODEL RESULTS ---")
    print(json.dumps(metrics, indent=2))

    # Save model artifacts
    joblib.dump({"vectorizer": vectorizer, "classifier": clf}, MODEL_OUTPUT_PATH)
    with open(METRICS_OUTPUT_PATH, 'w') as f:
        json.dump(metrics, f, indent=2)

    print(f"\nSaved baseline model to {MODEL_OUTPUT_PATH}")
    print(f"Saved baseline metrics to {METRICS_OUTPUT_PATH}")

if __name__ == "__main__":
    train_and_evaluate()
