import os
import json
import torch
import pandas as pd
import numpy as np
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    get_linear_schedule_with_warmup
)
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix
)

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
MODELS_DIR = os.path.join(BASE_DIR, "models")
DISTILBERT_MODEL_DIR = os.path.join(MODELS_DIR, "distilbert_fake_reviews")
METRICS_OUTPUT_PATH = os.path.join(MODELS_DIR, "distilbert_metrics.json")
os.makedirs(MODELS_DIR, exist_ok=True)

MODEL_NAME = "distilbert-base-uncased"
MAX_LEN = 128         # Optimized for fast CPU tokenization & self-attention
BATCH_SIZE = 32       # Larger batch size for fast CPU vectorization
LEARNING_RATE = 3e-5
EPOCHS = 2            # 2 fast epochs for quick convergence
WEIGHT_DECAY = 0.01

class ReviewDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len=128):
        self.texts = list(texts)
        self.labels = list(labels)
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = int(self.labels[idx])
        encoding = self.tokenizer(
            text,
            truncation=True,
            padding="max_length",
            max_length=self.max_len,
            return_tensors="pt"
        )
        return {
            "input_ids": encoding["input_ids"].squeeze(0),
            "attention_mask": encoding["attention_mask"].squeeze(0),
            "labels": torch.tensor(label, dtype=torch.long)
        }

def evaluate(model, dataloader, device):
    model.eval()
    all_preds = []
    all_probs = []
    all_labels = []
    total_val_loss = 0.0

    criterion = torch.nn.CrossEntropyLoss()

    with torch.no_grad():
        for batch in dataloader:
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["labels"].to(device)

            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            loss = criterion(outputs.logits, labels)
            total_val_loss += loss.item()

            probs = torch.softmax(outputs.logits, dim=1)[:, 1].cpu().numpy()
            preds = torch.argmax(outputs.logits, dim=1).cpu().numpy()

            all_probs.extend(probs)
            all_preds.extend(preds)
            all_labels.extend(labels.cpu().numpy())

    avg_loss = total_val_loss / max(len(dataloader), 1)
    acc = accuracy_score(all_labels, all_preds)
    prec = precision_score(all_labels, all_preds, zero_division=0)
    rec = recall_score(all_labels, all_preds, zero_division=0)
    f1 = f1_score(all_labels, all_preds, zero_division=0)
    roc_auc = roc_auc_score(all_labels, all_probs)
    cm = confusion_matrix(all_labels, all_preds).tolist()

    return {
        "val_loss": round(float(avg_loss), 4),
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1_score": round(float(f1), 4),
        "roc_auc": round(float(roc_auc), 4),
        "confusion_matrix": cm
    }

def train():
    # Set PyTorch thread count for speed
    torch.set_num_threads(max(1, os.cpu_count() - 1))
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device} (Thread count: {torch.get_num_threads()})")

    train_path = os.path.join(DATA_DIR, "train.csv")
    val_path = os.path.join(DATA_DIR, "val.csv")
    test_path = os.path.join(DATA_DIR, "test.csv")

    if not os.path.exists(train_path) or not os.path.exists(test_path):
        raise FileNotFoundError("Datasets missing. Run data_loader.py first.")

    train_df = pd.read_csv(train_path)
    val_df = pd.read_csv(val_path)
    test_df = pd.read_csv(test_path)

    # Subsample 2500 samples for ultra-fast local fine-tuning
    if len(train_df) > 2500:
        print(f"Subsampling training dataset from {len(train_df)} to 2,500 rows for ultra-fast fine-tuning.")
        train_df = train_df.sample(n=2500, random_state=42).reset_index(drop=True)
        val_df = val_df.sample(n=500, random_state=42).reset_index(drop=True)
        test_df = test_df.sample(n=500, random_state=42).reset_index(drop=True)

    print(f"Initializing tokenizer & model: {MODEL_NAME}...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=2)
    model.to(device)

    train_dataset = ReviewDataset(train_df["cleaned_text"], train_df["binary_label"], tokenizer, MAX_LEN)
    val_dataset = ReviewDataset(val_df["cleaned_text"], val_df["binary_label"], tokenizer, MAX_LEN)
    test_dataset = ReviewDataset(test_df["cleaned_text"], test_df["binary_label"], tokenizer, MAX_LEN)

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False)

    optimizer = AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY)
    total_steps = len(train_loader) * EPOCHS
    scheduler = get_linear_schedule_with_warmup(optimizer, num_warmup_steps=int(total_steps * 0.1), num_training_steps=total_steps)

    print(f"Starting ultra-fast fine-tuning for {EPOCHS} epochs (Total steps: {total_steps})...")

    best_val_loss = float("inf")

    for epoch in range(1, EPOCHS + 1):
        model.train()
        total_train_loss = 0.0

        for step, batch in enumerate(train_loader):
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["labels"].to(device)

            optimizer.zero_grad()
            outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
            loss = outputs.loss
            loss.backward()

            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()

            total_train_loss += loss.item()

            if (step + 1) % 25 == 0 or (step + 1) == len(train_loader):
                print(f"Epoch {epoch}/{EPOCHS} | Step {step+1}/{len(train_loader)} | Batch Loss: {loss.item():.4f}")

        avg_train_loss = total_train_loss / len(train_loader)
        val_metrics = evaluate(model, val_loader, device)

        print(f"Epoch {epoch} Complete | Avg Train Loss: {avg_train_loss:.4f} | Val Loss: {val_metrics['val_loss']} | Val Acc: {val_metrics['accuracy']}")

        if val_metrics["val_loss"] < best_val_loss:
            best_val_loss = val_metrics["val_loss"]
            print("New best val loss! Saving model checkpoint...")
            model.save_pretrained(DISTILBERT_MODEL_DIR)
            tokenizer.save_pretrained(DISTILBERT_MODEL_DIR)

    print("\n--- EVALUATING FINE-TUNED DISTILBERT ON TEST SET ---")
    best_model = AutoModelForSequenceClassification.from_pretrained(DISTILBERT_MODEL_DIR)
    best_model.to(device)
    test_metrics = evaluate(best_model, test_loader, device)

    metrics_output = {
        "model_type": "DistilBERT (distilbert-base-uncased)",
        "hyperparameters": {
            "batch_size": BATCH_SIZE,
            "learning_rate": LEARNING_RATE,
            "epochs": EPOCHS,
            "weight_decay": WEIGHT_DECAY,
            "max_length": MAX_LEN
        },
        "test_metrics": test_metrics
    }

    print("\n--- DISTILBERT FINAL TEST METRICS ---")
    print(json.dumps(metrics_output, indent=2))

    with open(METRICS_OUTPUT_PATH, "w") as f:
        json.dump(metrics_output, f, indent=2)

    print(f"\nModel fine-tuning complete! Artifact saved to {DISTILBERT_MODEL_DIR}")
    print(f"Metrics report saved to {METRICS_OUTPUT_PATH}")

if __name__ == "__main__":
    train()
