import os
import json
import time
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, roc_curve, classification_report
)

# Setup directories
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "ml", "data")
RESULTS_DIR = os.path.join(BASE_DIR, "results")
FIGURES_DIR = os.path.join(BASE_DIR, "docs", "figures")
MODELS_DIR = os.path.join(BASE_DIR, "ml", "models")

os.makedirs(RESULTS_DIR, exist_ok=True)
os.makedirs(FIGURES_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

# Set style for publication figures
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.size'] = 11

def run_eda(train_df, val_df, test_df):
    print("\n--- PHASE 2: EXPLORATORY DATA ANALYSIS (EDA) ---")
    
    # Calculate text length metrics
    for df, name in [(train_df, 'train'), (val_df, 'val'), (test_df, 'test')]:
        df['word_count'] = df['cleaned_text'].astype(str).apply(lambda x: len(x.split()))
        df['char_count'] = df['cleaned_text'].astype(str).apply(len)

    all_df = pd.concat([train_df, val_df, test_df], ignore_index=True)
    
    eda_stats = {
        "dataset_name": "Kaggle Fake Reviews Dataset (Amazon Product Reviews)",
        "total_rows": len(all_df),
        "train_rows": len(train_df),
        "val_rows": len(val_df),
        "test_rows": len(test_df),
        "class_balance": {
            "genuine_count": int((all_df['binary_label'] == 0).sum()),
            "fake_count": int((all_df['binary_label'] == 1).sum()),
            "genuine_pct": float(round((all_df['binary_label'] == 0).mean() * 100, 2)),
            "fake_pct": float(round((all_df['binary_label'] == 1).mean() * 100, 2))
        },
        "length_statistics": {
            "genuine_reviews": {
                "mean_words": float(round(all_df[all_df['binary_label'] == 0]['word_count'].mean(), 2)),
                "median_words": float(round(all_df[all_df['binary_label'] == 0]['word_count'].median(), 2)),
                "std_words": float(round(all_df[all_df['binary_label'] == 0]['word_count'].std(), 2)),
                "max_words": int(all_df[all_df['binary_label'] == 0]['word_count'].max()),
                "min_words": int(all_df[all_df['binary_label'] == 0]['word_count'].min())
            },
            "fake_reviews": {
                "mean_words": float(round(all_df[all_df['binary_label'] == 1]['word_count'].mean(), 2)),
                "median_words": float(round(all_df[all_df['binary_label'] == 1]['word_count'].median(), 2)),
                "std_words": float(round(all_df[all_df['binary_label'] == 1]['word_count'].std(), 2)),
                "max_words": int(all_df[all_df['binary_label'] == 1]['word_count'].max()),
                "min_words": int(all_df[all_df['binary_label'] == 1]['word_count'].min())
            }
        }
    }

    # Save stats JSON
    eda_stats_path = os.path.join(RESULTS_DIR, "eda_statistics.json")
    with open(eda_stats_path, "w") as f:
        json.dump(eda_stats, f, indent=2)
    print(f"Saved EDA stats to {eda_stats_path}")

    # Plot 1: Class Distribution
    fig, ax = plt.subplots(figsize=(6, 4), dpi=300)
    sns.barplot(
        x=["Genuine (OR)", "Fake (CG)"],
        y=[eda_stats['class_balance']['genuine_count'], eda_stats['class_balance']['fake_count']],
        palette=["#10B981", "#EF4444"],
        ax=ax
    )
    ax.set_title("Dataset Class Distribution (N = 40,432)", fontsize=13, fontweight='bold', pad=12)
    ax.set_ylabel("Number of Samples", fontsize=11)
    for p in ax.patches:
        ax.annotate(f"{int(p.get_height()):,}\n({p.get_height()/len(all_df)*100:.1f}%)",
                    (p.get_x() + p.get_width() / 2., p.get_height() / 2),
                    ha='center', va='center', color='white', fontweight='bold', fontsize=11)
    plt.tight_layout()
    fig.savefig(os.path.join(FIGURES_DIR, "eda_class_distribution.png"), dpi=300)
    fig.savefig(os.path.join(FIGURES_DIR, "eda_class_distribution.svg"))
    fig.savefig(os.path.join(RESULTS_DIR, "eda_class_distribution.png"), dpi=300)
    plt.close(fig)

    # Plot 2: Review Length Distribution (Box & KDE)
    fig, axes = plt.subplots(1, 2, figsize=(12, 4.5), dpi=300)
    
    # KDE distribution capped at 99th percentile for clean visualization
    q99 = all_df['word_count'].quantile(0.99)
    plot_df = all_df[all_df['word_count'] <= q99]
    
    sns.kdeplot(data=plot_df[plot_df['binary_label'] == 0]['word_count'], label="Genuine (OR)", color="#10B981", fill=True, alpha=0.3, ax=axes[0])
    sns.kdeplot(data=plot_df[plot_df['binary_label'] == 1]['word_count'], label="Fake (CG)", color="#EF4444", fill=True, alpha=0.3, ax=axes[0])
    axes[0].set_title("Word Count Density by Class", fontsize=12, fontweight='bold')
    axes[0].set_xlabel("Word Count (capped at 99th percentile)", fontsize=10)
    axes[0].set_ylabel("Density", fontsize=10)
    axes[0].legend()

    # Boxplot
    sns.boxplot(x="binary_label", y="word_count", data=plot_df, palette=["#10B981", "#EF4444"], ax=axes[1])
    axes[1].set_title("Word Count Spread", fontsize=12, fontweight='bold')
    axes[1].set_xticklabels(["Genuine (OR)", "Fake (CG)"])
    axes[1].set_ylabel("Word Count", fontsize=10)

    plt.tight_layout()
    fig.savefig(os.path.join(FIGURES_DIR, "eda_review_length_distribution.png"), dpi=300)
    fig.savefig(os.path.join(FIGURES_DIR, "eda_review_length_distribution.svg"))
    fig.savefig(os.path.join(RESULTS_DIR, "eda_review_length_distribution.png"), dpi=300)
    plt.close(fig)

    print("EDA plots saved in /docs/figures and /results.")
    return eda_stats

def train_and_evaluate_baselines(train_df, test_df):
    print("\n--- PHASE 2: BASELINE TRAINING & COMPARATIVE ABLATIONS ---")
    X_train_text = train_df['cleaned_text'].fillna('').tolist()
    y_train = train_df['binary_label'].values

    X_test_text = test_df['cleaned_text'].fillna('').tolist()
    y_test = test_df['binary_label'].values

    # Primary vectorizer
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2), sublinear_tf=True)
    t0 = time.time()
    X_train_vec = vectorizer.fit_transform(X_train_text)
    X_test_vec = vectorizer.transform(X_test_text)
    vec_time = time.time() - t0

    # 1. Baseline A: Logistic Regression
    t0 = time.time()
    clf_lr = LogisticRegression(max_iter=1000, random_state=42, C=1.0)
    clf_lr.fit(X_train_vec, y_train)
    lr_train_time = time.time() - t0

    t0 = time.time()
    y_pred_lr = clf_lr.predict(X_test_vec)
    y_prob_lr = clf_lr.predict_proba(X_test_vec)[:, 1]
    lr_infer_time = (time.time() - t0) / len(X_test_text) * 1000  # ms per sample

    acc_lr = accuracy_score(y_test, y_pred_lr)
    prec_lr = precision_score(y_test, y_pred_lr, zero_division=0)
    rec_lr = recall_score(y_test, y_pred_lr, zero_division=0)
    f1_lr = f1_score(y_test, y_pred_lr, zero_division=0)
    auc_lr = roc_auc_score(y_test, y_prob_lr)
    cm_lr = confusion_matrix(y_test, y_pred_lr).tolist()

    # 2. Baseline B: Linear SVM (with probability calibration)
    t0 = time.time()
    base_svm = LinearSVC(C=1.0, random_state=42, max_iter=2000)
    clf_svm = CalibratedClassifierCV(base_svm)
    clf_svm.fit(X_train_vec, y_train)
    svm_train_time = time.time() - t0

    t0 = time.time()
    y_pred_svm = clf_svm.predict(X_test_vec)
    y_prob_svm = clf_svm.predict_proba(X_test_vec)[:, 1]
    svm_infer_time = (time.time() - t0) / len(X_test_text) * 1000  # ms per sample

    acc_svm = accuracy_score(y_test, y_pred_svm)
    prec_svm = precision_score(y_test, y_pred_svm, zero_division=0)
    rec_svm = recall_score(y_test, y_pred_svm, zero_division=0)
    f1_svm = f1_score(y_test, y_pred_svm, zero_division=0)
    auc_svm = roc_auc_score(y_test, y_prob_svm)
    cm_svm = confusion_matrix(y_test, y_pred_svm).tolist()

    # Save primary baseline model for application and testing
    joblib.dump({"vectorizer": vectorizer, "classifier": clf_lr}, os.path.join(MODELS_DIR, "baseline_model.joblib"))
    joblib.dump({"vectorizer": vectorizer, "classifier": clf_svm}, os.path.join(MODELS_DIR, "baseline_svm_model.joblib"))

    baseline_results = {
        "dataset_split": "40,432 total (32,345 train, 4,044 held-out test)",
        "features": "TF-IDF (max_features=5000, n-gram range=(1,2), sublinear_tf=True)",
        "models": {
            "logistic_regression": {
                "accuracy": round(float(acc_lr), 4),
                "precision": round(float(prec_lr), 4),
                "recall": round(float(rec_lr), 4),
                "f1_score": round(float(f1_lr), 4),
                "roc_auc": round(float(auc_lr), 4),
                "confusion_matrix": {
                    "tn": cm_lr[0][0], "fp": cm_lr[0][1],
                    "fn": cm_lr[1][0], "tp": cm_lr[1][1]
                },
                "latency_ms_per_sample": round(float(lr_infer_time), 4),
                "training_time_seconds": round(float(lr_train_time), 2)
            },
            "linear_svm": {
                "accuracy": round(float(acc_svm), 4),
                "precision": round(float(prec_svm), 4),
                "recall": round(float(rec_svm), 4),
                "f1_score": round(float(f1_svm), 4),
                "roc_auc": round(float(auc_svm), 4),
                "confusion_matrix": {
                    "tn": cm_svm[0][0], "fp": cm_svm[0][1],
                    "fn": cm_svm[1][0], "tp": cm_svm[1][1]
                },
                "latency_ms_per_sample": round(float(svm_infer_time), 4),
                "training_time_seconds": round(float(svm_train_time), 2)
            }
        }
    }

    with open(os.path.join(RESULTS_DIR, "baseline_metrics.json"), "w") as f:
        json.dump(baseline_results, f, indent=2)
    with open(os.path.join(MODELS_DIR, "baseline_metrics.json"), "w") as f:
        json.dump(baseline_results, f, indent=2)

    # 3. Ablation Study: N-gram range & feature caps
    print("\nRunning Feature & N-Gram Ablation Study...")
    ablation_rows = []
    configs = [
        ("Unigram (1,1)", (1, 1), 1000),
        ("Unigram (1,1)", (1, 1), 5000),
        ("Unigram (1,1)", (1, 1), 10000),
        ("Uni+Bigram (1,2)", (1, 2), 1000),
        ("Uni+Bigram (1,2)", (1, 2), 5000),
        ("Uni+Bigram (1,2)", (1, 2), 10000),
        ("Uni+Bi+Trigram (1,3)", (1, 3), 5000),
        ("Uni+Bi+Trigram (1,3)", (1, 3), 10000),
    ]

    for name, ngram_rng, max_feat in configs:
        vec_ab = TfidfVectorizer(max_features=max_feat, ngram_range=ngram_rng, sublinear_tf=True)
        X_tr = vec_ab.fit_transform(X_train_text)
        X_te = vec_ab.transform(X_test_text)

        lr_ab = LogisticRegression(max_iter=500, random_state=42)
        lr_ab.fit(X_tr, y_train)
        preds = lr_ab.predict(X_te)
        probs = lr_ab.predict_proba(X_te)[:, 1]

        ablation_rows.append({
            "Configuration": name,
            "N-Gram Range": str(ngram_rng),
            "Max Features": max_feat,
            "Accuracy": round(float(accuracy_score(y_test, preds)), 4),
            "Precision": round(float(precision_score(y_test, preds)), 4),
            "Recall": round(float(recall_score(y_test, preds)), 4),
            "F1-Score": round(float(f1_score(y_test, preds)), 4),
            "ROC-AUC": round(float(roc_auc_score(y_test, probs)), 4)
        })

    ablation_df = pd.DataFrame(ablation_rows)
    ablation_csv_path = os.path.join(RESULTS_DIR, "baseline_ablation_study.csv")
    ablation_df.to_csv(ablation_csv_path, index=False)
    print(f"Saved Ablation Study to {ablation_csv_path}")

    # Plot 3: Confusion Matrix Comparison
    fig, axes = plt.subplots(1, 2, figsize=(11, 4.5), dpi=300)
    for idx, (model_title, cm, color_map) in enumerate([
        ("Logistic Regression", cm_lr, "Blues"),
        ("Linear SVM (Calibrated)", cm_svm, "Purples")
    ]):
        sns.heatmap(
            cm, annot=True, fmt="d", cmap=color_map, cbar=False,
            xticklabels=["Genuine (0)", "Fake (1)"],
            yticklabels=["Genuine (0)", "Fake (1)"],
            ax=axes[idx], annot_kws={"size": 13, "weight": "bold"}
        )
        axes[idx].set_title(f"{model_title}\nConfusion Matrix", fontsize=12, fontweight='bold', pad=10)
        axes[idx].set_xlabel("Predicted Label", fontsize=10)
        axes[idx].set_ylabel("True Label", fontsize=10)

    plt.tight_layout()
    fig.savefig(os.path.join(FIGURES_DIR, "baseline_confusion_matrix.png"), dpi=300)
    fig.savefig(os.path.join(FIGURES_DIR, "baseline_confusion_matrix.svg"))
    fig.savefig(os.path.join(RESULTS_DIR, "baseline_confusion_matrix.png"), dpi=300)
    plt.close(fig)

    # Plot 4: ROC Curves
    fpr_lr, tpr_lr, _ = roc_curve(y_test, y_prob_lr)
    fpr_svm, tpr_svm, _ = roc_curve(y_test, y_prob_svm)

    fig, ax = plt.subplots(figsize=(6.5, 5), dpi=300)
    ax.plot(fpr_lr, tpr_lr, label=f"Logistic Regression (AUC = {auc_lr:.4f})", color="#3B82F6", lw=2)
    ax.plot(fpr_svm, tpr_svm, label=f"Linear SVM (AUC = {auc_svm:.4f})", color="#8B5CF6", lw=2, linestyle="--")
    ax.plot([0, 1], [0, 1], color="#9CA3AF", linestyle=":", lw=1.5, label="Random Chance (AUC = 0.5000)")
    ax.set_title("Baseline ROC Curves (Test Set, N = 4,044)", fontsize=13, fontweight='bold', pad=12)
    ax.set_xlabel("False Positive Rate (1 - Specificity)", fontsize=11)
    ax.set_ylabel("True Positive Rate (Recall / Sensitivity)", fontsize=11)
    ax.legend(loc="lower right", frameon=True)
    plt.tight_layout()
    fig.savefig(os.path.join(FIGURES_DIR, "baseline_roc_curve.png"), dpi=300)
    fig.savefig(os.path.join(FIGURES_DIR, "baseline_roc_curve.svg"))
    fig.savefig(os.path.join(RESULTS_DIR, "baseline_roc_curve.png"), dpi=300)
    plt.close(fig)

    print("Baseline evaluation figures saved successfully.")
    return baseline_results, ablation_df

if __name__ == "__main__":
    train_df = pd.read_csv(os.path.join(DATA_DIR, "train.csv"))
    val_df = pd.read_csv(os.path.join(DATA_DIR, "val.csv"))
    test_df = pd.read_csv(os.path.join(DATA_DIR, "test.csv"))

    run_eda(train_df, val_df, test_df)
    train_and_evaluate_baselines(train_df, test_df)
