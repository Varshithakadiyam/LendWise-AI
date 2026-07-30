"""
SHAP Explainability module for Keras model predictions.
Initializes the SHAP KernelExplainer using a representative background sample,
groups multi-column one-hot encoded variables back to their 11 base features,
generates plain-English narrative explainability, and plots interactive Plotly charts.
"""

import sys
import logging
from pathlib import Path
import numpy as np
import pandas as pd
import shap
import tensorflow as tf
import plotly.graph_objects as go

# Ensure src directory is in sys.path if run directly
src_dir = Path(__file__).resolve().parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from config import PROCESSED_TRAIN_PATH, TARGET_COLUMN, ID_COLUMN
from utils import setup_logging

logger = setup_logging()

# Global variables for caching explainer and model
_EXPLAINER = None
_MODEL = None
_BACKGROUND_X = None

FEATURE_MAPPING = {
    "Credit History": ["cat__Credit_History_0.0", "cat__Credit_History_1.0"],
    "Loan Amount": ["num__LoanAmount"],
    "Applicant Income": ["num__ApplicantIncome"],
    "Co-applicant Income": ["num__CoapplicantIncome"],
    "Loan Term": ["num__Loan_Amount_Term"],
    "Employment Status": ["cat__Self_Employed_No", "cat__Self_Employed_Yes"],
    "Education": ["cat__Education_Graduate", "cat__Education_Not Graduate"],
    "Property Area": ["cat__Property_Area_Rural", "cat__Property_Area_Semiurban", "cat__Property_Area_Urban"],
    "Dependents": ["cat__Dependents_0", "cat__Dependents_1", "cat__Dependents_2", "cat__Dependents_3+"],
    "Marital Status": ["cat__Married_No", "cat__Married_Yes"],
    "Gender": ["cat__Gender_Female", "cat__Gender_Male"]
}

PLAIN_ENGLISH_EXPLANATIONS = {
    "Credit History": "Favorable loan repayment records significantly reduce credit risk, whereas previous defaults or lack of history are key negative drivers.",
    "Loan Amount": "Higher requested loan sizes relative to background averages increase leverage and repayment risk, while conservative requests support approval.",
    "Applicant Income": "Higher primary income increases the debt-to-income margin, while low income limits the monthly installment coverage capacity.",
    "Co-applicant Income": "A secondary income stream adds to household repayment security, reducing the single-borrower risk burden.",
    "Loan Term": "Shorter terms increase monthly payment pressure, whereas standard longer terms (e.g. 30 years) lower monthly payments but increase total interest.",
    "Employment Status": "Stable salaried positions offer consistent cashflow, while self-employment introduces potential business volatility.",
    "Education": "Higher educational status correlates with employment stability, serving as a secondary demographic support indicator.",
    "Property Area": "Semiurban property areas generally see higher approval ratios, while rural areas carry slightly higher structural risk markers.",
    "Dependents": "More dependents increase non-discretionary household expenses, reducing disposable income available for debt servicing.",
    "Marital Status": "Joint applications (married status) imply shared financial responsibility, which generally lowers risk scores.",
    "Gender": "Demographic identifier that serves as a neutral categorizer in the dataset with minimal predictive weight."
}

def load_explainer_resources() -> tuple[tf.keras.models.Model, shap.KernelExplainer, pd.DataFrame]:
    """
    Loads and caches Keras model, SHAP KernelExplainer, and background dataframe.
    """
    global _MODEL, _EXPLAINER, _BACKGROUND_X
    try:
        if _MODEL is None or _EXPLAINER is None or _BACKGROUND_X is None:
            project_root = Path(__file__).resolve().parent.parent
            model_path = project_root / "models" / "loan_model.keras"
            processed_train_path = Path(PROCESSED_TRAIN_PATH)
            
            logger.info("Initializing SHAP resources...")
            _MODEL = tf.keras.models.load_model(str(model_path))
            
            # Load background data
            df = pd.read_csv(processed_train_path)
            drop_cols = [TARGET_COLUMN]
            if ID_COLUMN in df.columns:
                drop_cols.append(ID_COLUMN)
            X = df.drop(columns=drop_cols)
            
            # Draw a representative 50-row background sample for explanation reference
            _BACKGROUND_X = X.sample(50, random_state=42)
            
            # Suppress model fit prediction logging during explanation
            def model_predict(data):
                return _MODEL.predict(data, verbose=0).flatten()
                
            _EXPLAINER = shap.KernelExplainer(model_predict, _BACKGROUND_X)
            logger.info("SHAP KernelExplainer initialized successfully.")
            
        return _MODEL, _EXPLAINER, _BACKGROUND_X
        
    except Exception as e:
        logger.error(f"Failed to initialize SHAP: {e}", exc_info=True)
        raise e

