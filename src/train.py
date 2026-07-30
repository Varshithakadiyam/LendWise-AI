"""
Training module for loan fraud/approval detection.
Loads processed data, builds, compiles, and trains the Keras neural network model,
and saves history and plots.
"""

import json
import logging
import sys
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
import tensorflow as tf
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint

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
from model import build_model

logger = setup_logging()

def load_data(data_path: Path) -> tuple[pd.DataFrame, pd.Series]:
    """
    Loads the processed training dataset and splits it into features and target.

    Args:
        data_path (Path): Path to the processed training CSV file.

    Returns:
        tuple[pd.DataFrame, pd.Series]: Features (X) and Target (y).
    """
    try:
        logger.info(f"Loading processed data from {data_path}...")
        df = pd.read_csv(data_path)
        
        # Verify columns exist
        if TARGET_COLUMN not in df.columns:
            raise KeyError(f"Target column '{TARGET_COLUMN}' not found in dataset columns: {df.columns.tolist()}")
        
        # Separate features and target
        y = df[TARGET_COLUMN]
        
        # Drop ID and target columns to get feature matrix
        drop_cols = [TARGET_COLUMN]
        if ID_COLUMN in df.columns:
            drop_cols.append(ID_COLUMN)
        
        X = df.drop(columns=drop_cols)
        
        logger.info(f"Features shape: {X.shape}, Target shape: {y.shape}")
        return X, y
        
    except Exception as e:
        logger.error(f"Failed to load and process data from {data_path}: {e}")
        raise e

def plot_and_save_history(history_dict: dict, output_dir: Path) -> Path:
    """
    Generates training and validation performance plots and saves them.

    Args:
        history_dict (dict): Keras training history dictionary.
        output_dir (Path): Directory where the plots will be saved.

    Returns:
        Path: Path to the saved plot image.
    """
    try:
        output_dir.mkdir(parents=True, exist_ok=True)
        plot_path = output_dir / "training_curves.png"
        
        epochs_range = range(1, len(history_dict["loss"]) + 1)
        
        # Premium dark mode/clean styling
        plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
        fig, axs = plt.subplots(2, 2, figsize=(14, 10))
        fig.suptitle("Model Training Performance Dashboard", fontsize=16, fontweight="bold", y=0.98)
        
        # 1. Loss Plot
        axs[0, 0].plot(epochs_range, history_dict["loss"], label="Train Loss", marker="o", color="#1f77b4")
        axs[0, 0].plot(epochs_range, history_dict["val_loss"], label="Val Loss", marker="x", color="#ff7f0e")
        axs[0, 0].set_title("Loss Curve", fontsize=12, fontweight="semibold")
        axs[0, 0].set_xlabel("Epoch")
        axs[0, 0].set_ylabel("Loss")
        axs[0, 0].legend(loc="upper right")
        
        # 2. Accuracy Plot
        axs[0, 1].plot(epochs_range, history_dict["accuracy"], label="Train Acc", marker="o", color="#2ca02c")
        axs[0, 1].plot(epochs_range, history_dict["val_accuracy"], label="Val Acc", marker="x", color="#d62728")
        axs[0, 1].set_title("Accuracy Curve", fontsize=12, fontweight="semibold")
        axs[0, 1].set_xlabel("Epoch")
        axs[0, 1].set_ylabel("Accuracy")
        axs[0, 1].legend(loc="lower right")
        
        # 3. AUC Plot
        axs[1, 0].plot(epochs_range, history_dict["auc"], label="Train AUC", marker="o", color="#9467bd")
        axs[1, 0].plot(epochs_range, history_dict["val_auc"], label="Val AUC", marker="x", color="#8c564b")
        axs[1, 0].set_title("Area Under ROC Curve (AUC)", fontsize=12, fontweight="semibold")
        axs[1, 0].set_xlabel("Epoch")
        axs[1, 0].set_ylabel("AUC")
        axs[1, 0].legend(loc="lower right")
        
        # 4. Precision & Recall Plot
        axs[1, 1].plot(epochs_range, history_dict["val_precision"], label="Val Precision", marker="x", color="#e377c2")
        axs[1, 1].plot(epochs_range, history_dict["val_recall"], label="Val Recall", marker="s", color="#7f7f7f")
        axs[1, 1].set_title("Validation Precision & Recall", fontsize=12, fontweight="semibold")
        axs[1, 1].set_xlabel("Epoch")
        axs[1, 1].set_ylabel("Score")
        axs[1, 1].legend(loc="lower right")
        
        plt.tight_layout()
        plt.savefig(plot_path, dpi=150, bbox_inches="tight")
        plt.close()
        
        logger.info(f"Saved training curves plot to {plot_path}")
        return plot_path
        
    except Exception as e:
        logger.error(f"Failed to plot training history: {e}")
        raise e

