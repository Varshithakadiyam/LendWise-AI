"""
Evaluation module for the loan approval classification model.
Loads the trained model, performs predictions on the validation split,
calculates classification metrics, and exports reports and plots.
"""

import json
import logging
import sys
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report,
    roc_curve,
    precision_recall_curve,
    ConfusionMatrixDisplay
)
import tensorflow as tf

# Ensure src directory is in sys.path if run directly
src_dir = Path(__file__).resolve().parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from config import (
    PROCESSED_TRAIN_PATH,
    TARGET_COLUMN,
    ID_COLUMN,
    TEST_SIZE,
    RANDOM_STATE
)
from utils import setup_logging

logger = setup_logging()

def load_validation_data(data_path: Path) -> tuple[pd.DataFrame, pd.Series]:
    """
    Loads the processed train data and extracts the validation split using config rules.

    Args:
        data_path (Path): Path to the train_processed.csv dataset.

    Returns:
        tuple[pd.DataFrame, pd.Series]: Validation features (X_val) and target (y_val).
    """
    try:
        logger.info(f"Loading dataset for evaluation from {data_path}...")
        df = pd.read_csv(data_path)
        
        if TARGET_COLUMN not in df.columns:
            raise KeyError(f"Target column '{TARGET_COLUMN}' not found in dataset columns.")
            
        y = df[TARGET_COLUMN]
        
        drop_cols = [TARGET_COLUMN]
        if ID_COLUMN in df.columns:
            drop_cols.append(ID_COLUMN)
        X = df.drop(columns=drop_cols)
        
        # Split using exact configuration from training to recreate the validation set
        logger.info(f"Splitting dataset to isolate validation set (test_size={TEST_SIZE})...")
        _, X_val, _, y_val = train_test_split(
            X, 
            y, 
            test_size=TEST_SIZE, 
            random_state=RANDOM_STATE, 
            stratify=y
        )
        logger.info(f"Validation dataset shapes: X_val={X_val.shape}, y_val={y_val.shape}")
        return X_val, y_val
        
    except Exception as e:
        logger.error(f"Error during validation data preparation: {e}", exc_info=True)
        raise e

def plot_confusion_matrix(y_true: pd.Series, y_pred_labels: np.ndarray, output_path: Path):
    """
    Generates and saves the Confusion Matrix plot.
    """
    try:
        logger.info(f"Generating confusion matrix plot at {output_path}...")
        plt.style.use("default")
        fig, ax = plt.subplots(figsize=(6, 5))
        
        cm = confusion_matrix(y_true, y_pred_labels)
        disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=["Rejected", "Approved"])
        disp.plot(cmap=plt.cm.Blues, ax=ax, values_format="d")
        
        ax.set_title("Confusion Matrix", fontsize=14, fontweight="bold")
        plt.tight_layout()
        plt.savefig(output_path, dpi=150, bbox_inches="tight")
        plt.close()
        logger.info("Confusion matrix plot saved successfully.")
    except Exception as e:
        logger.error(f"Failed to plot confusion matrix: {e}")
        raise e

