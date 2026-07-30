import sys
import logging
from pathlib import Path
import pandas as pd
import numpy as np

# Configure system paths to import from root src/ directory
backend_dir = Path(__file__).resolve().parent
project_root = backend_dir.parent
src_dir = project_root / "src"

if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

# Set logger
logger = logging.getLogger("lendwise_backend")

# Import the existing ML components from src/
try:
    from predict import load_resources, predict_loan_approval
    from explainability import load_explainer_resources, compute_shap_explanations
    from genai_advisor import generate_risk_report
    from llm_assistant import ask_ai_assistant
    from pdf_generator import generate_underwriting_pdf
except Exception as e:
    logger.error(f"Failed to import core ML modules from src: {e}", exc_info=True)
    raise e

def initialize_services():
    """
    Loads and caches Keras models, preprocessors, and SHAP explainers during startup.
    Satisfies technical requirements to avoid reloading models on demand.
    """
    logger.info("Initializing LendWise AI service caches...")
    try:
        # Pre-cache TensorFlow model and scikit-learn preprocessor
        model, preprocessor = load_resources()
        logger.info(f"Keras model loaded. Input shape: {model.input_shape}")
        
        # Pre-cache SHAP explainer
        _, explainer, _ = load_explainer_resources()
        logger.info("SHAP KernelExplainer pre-cached successfully.")
        
    except Exception as e:
        logger.error(f"Failed to initialize LendWise services during startup: {e}", exc_info=True)
        raise e

class UnderwritingService:
    @staticmethod
    def predict(raw_data: dict) -> tuple[str, float]:
        """
        Runs model inference using predict_loan_approval.
        """
        return predict_loan_approval(raw_data)

    @staticmethod
    def generate_report_data(raw_data: dict, prediction: str, probability: float) -> dict:
        """
        Computes Fraud Risk Scores and drafts advisor narratives.
        """
        return generate_risk_report(raw_data, prediction, probability)

    @staticmethod
    def explain(raw_data: dict) -> dict:
        """
        Preprocesses row features and runs SHAP attributions.
        """
        # Load resources to fetch preprocessor
        _, preprocessor = load_resources()
        
        # Convert raw dict to DataFrame
        df_row = pd.DataFrame([raw_data])
        
        # Ensure all columns present
        from predict import REQUIRED_FEATURES
        for col in REQUIRED_FEATURES:
            if col not in df_row.columns:
                df_row[col] = np.nan
        df_row = df_row[REQUIRED_FEATURES]
        
        # Transform using fitted preprocessor
        processed_row = preprocessor.transform(df_row)
        processed_row_df = pd.DataFrame(processed_row, columns=preprocessor.get_feature_names_out())
        
        # Run SHAP explanations
        return compute_shap_explanations(processed_row_df)

    @staticmethod
    def chat(raw_data: dict, report_data: dict, question: str, api_key: str = None) -> str:
        """
        Calls live Gemini/OpenAI endpoints or local parser.
        """
        return ask_ai_assistant(raw_data, report_data, question, api_key)

    @staticmethod
    def generate_pdf(raw_data: dict, report_data: dict, summary_text: str = "") -> bytes:
        """
        Compiles report details into a print-ready PDF byte stream.
        """
        return generate_underwriting_pdf(raw_data, report_data, summary_text)