def train_pipeline():
    """
    Main training execution function.
    Coordinates loading data, train-validation splitting, building model, callbacks,
    fitting model, saving metrics history, and generating plots.
    """
    try:
        # 1. Define pathlib paths
        project_root = Path(__file__).resolve().parent.parent
        processed_data_path = Path(PROCESSED_TRAIN_PATH)
        models_dir = project_root / "models"
        reports_dir = project_root / "reports"
        
        model_save_path = models_dir / "loan_model.keras"
        history_json_path = reports_dir / "history.json"
        history_csv_path = reports_dir / "history.csv"
        
        # Ensure output directories exist
        models_dir.mkdir(parents=True, exist_ok=True)
        reports_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Project Root: {project_root}")
        logger.info(f"Model Save Path: {model_save_path}")
        logger.info(f"Reports Directory: {reports_dir}")
        
        # 2. Load and split data
        X, y = load_data(processed_data_path)
        
        logger.info(f"Splitting dataset with test_size={TEST_SIZE} and random_state={RANDOM_STATE} (stratified)")
        X_train, X_val, y_train, y_val = train_test_split(
            X, 
            y, 
            test_size=TEST_SIZE, 
            random_state=RANDOM_STATE, 
            stratify=y
        )
        logger.info(f"Train split size: {X_train.shape[0]} samples. Validation split size: {X_val.shape[0]} samples.")
        
        # 3. Build model
        input_dim = X_train.shape[1]
        model = build_model(input_dim)
        
        # 4. Set up callbacks
        logger.info("Setting up Callbacks (EarlyStopping, ReduceLROnPlateau, ModelCheckpoint)...")
        callbacks = [
            EarlyStopping(
                monitor="val_loss",
                patience=5,
                restore_best_weights=True,
                verbose=1
            ),
            ReduceLROnPlateau(
                monitor="val_loss",
                factor=0.2,
                patience=3,
                min_lr=1e-6,
                verbose=1
            ),
            ModelCheckpoint(
                filepath=str(model_save_path),
                monitor="val_loss",
                save_best_only=True,
                verbose=1
            )
        ]
        
        # 5. Train model
        initial_epochs = 10
        logger.info(f"Starting training for {initial_epochs} epochs initially to verify pipeline...")
        
        history = model.fit(
            X_train,
            y_train,
            validation_data=(X_val, y_val),
            epochs=initial_epochs,
            batch_size=32,
            callbacks=callbacks,
            verbose=1
        )
        
        # 6. Save training history
        history_dict = history.history
        
        # Convert list of floats (numpy floats) to native Python floats for JSON compatibility
        history_dict_serializable = {
            metric: [float(val) for val in values] 
            for metric, values in history_dict.items()
        }
        
        logger.info(f"Saving training history to JSON at {history_json_path}")
        with open(history_json_path, "w", encoding="utf-8") as f:
            json.dump(history_dict_serializable, f, indent=4)
            
        logger.info(f"Saving training history to CSV at {history_csv_path}")
        pd.DataFrame(history_dict).to_csv(history_csv_path, index=False)
        
        # 7. Plot and save training curves
        plot_and_save_history(history_dict_serializable, reports_dir)
        
        logger.info("Training pipeline execution completed successfully!")
        
    except Exception as e:
        logger.critical(f"Critical error occurred in training pipeline: {e}", exc_info=True)
        sys.exit(1)

if __name__ == "__main__":
    train_pipeline()
