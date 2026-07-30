"""
Prediction/Inference module for loan approval classification.
Loads the preprocessor and trained Keras model, and performs inference on
single raw loan application inputs.
"""

import sys
import logging
from pathlib import Path
import pandas as pd
import numpy as np
import tensorflow as tf

# Ensure src directory is in sys.path if run directly
src_dir = Path(__file__).resolve().parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from config import PREPROCESSOR_PATH
from utils import load_object, setup_logging

logger = setup_logging()

# Global variables for caching model and preprocessor
_MODEL = None
_PREPROCESSOR = None

# Exact column definitions expected by the preprocessing pipeline
REQUIRED_FEATURES = [
    "ApplicantIncome",
    "CoapplicantIncome",
    "LoanAmount",
    "Loan_Amount_Term",
    "Gender",
    "Married",
    "Dependents",
    "Education",
    "Self_Employed",
    "Credit_History",
    "Property_Area"
]

def load_resources() -> tuple[tf.keras.models.Model, object]:
    """
    Loads and caches the trained Keras model and the scikit-learn preprocessor.

    Returns:
        tuple[tf.keras.models.Model, object]: (Keras Model, Preprocessor pipeline)
    """
    global _MODEL, _PREPROCESSOR
    try:
        if _MODEL is None or _PREPROCESSOR is None:
            project_root = Path(__file__).resolve().parent.parent
            model_path = project_root / "models" / "loan_model.keras"
            preprocessor_path = Path(PREPROCESSOR_PATH)
            
            logger.info("Loading preprocessing objects and trained model...")
            
            if not preprocessor_path.exists():
                raise FileNotFoundError(f"Preprocessor object not found at {preprocessor_path}")
            if not model_path.exists():
                raise FileNotFoundError(f"Trained Keras model not found at {model_path}")
                
            _PREPROCESSOR = load_object(preprocessor_path)
            _MODEL = tf.keras.models.load_model(str(model_path))
            
            logger.info("Resources loaded successfully.")
        return _MODEL, _PREPROCESSOR
        
    except Exception as e:
        logger.error(f"Failed to load model resources: {e}", exc_info=True)
        raise e

def predict_loan_approval(raw_data: dict) -> tuple[str, float]:
    """
    Predicts the loan approval status and returns the prediction probability.

    Args:
        raw_data (dict): Unprocessed key-value pairs representing a single application.

    Returns:
        tuple[str, float]: ("Loan Approved" or "Loan Rejected", probability)
    """
    try:
        model, preprocessor = load_resources()
        
        # Convert dictionary to DataFrame
        df = pd.DataFrame([raw_data])
        
        # Ensure all required features are present (fill missing with NaN to trigger pipeline imputers)
        for col in REQUIRED_FEATURES:
            if col not in df.columns:
                df[col] = np.nan
        
        # Align columns to the exact features the pipeline was trained on
        df = df[REQUIRED_FEATURES]
        
        # Preprocess features
        processed_df = preprocessor.transform(df)
        
        # Perform Keras model inference
        prob = float(model.predict(processed_df, verbose=0)[0][0])
        
        # Make binary decision based on threshold (0.50)
        decision = "Loan Approved" if prob >= 0.5 else "Loan Rejected"
        
        logger.info(f"Prediction complete. Decision: {decision} (Probability: {prob:.4f})")
        return decision, prob
        
    except Exception as e:
        logger.error(f"Failed to run inference: {e}", exc_info=True)
        raise e

def run_sample_predictions():
    """
    Runs prediction on sample inputs to test and verify the predict pipeline.
    """
    logger.info("Starting sample predictions test...")
    
    # 1. High likelihood of approval: good income, good credit history, graduate
    sample_approved = {
        "Gender": "Male",
        "Married": "Yes",
        "Dependents": "1",
        "Education": "Graduate",
        "Self_Employed": "No",
        "ApplicantIncome": 6000,
        "CoapplicantIncome": 2500,
        "LoanAmount": 120,
        "Loan_Amount_Term": 360,
        "Credit_History": 1.0,
        "Property_Area": "Semiurban"
    }
    
    # 2. High likelihood of rejection: low income, high loan request, poor credit history
    sample_rejected = {
        "Gender": "Female",
        "Married": "No",
        "Dependents": "0",
        "Education": "Not Graduate",
        "Self_Employed": "Yes",
        "ApplicantIncome": 1200,
        "CoapplicantIncome": 0,
        "LoanAmount": 350,
        "Loan_Amount_Term": 360,
        "Credit_History": 0.0,
        "Property_Area": "Rural"
    }
    
    logger.info("Testing approved sample application...")
    decision1, prob1 = predict_loan_approval(sample_approved)
    print(f"\n[SAMPLE 1] Input: Good Profile")
    print(f"Decision: {decision1}")
    print(f"Probability of Approval: {prob1:.4f}\n")
    
    logger.info("Testing rejected sample application...")
    decision2, prob2 = predict_loan_approval(sample_rejected)
    print(f"[SAMPLE 2] Input: High-Risk Profile")
    print(f"Decision: {decision2}")
    print(f"Probability of Approval: {prob2:.4f}\n")

if __name__ == "__main__":
    run_sample_predictions()
