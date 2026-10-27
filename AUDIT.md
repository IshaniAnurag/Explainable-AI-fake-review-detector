# Comprehensive Codebase & System Audit (`AUDIT.md`)

**Date of Audit:** October 27, 2026  
**Auditor:** Antigravity Autonomous Build Agent  
**Project:** An Explainable AI Framework for Detecting Fake E-Commerce Reviews  
**Status:** Verification of Existing Workspace Components against Target Production Specifications  

---

## 1. Executive Summary of Audit

An unsparing, non-fabricated inspection of the current workspace was conducted. While initial scaffolding exists (dataset download script, baseline TF-IDF model, basic FastAPI routes, and a single-view React UI), **several critical subsystems are mocked, broken, or completely missing** compared to the target production and IEEE paper requirements:

1. **Explainability Layer is Mocked:** `backend/app/model_loader.py` and `ml/explain.py` do NOT execute genuine SHAP or LIME algorithms. They employ hardcoded token dictionaries (`fake_tokens_set`, `genuine_tokens_set`) and Gaussian noise (`np.random.normal`).
2. **DistilBERT Model is Not Active:** The transformer weights in `ml/models/distilbert_fake_reviews` originated from an aborted/partial training run. `backend/app/model_loader.py` never initializes or routes requests to DistilBERT.
3. **Missing Evaluation & Figures:** No LIME vs. SHAP faithfulness, stability, or latency comparison exists. No deletion/insertion tests exist. No plots, confusion matrices, or ROC curves are saved in `/results` or `/docs/figures`.
4. **Backend API is Non-Compliant with Target Specs:** The backend lacks versioned endpoints (`/v1/analyze`, `/v1/analyze/batch`, `/v1/stats`, `/v1/history`, `/v1/health`), lacks input validation, lacks rate limiting, and lacks Mangum Lambda wrapping.
5. **Database Layer:** Only a basic SQLite database exists. There is no DynamoDB / DynamoDB Local repository layer, no seeding scripts, and no multi-table support (history, aggregated stats, user feedback).
6. **Frontend Limitations:** The frontend lacks multiple mandatory views: Landing page, Multi-model comparison toggle (TF-IDF vs. DistilBERT), LIME vs. SHAP comparison toggle, Top-contributing words bar chart, History search/filtering/deletion, Insights dashboard, and Batch CSV upload.
7. **Infrastructure & Testing:** Zero unit tests, zero integration tests, zero CI/CD workflows, and no AWS SAM infrastructure-as-code templates or teardown scripts exist.

---

## 2. Component-by-Component Audit

### 2.1 Machine Learning Pipeline (`/ml`)

| Artifact / Component | Current State | Verifiable Reality | Action Required |
| :--- | :--- | :--- | :--- |
| **Dataset (`ml/data/`)** | Exists | Raw Kaggle dataset has 40,432 rows (20,216 `CG` fake, 20,216 `OR` genuine). Cleaned and split into 32,345 train, 4,043 val, 4,044 test. | **PASS.** Dataset is authentic, balanced, and properly split. |
| **Baseline Model (`ml/train_baseline.py`)** | Exists & Verified | TF-IDF (5,000 features, n-grams (1,2)) + Logistic Regression. Measured test metrics: Accuracy 93.32%, Precision 94.11%, Recall 92.43%, F1 93.26%, ROC-AUC 0.9828. | **PASS.** Keep as verifiable baseline; generate confusion matrix and ROC curves to `/results`. |
| **DistilBERT Model (`ml/train_distilbert.py`)** | Incomplete | Training was killed in earlier turn due to CPU execution speed. Checkpoint is untrained / partially trained. | **FAIL.** Train a high-quality distilled model with proper convergence, evaluate on test set, and export to ONNX runtime format for sub-second, zero-cost Lambda inference. |
| **XAI Layer (`ml/explain.py`)** | **MOCKED / FABRICATED** | Line 37–45: Contains `if cleaned_tok in ["amazing", "best", ...]: score = 0.38 else np.random.normal()`. No real SHAP or LIME explainer is executed. | **CRITICAL FAIL.** Replace entirely with genuine SHAP and LIME algorithms, computing token attributions, stability, and faithfulness. |
| **Comparative Metrics** | Missing | No quantitative comparison between SHAP and LIME (latency, stability, faithfulness via deletion/insertion). | **FAIL.** Implement comparison benchmark and save empirical metrics to `/results`. |
| **Model Export** | Missing | No ONNX export exists (`model.onnx` or int8 quantized ONNX). | **FAIL.** Export trained model to optimized ONNX for high-performance Lambda deployment. |

---

### 2.2 Backend & Storage Layer (`/backend`)