def compute_shap_explanations(processed_row_df: pd.DataFrame) -> dict:
    """
    Computes SHAP values for a single preprocessed applicant row and groups them.
    
    Args:
        processed_row_df (pd.DataFrame): Single row preprocessed dataframe (shape 1, 21).
        
    Returns:
        dict: Explanations mapping features to their raw SHAP contributions, positive/negative tags.
    """
    try:
        _, explainer, _ = load_explainer_resources()
        
        # Calculate raw SHAP values
        raw_shap_values = explainer.shap_values(processed_row_df)
        
        # Flatten SHAP values to 1D array
        if isinstance(raw_shap_values, list):
            # For multiclass Keras outputs (not our binary sigmoid case, but for safety)
            shap_flat = raw_shap_values[0].flatten()
        else:
            shap_flat = raw_shap_values.flatten()
            
        processed_columns = processed_row_df.columns.tolist()
        
        # Group SHAP values back to original features
        grouped_shap = {}
        for feature_name, col_list in FEATURE_MAPPING.items():
            feature_contribution = 0.0
            for col in col_list:
                if col in processed_columns:
                    col_idx = processed_columns.index(col)
                    feature_contribution += shap_flat[col_idx]
            grouped_shap[feature_name] = float(feature_contribution)
            
        # Separate into positive and negative contributors
        positive_contribs = []
        negative_contribs = []
        
        for feat, val in sorted(grouped_shap.items(), key=lambda item: abs(item[1]), reverse=True):
            desc = PLAIN_ENGLISH_EXPLANATIONS.get(feat, "")
            contrib_pct = val * 100
            
            if val > 0.005:  # meaningful positive contribution (> 0.5% probability increase)
                positive_contribs.append({
                    "feature": feat,
                    "contribution": contrib_pct,
                    "explanation": f"✓ {feat}: Favorable contribution (+{contrib_pct:.2f}%). {desc}"
                })
            elif val < -0.005:  # meaningful negative contribution (< -0.5% probability decrease)
                negative_contribs.append({
                    "feature": feat,
                    "contribution": contrib_pct,
                    "explanation": f"✗ {feat}: Negative impact ({contrib_pct:.2f}%). {desc}"
                })
                
        # Generate summary description
        summary_bullets = []
        if positive_contribs:
            summary_bullets.append("Key Favorable Factors: " + ", ".join([c["feature"] for c in positive_contribs[:3]]))
        if negative_contribs:
            summary_bullets.append("Key Risk Factors: " + ", ".join([c["feature"] for c in negative_contribs[:3]]))
            
        summary_text = " | ".join(summary_bullets) if summary_bullets else "No single feature dominantly influenced this decision."
        
        return {
            "grouped_shap": grouped_shap,
            "positive_contributions": positive_contribs,
            "negative_contributions": negative_contribs,
            "summary_text": summary_text
        }
        
    except Exception as e:
        logger.error(f"Error computing SHAP explanation: {e}", exc_info=True)
        return {
            "grouped_shap": {},
            "positive_contributions": [],
            "negative_contributions": [],
            "summary_text": "Explainability computation is temporarily unavailable."
        }

def plot_shap_bar_chart(grouped_shap: dict) -> go.Figure:
    """
    Generates an interactive Plotly horizontal bar chart of feature contributions.
    """
    try:
        # Sort features by absolute contribution
        sorted_feats = sorted(grouped_shap.items(), key=lambda item: abs(item[1]), reverse=False)
        
        features = [item[0] for item in sorted_feats]
        shap_vals = [item[1] * 100 for item in sorted_feats] # convert to %
        
        # Color coding: positive values green (#137333), negative values red (#c5221f)
        colors = ["#137333" if val >= 0 else "#c5221f" for val in shap_vals]
        
        fig = go.Figure()
        fig.add_trace(go.Bar(
            y=features,
            x=shap_vals,
            orientation='h',
            marker_color=colors,
            text=[f"{val:+.1f}%" for val in shap_vals],
            textposition='auto',
            hovertemplate="<b>%{y}</b><br>Contribution: %{x:+.2f}%<extra></extra>"
        ))
        
        fig.update_layout(
            title={
                'text': "Local Feature Impact on Approval Probability",
                'y': 0.95,
                'x': 0.5,
                'xanchor': 'center',
                'yanchor': 'top',
                'font': {'size': 16, 'color': '#202124'}
            },
            xaxis_title="Impact on Model Output Probability (%)",
            yaxis_title="Feature",
            height=400,
            margin=dict(l=20, r=20, t=60, b=40),
            plot_bgcolor='white',
            paper_bgcolor='white'
        )
        
        fig.update_xaxes(showgrid=True, gridwidth=1, gridcolor='#f1f3f4', zeroline=True, zerolinewidth=1.5, zerolinecolor='#9aa0a6')
        fig.update_yaxes(showgrid=False)
        
        return fig
        
    except Exception as e:
        logger.error(f"Failed to plot SHAP chart: {e}")
        # empty dummy figure
        return go.Figure()
