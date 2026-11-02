# TrustLens XAI — An Explainable AI Framework for Detecting Fake E-Commerce Reviews

An end-to-end, production-ready Explainable AI (XAI) system that classifies e-commerce reviews as **Genuine** or **Fake** using fine-tuned `distilbert-base-uncased` alongside a competitive TF-IDF + Logistic Regression baseline (93.67% accuracy, 0.9842 ROC-AUC). Features token-level attribution highlights powered by **SHAP (SHapley Additive exPlanations)** and delivers an interactive React frontend and serverless-ready FastAPI backend.

---

## System Architecture

```
[ User Review Text ]
        │
        ▼
[ React 18 (Vite + Tailwind CSS) ] ── (POST /explain & /predict) ──► [ FastAPI Backend ]
                                                                             │
                                              ┌──────────────────────────────┴──────────────────────────────┐
                                              ▼                                                             ▼
                                 [ ML Classifier & XAI Explainer ]                          [ Unified Storage Layer ]
                                 (Predicts label & extracts token attributions)             (DynamoDB / SQLite Adapter)
```

### Cloud Production Overview
- **Edge & CDN:** Amazon CloudFront Distribution with Origin Access Control (OAC)
- **Static Hosting:** Amazon S3 Static Website Hosting
- **Serverless API:** Amazon API Gateway (HTTP v2) routing to AWS Lambda (ARM64 Graviton)
- **ASGI Adapter:** Mangum ASGI adapter wrapping FastAPI
- **Inference Engine:** Optimized ONNX Runtime (<50 ms CPU execution)
- **Persistence:** Amazon DynamoDB (On-Demand capacity) with local SQLite development fallback
- **Observability & Cost Guard:** AWS CloudWatch structured logging with an automated $0.01 threshold AWS Budget Alert

---

## Directory Structure

```
cloudproj/
├── ml/
│   ├── data/                # Benchmark datasets (40,432 rows)
│   ├── models/              # Trained baseline & transformer weights
│   ├── data_loader.py       # Dataset download & cleaning pipeline
│   ├── train_baseline.py    # Baseline training script
│   ├── eda_and_baseline.py  # Full EDA and evaluation pipeline
│   └── explain.py           # Token attribution generator
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application & Mangum Lambda handler
│   │   ├── model_loader.py  # Model inference & token attribution service
│   │   ├── storage.py       # Unified repository (DynamoDB / SQLite)
│   │   └── schemas.py       # Pydantic data schemas
│   └── requirements.txt     # Python backend dependencies
├── frontend/                # React (Vite) + Tailwind CSS + Framer Motion UI
├── docs/
│   ├── figures/             # 300 DPI PNG & vector SVG evaluation plots
│   └── RESEARCH_SPECIFICATION.md  # Comprehensive research & benchmark specification
├── template.yaml            # AWS SAM serverless infrastructure template
├── deploy_cloudshell.sh     # Automated Linux CloudShell deployment script
├── deploy.ps1               # Automated Windows PowerShell deployment script
├── teardown.ps1             # Automated cloud cleanup script
├── TrustLens_XAI_IEEE_Paper_Cleaned.pdf  # 7-page camera-ready IEEE conference paper PDF
├── TrustLens_XAI_Project_Report_And_Code_Dossier.pdf  # 18-page comprehensive project report & code dossier PDF
├── DEPLOY.md                # Zero-cost cloud deployment guide
└── README.md
```

---

## Setup & Running Locally in VS Code

### 1. Backend Service
```powershell
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Documentation (Swagger): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### 2. Frontend Web Dashboard
```powershell
cd frontend
npm install
npm run dev
```
- Live Dashboard: [http://localhost:5173](http://localhost:5173)

### 3. One-Click Launch in VS Code
Press **`Ctrl + Shift + B`** in VS Code and select **`Start Full App (Backend + Frontend)`**.

---

## Empirical Benchmark Performance

Evaluated on 4,044 held-out test samples from the 40,432-row Amazon benchmark corpus:

| Model Architecture | Accuracy | Precision | Recall | F1 Score | ROC-AUC | Inference Latency |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Baseline (TF-IDF + LogReg)** | 93.67% | 94.33% | 92.93% | 93.62% | 0.9842 | ~0.002 ms |
| **Calibrated Linear SVM** | 94.11% | 94.69% | 93.47% | 94.08% | 0.9857 | ~0.008 ms |
| **DistilBERT (Fine-Tuned)** | **96.80%** | **96.50%** | **97.10%** | **96.80%** | **0.9940** | ~42.00 ms |
