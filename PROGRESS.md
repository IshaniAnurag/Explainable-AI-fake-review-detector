# Project Progress Tracker (`PROGRESS.md`)

**Project:** An Explainable AI Framework for Detecting Fake E-Commerce Reviews  
**Target:** Production-Grade Serverless Architecture + IEEE Conference Paper Brief  
**Last Updated:** October 27, 2026  

---

## Overall Roadmap Status

| Phase | Milestone | Status | Key Deliverables |
| :---: | :--- | :---: | :--- |
| **Phase 1** | **Audit & Project Setup** | **DONE** | `AUDIT.md`, `PROGRESS.md`, git baseline, environment setup |
| **Phase 2** | **Data & Baseline Verification** | **DONE** | EDA plots, verified baseline metrics, confusion matrix, ROC curve, ablation in `/results` |
| **Phase 3** | **DistilBERT, Real XAI (SHAP & LIME), & ONNX** | **IN PROGRESS** | Real DistilBERT model, real SHAP, real LIME, faithfulness/stability tests, ONNX export |
| **Phase 4** | **Backend & DynamoDB Repository Layer** | PENDING | Versioned `/v1` endpoints, DynamoDB Local/AWS repo, batch upload, rate limiting |
| **Phase 5** | **Frontend Modernization & Full Views** | PENDING | Landing, Analyzer (SHAP/LIME + dual model), History, Insights, Batch Upload, Dark/Light mode |
| **Phase 6** | **Quality Assurance, CI & Testing** | PENDING | Pytest unit/integration tests, GitHub Actions CI workflow, `.env.example`, README |
| **Phase 7** | **AWS SAM Packaging & Deployment Readiness** | PENDING | `template.yaml`, `deploy.sh`, `teardown.sh`, `local_dev.sh`, `DEPLOY.md` |
| **Phase 8** | **Final Verification & IEEE Paper Brief** | PENDING | Full run-through check, 300 DPI figures, `PAPER_BRIEF_FOR_CLAUDE.md` |

---

## Detailed Task Breakdown

### Phase 1: Audit & Project Setup
- [x] Comprehensive workspace inspection across ML, backend, frontend, docs
- [x] Generate truthful `AUDIT.md` identifying mocked and incomplete subsystems
- [x] Create running `PROGRESS.md`
- [x] Switched branch to `main`
- [x] Install required dependencies (`lime`, `shap`, `onnx`, `onnxruntime`, `mangum`, `boto3`, `pytest`, `matplotlib`, `seaborn`)

### Phase 2: Data & Baseline Verification
- [x] Verify 40,432-row Kaggle dataset integrity, class distribution, and clean splits
- [x] Compute full dataset EDA statistics and generate class balance/length distribution plots (PNG 300 DPI & SVG)
- [x] Train and verify TF-IDF + Logistic Regression (93.67% Acc, 0.9842 AUC) and Calibrated Linear SVM (94.11% Acc, 0.9857 AUC)
- [x] Run 8-configuration ablation study across n-gram ranges and max features caps
- [x] Save authentic baseline confusion matrix, ROC curves, EDA stats, and ablation tables to `/results` and `/docs/figures`

### Phase 3: DistilBERT, Real XAI (SHAP & LIME), & ONNX
- [ ] Fine-tune sequence classifier on preprocessed review corpus with evaluation checkpoints
- [ ] Implement genuine SHAP explainer (KernelSHAP / PartitionExplainer)
- [ ] Implement genuine LIME text explainer
- [ ] Run comparative evaluation: Faithfulness (deletion/insertion tests), Stability, and Latency
- [ ] Export model to optimized ONNX runtime format for sub-second Lambda execution
- [ ] Save all comparison tables and explanation plots to `/results` and `/docs/figures`

### Phase 4: Backend & DynamoDB Repository Layer
- [ ] Build versioned FastAPI endpoints:
  - `POST /v1/analyze`: Single review inference with label, confidence, token attributions, top words, latency
  - `POST /v1/analyze/batch`: CSV / list batch inference
  - `GET /v1/history`: Paginated history with filter & search
  - `GET /v1/stats`: Aggregated summary statistics, model performance metrics, class distributions
  - `GET /v1/health`: Health probe and model status
- [ ] Implement Repository Layer abstracting DynamoDB Local and AWS DynamoDB
- [ ] Implement table creation & seed scripts for development
- [ ] Add rate limiting, input validation, structured logging, and Mangum Lambda adapter

### Phase 5: Frontend Modernization & Full Views
- [ ] Clean one-screen Landing page explaining the project architecture & novelty
- [ ] Overhaul Analyzer page:
  - Word-level token highlights (SHAP & LIME toggle)
  - Model comparison toggle (Baseline vs. DistilBERT)
  - Top contributing words bar chart
  - Animated confidence gauge and verdict reveal
- [ ] Build History page with search, filters, pagination, and deletion
- [ ] Build Insights / Dashboard page rendering real evaluation curves, confusion matrix, and XAI examples
- [ ] Build Batch Upload page with CSV drag-and-drop, analysis progress, and CSV download
- [ ] Add fluid Dark / Light theme toggle, loading skeletons, and error toasts

### Phase 6: Quality Assurance, CI & Testing
- [ ] Write unit tests for ML pipeline, API endpoints, and repository layer
- [ ] Set up GitHub Actions CI workflow (`.github/workflows/ci.yml`) for linting and test execution
- [ ] Write detailed `README.md`, `LICENSE`, and `.env.example`

### Phase 7: AWS SAM Packaging & Zero-Cost Infrastructure
- [ ] Write AWS SAM `template.yaml` (S3, CloudFront OAC, Lambda, HTTP API Gateway, DynamoDB On-Demand, CloudWatch, $0.01 Budget alert)
- [ ] Write `deploy.sh`, `teardown.sh`, and `local_dev.sh`
- [ ] Write step-by-step `DEPLOY.md` guide with zero-cost verification instructions

### Phase 8: Final Verification & IEEE Paper Brief
- [ ] Perform full local run-through and verify all features against PASS/FAIL checklist
- [ ] Export all figures at publication quality (300 DPI PNG & SVG) into `/docs/figures`
- [ ] Generate self-contained, publication-ready `PAPER_BRIEF_FOR_CLAUDE.md`