| Artifact / Component | Current State | Verifiable Reality | Action Required |
| :--- | :--- | :--- | :--- |
| **Endpoints (`backend/app/main.py`)** | Non-Compliant | Endpoints are `/health`, `/predict`, `/explain`, `/history`. Missing `/v1/analyze`, `/v1/analyze/batch`, `/v1/stats`, `/v1/history`, `/v1/health`. | **FAIL.** Re-architect FastAPI routes to versioned `/v1` endpoints with Pydantic validation, error handling, and rate limiting. |
| **Inference Service (`model_loader.py`)** | **MOCKED / HEURISTIC** | Hardcoded keyword counting (`genuine_indicators`, `fake_indicators`) and rule heuristics. DistilBERT pipeline is never called. | **CRITICAL FAIL.** Rewrite to load genuine ONNX/DistilBERT and Baseline models with real SHAP/LIME computation. |
| **Database Abstraction (`storage.py`)** | Partial (SQLite only) | Hardcoded SQLite queries to `submissions.db`. No DynamoDB repository pattern. | **FAIL.** Build repository layer supporting both DynamoDB Local (development) and AWS DynamoDB (production) with table seeding. |
| **Batch Processing** | Missing | No batch analysis or CSV upload processing endpoint. | **FAIL.** Implement `POST /v1/analyze/batch`. |
| **Serverless Adapter** | Inactive | Mangum handler is commented out. | **FAIL.** Activate Mangum handler for Lambda integration. |

---

### 2.3 Frontend Application (`/frontend`)

| Page / Feature | Current State | Verifiable Reality | Action Required |
| :--- | :--- | :--- | :--- |
| **Landing Screen** | Missing | Directly opens into analyzer view. | **FAIL.** Implement clean one-screen project intro. |
| **Analyzer View** | Basic | Shows text area and token highlights, but attributions were tied to mock scores. Lacks SHAP vs. LIME toggle, lacks DistilBERT vs. TF-IDF comparison toggle, lacks top words bar chart. | **FAIL.** Overhaul with real SHAP/LIME rendering, dual model toggle, and top contributing words visualization. |
| **History Page** | Basic preview | Only shows last 5 items in a static table. Lacks search, filtering, pagination, and deletion. | **FAIL.** Build full History management page. |
| **Insights / Dashboard** | Partial static table | Metrics table in `AboutView` has static hardcoded text. No dynamic charts for class distribution, confusion matrix, ROC curve, or explanation examples. | **FAIL.** Build interactive Insights dashboard pulling from `/v1/stats`. |
| **Batch Upload View** | Missing | No CSV file upload interface or batch results table/download. | **FAIL.** Build Batch CSV upload interface. |
| **Dark / Light Mode** | Missing | Dark theme only; no toggle. | **FAIL.** Add fluid dark/light mode toggle. |

---

### 2.4 Infrastructure, Testing & Documentation

| Component | Current State | Action Required |
| :--- | :--- | :--- |
| **AWS SAM Template** | **MISSING** | Create `template.yaml` defining S3, CloudFront, Lambda, API Gateway HTTP API, DynamoDB on-demand, CloudWatch logs & alarms, IAM least-privilege, and $0.01 zero-spend budget. |
| **Deployment Scripts** | **MISSING** | Create `deploy.sh`, `teardown.sh`, and `local_dev.sh` (with DynamoDB Local simulation). |
| **Automated Tests** | **MISSING** | Create pytest unit tests for backend, models, and repository; frontend component tests; GitHub Actions CI workflow (`.github/workflows/ci.yml`). |
| **Results Directory** | **MISSING** | Create `/results` to store all verified JSON metrics, CSV exports, confusion matrices, and ROC curves. |
| **Paper Brief** | **MISSING** | Create `PAPER_BRIEF_FOR_CLAUDE.md` containing all verifiable metrics, exact experimental setups, and figures. |

---

## 3. Remediation & Execution Plan

Based on these audit findings, execution will proceed strictly following the 8-phase execution plan:

1. **Phase 1: Audit and Plan** (Complete `AUDIT.md`, `PROGRESS.md`, git commit).
2. **Phase 2: Data and Baseline Verification** (Full dataset statistics, EDA plots, baseline evaluation, generate confusion matrix & ROC figures into `/results`).
3. **Phase 3: Real DistilBERT, Real XAI (SHAP & LIME), and ONNX Export** (Train clean model, export to ONNX runtime, run genuine SHAP & LIME, perform faithfulness deletion/insertion tests, save comparison metrics to `/results`).
4. **Phase 4: Backend & DynamoDB Repository Layer** (Versioned `/v1` FastAPI, DynamoDB Local & AWS DynamoDB support, batch analysis, rate limiting, tests).
5. **Phase 5: Full Frontend Re-Architecture** (Landing, Analyzer, History, Insights/Dashboard, Batch Upload, Dark/Light mode, connected to live backend).
6. **Phase 6: Quality, Testing, and CI** (Pytest suite, CI workflow, documentation, local verification).
7. **Phase 7: AWS SAM Packaging & Zero-Cost Infrastructure** (`template.yaml`, `deploy.sh`, `teardown.sh`, `local_dev.sh`, `DEPLOY.md`).
8. **Phase 8: Final Verification & Paper Brief** (`PAPER_BRIEF_FOR_CLAUDE.md`, 300 DPI figures, complete pass/fail checklist).
