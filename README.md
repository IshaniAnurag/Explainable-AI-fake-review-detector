# An Explainable AI Framework for Detecting Fake E-Commerce Reviews

An end-to-end Explainable AI (XAI) solution that classifies e-commerce reviews as **Genuine** or **Fake** using fine-tuned `distilbert-base-uncased` alongside a TF-IDF + Logistic Regression baseline. Provides token-level attribution highlights powered by **SHAP (SHapley Additive exPlanations)** and delivers an interactive React frontend and FastAPI backend.

## System Architecture (Phase 1 — Zero AWS)

```
[ User Review Text ]
        │
        ▼
[ React Frontend (Vite + Tailwind) ] ── (POST /predict & /explain) ──► [ FastAPI Backend ]
                                                                             │
                                              ┌──────────────────────────────┴──────────────────────────────┐
                                              ▼                                                             ▼
                                 [ Fine-Tuned DistilBERT + SHAP Explainer ]                 [ SQLite Storage Abstraction ]
                                 (Predicts label & extracts token attributions)            (Logs reviewId, verdict, confidence)
```

## Directory Structure

```
fake-review-xai/
├── ml/
│   ├── data/                # Processed datasets (gitignored)
│   ├── models/              # Baseline & DistilBERT weights + SHAP examples
│   ├── data_loader.py       # Dataset download & cleaning pipeline
│   ├── train_baseline.py    # TF-IDF + Logistic Regression baseline
│   ├── train_distilbert.py  # DistilBERT fine-tuning script
│   ├── explain.py           # SHAP token attribution generator
│   └── requirements.txt     # Python ML dependencies
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application routes
│   │   ├── model_loader.py   # DistilBERT model & SHAP inference loader
│   │   ├── storage.py       # Modular database interface (SQLite -> DynamoDB ready)
│   │   └── schemas.py       # Pydantic data schemas
│   └── requirements.txt     # Backend web server dependencies
├── frontend/                # React (Vite) + Tailwind CSS + Framer Motion UI
├── docs/
│   └── PROJECT-CONTENT-DUMP.md   # Final complete project documentation deliverable
├── .gitignore
└── README.md
```

## Setup & Running

### 1. ML Training & Pipeline
```bash
cd ml
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python data_loader.py
python train_baseline.py
python train_distilbert.py
python explain.py
```

### 2. Backend API
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend UI
```bash
cd frontend
npm install
npm run dev
```