def plot_roc_curve(y_true: pd.Series, y_pred_probs: np.ndarray, roc_auc: float, output_path: Path):
    """
    Generates and saves the Receiver Operating Characteristic (ROC) curve.
    """
    try:
        logger.info(f"Generating ROC curve plot at {output_path}...")
        plt.style.use("default")
        fpr, tpr, _ = roc_curve(y_true, y_pred_probs)
        
        plt.figure(figsize=(6, 5))
        plt.plot(fpr, tpr, color="#2ca02c", lw=2, label=f"ROC Curve (AUC = {roc_auc:.4f})")
        plt.plot([0, 1], [0, 1], color="#7f7f7f", lw=1.5, linestyle="--")
        plt.xlim([-0.01, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel("False Positive Rate")
        plt.ylabel("True Positive Rate")
        plt.title("Receiver Operating Characteristic (ROC) Curve", fontsize=12, fontweight="bold")
        plt.legend(loc="lower right")
        plt.grid(True, linestyle=":", alpha=0.6)
        
        plt.tight_layout()
        plt.savefig(output_path, dpi=150, bbox_inches="tight")
        plt.close()
        logger.info("ROC curve plot saved successfully.")
    except Exception as e:
        logger.error(f"Failed to plot ROC curve: {e}")
        raise e

def plot_precision_recall_curve(y_true: pd.Series, y_pred_probs: np.ndarray, output_path: Path):
    """
    Generates and saves the Precision-Recall (PR) curve.
    """
    try:
        logger.info(f"Generating Precision-Recall curve plot at {output_path}...")
        plt.style.use("default")
        precision, recall, _ = precision_recall_curve(y_true, y_pred_probs)
        
        plt.figure(figsize=(6, 5))
        plt.plot(recall, precision, color="#1f77b4", lw=2, label="Precision-Recall Curve")
        plt.xlim([0.0, 1.05])
        plt.ylim([0.0, 1.05])
        plt.xlabel("Recall")
        plt.ylabel("Precision")
        plt.title("Precision-Recall Curve", fontsize=12, fontweight="bold")
        plt.legend(loc="lower left")
        plt.grid(True, linestyle=":", alpha=0.6)
        
        plt.tight_layout()
        plt.savefig(output_path, dpi=150, bbox_inches="tight")
        plt.close()
        logger.info("Precision-Recall curve plot saved successfully.")
    except Exception as e:
        logger.error(f"Failed to plot Precision-Recall curve: {e}")
        raise e

def run_evaluation():
    """
    Main evaluation pipeline.
    Loads data and model, generates predictions, computes metrics, and exports all outputs.
    """
    try:
        # Define Paths
        project_root = Path(__file__).resolve().parent.parent
        processed_data_path = Path(PROCESSED_TRAIN_PATH)
        model_path = project_root / "models" / "loan_model.keras"
        reports_dir = project_root / "reports"
        
        # Outputs
        cm_plot_path = reports_dir / "confusion_matrix.png"
        roc_plot_path = reports_dir / "roc_curve.png"
        pr_plot_path = reports_dir / "precision_recall_curve.png"
        report_txt_path = reports_dir / "classification_report.txt"
        metrics_json_path = reports_dir / "evaluation_metrics.json"
        
        reports_dir.mkdir(parents=True, exist_ok=True)
        
        # 1. Load data
        X_val, y_val = load_validation_data(processed_data_path)
        
        # 2. Load model
        if not model_path.exists():
            raise FileNotFoundError(f"Trained model not found at {model_path}. Please train the model first.")
        logger.info(f"Loading trained Keras model from {model_path}...")
        model = tf.keras.models.load_model(str(model_path))
        
        # 3. Generate predictions
        logger.info("Generating predictions on validation split...")
        y_pred_probs = model.predict(X_val).flatten()
        y_pred_labels = (y_pred_probs >= 0.5).astype(int)
        
        # 4. Compute Metrics
        logger.info("Calculating evaluation metrics...")
        acc = accuracy_score(y_val, y_pred_labels)
        prec = precision_score(y_val, y_pred_labels)
        rec = recall_score(y_val, y_pred_labels)
        f1 = f1_score(y_val, y_pred_labels)
        roc_auc = roc_auc_score(y_val, y_pred_probs)
        
        logger.info(f"Accuracy:  {acc:.4f}")
        logger.info(f"Precision: {prec:.4f}")
        logger.info(f"Recall:    {rec:.4f}")
        logger.info(f"F1 Score:  {f1:.4f}")
        logger.info(f"ROC-AUC:   {roc_auc:.4f}")
        
        metrics_dict = {
            "accuracy": float(acc),
            "precision": float(prec),
            "recall": float(rec),
            "f1_score": float(f1),
            "roc_auc": float(roc_auc)
        }
        
        # 5. Export JSON Metrics
        logger.info(f"Saving evaluation metrics JSON to {metrics_json_path}")
        with open(metrics_json_path, "w", encoding="utf-8") as f:
            json.dump(metrics_dict, f, indent=4)
            
        # 6. Export Classification Report TXT
        logger.info(f"Saving classification report text to {report_txt_path}")
        report_str = classification_report(y_val, y_pred_labels, target_names=["Rejected", "Approved"])
        with open(report_txt_path, "w", encoding="utf-8") as f:
            f.write("=== Keras Neural Network Classification Report ===\n")
            f.write(f"Evaluated on {X_val.shape[0]} Validation Samples (stratified 20% split)\n\n")
            f.write(report_str)
            f.write("\n=== Overall Metrics ===\n")
            for name, val in metrics_dict.items():
                f.write(f"{name.capitalize().replace('_', ' ')}: {val:.4f}\n")
                
        # 7. Generate Plots
        plot_confusion_matrix(y_val, y_pred_labels, cm_plot_path)
        plot_roc_curve(y_val, y_pred_probs, roc_auc, roc_plot_path)
        plot_precision_recall_curve(y_val, y_pred_probs, pr_plot_path)
        
        logger.info("Evaluation pipeline execution completed successfully!")
        
    except Exception as e:
        logger.critical(f"Critical error occurred in evaluation pipeline: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    run_evaluation()
