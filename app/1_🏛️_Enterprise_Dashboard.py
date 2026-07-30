"""
Enterprise Loan Risk Assessment & Underwriting Dashboard.
The primary entrypoint for the Streamlit decision support system.
Displays validation metrics, gathers applicant data, performs DL predictions,
generates generative risk reports, compiles PDFs, and stores session state.
"""

import sys
import json
import logging
from pathlib import Path
import numpy as np
import pandas as pd
import streamlit as st
import plotly.graph_objects as go

# Setup python path to import modules from src/
project_root = Path(__file__).resolve().parent.parent
src_dir = project_root / "src"
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

# Configure Page
st.set_page_config(
    page_title="Apex Risk Dashboard",
    page_icon="🏛️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Safe session state helper to support bare python execution (for automated testing)
_BARE_STATE = {}

def set_state(key, val):
    try:
        st.session_state[key] = val
    except Exception:
        pass
    _BARE_STATE[key] = val

def get_state(key, default=None):
    try:
        if key in st.session_state:
            return st.session_state[key]
    except Exception:
        pass
    return _BARE_STATE.get(key, default)

# Load metrics safely
metrics_path = project_root / "reports" / "evaluation_metrics.json"
model_metrics = {"accuracy": 0.8293, "precision": 0.8265, "recall": 0.9529, "roc_auc": 0.8012}
if metrics_path.exists():
    try:
        with open(metrics_path, "r", encoding="utf-8") as f:
            model_metrics = json.load(f)
    except Exception:
        pass

# Imports
try:
    from predict import predict_loan_approval
    from genai_advisor import generate_risk_report
    from explainability import compute_shap_explanations
    from pdf_generator import generate_underwriting_pdf
    from utils import setup_logging
    logger = setup_logging()
except Exception as e:
    st.error("Failed to import core modules. Check folder structure.")
    st.exception(e)
    st.stop()

# Helper presets
PRESETS = {
    "Select Profile Preset...": None,
    "Favorable Profile (Low Risk)": {
        "Gender": "Male",
        "Married": "Yes",
        "Dependents": "0",
        "Education": "Graduate",
        "Self_Employed": "No",
        "ApplicantIncome": 7500.0,
        "CoapplicantIncome": 2500.0,
        "LoanAmount": 120.0,
        "Loan_Amount_Term": 360.0,
        "Credit_History": 1.0,
        "Property_Area": "Semiurban"
    },
    "High Leverage Profile (Medium Risk)": {
        "Gender": "Female",
        "Married": "No",
        "Dependents": "1",
        "Education": "Graduate",
        "Self_Employed": "No",
        "ApplicantIncome": 4800.0,
        "CoapplicantIncome": 0.0,
        "LoanAmount": 280.0,
        "Loan_Amount_Term": 360.0,
        "Credit_History": 1.0,
        "Property_Area": "Urban"
    },
    "Delinquent & Volatile Profile (High Risk)": {
        "Gender": "Female",
        "Married": "No",
        "Dependents": "2",
        "Education": "Not Graduate",
        "Self_Employed": "Yes",
        "ApplicantIncome": 2000.0,
        "CoapplicantIncome": 0.0,
        "LoanAmount": 180.0,
        "Loan_Amount_Term": 180.0,
        "Credit_History": 0.0,
        "Property_Area": "Rural"
    }
}

# Theme/CSS Styling
st.markdown("""
<style>
    .kpi-container {
        background-color: #f1f3f4;
        padding: 12px;
        border-radius: 6px;
        text-align: center;
        border: 1px solid #dadce0;
    }
    .risk-badge {
        display: inline-block;
        padding: 6px 12px;
        border-radius: 4px;
        font-weight: bold;
        color: white;
    }
    .low-risk-bg { background-color: #137333; }
    .medium-risk-bg { background-color: #b06000; }
    .high-risk-bg { background-color: #c5221f; }
</style>
""", unsafe_allow_html=True)

def main():
    st.title("🏛️ Apex Credit - Enterprise Risk & Underwriting Dashboard")
    st.markdown(
        "Welcome to the **Apex Enterprise Loan Risk Assessment Platform**. This interface integrates "
        "production Keras deep learning modeling with local SHAP attribution and generative underwriter Q&A routing."
    )
    
    # 1. Display Model Evaluation KPI metrics (Feature 5)
    st.markdown("##### 📈 Validated Deep Learning Model Metrics")
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric(label="Validation Accuracy", value=f"{model_metrics['accuracy']*100:.2f}%")
    with col2:
        st.metric(label="Validation Precision", value=f"{model_metrics['precision']*100:.2f}%")
    with col3:
        st.metric(label="Validation Recall", value=f"{model_metrics['recall']*100:.2f}%")
    with col4:
        st.metric(label="Validation ROC-AUC", value=f"{model_metrics['roc_auc']:.4f}")
        
    st.divider()
    
    # Sidebar API Config (Feature 1/11 - Security)
    st.sidebar.title("🔑 LLM Configuration")
    api_key = st.sidebar.text_input("Enter Gemini or OpenAI API Key", type="password", help="Providing a key enables real-time LLM chats on the 'Ask AI' subpage. Leave blank to run local rule-based fallback.")
    if api_key:
        st.sidebar.success("Custom API key loaded.")
    else:
        st.sidebar.info("Running in local offline fallback mode.")
    
    # Grid Layout: Left form inputs, Right results
    col_input, col_display = st.columns([1, 1.2])
    
    with col_input:
        st.subheader("📋 Applicant Input profile")
        
        # Profile presets dropdown (Enterprise UX)
        preset_choice = st.selectbox("Load Demo Applicant Presets", list(PRESETS.keys()))
        selected_preset = PRESETS[preset_choice]
        
        # Determine defaults based on selection
        def_gender = selected_preset["Gender"] if selected_preset else "Male"
        def_married = selected_preset["Married"] if selected_preset else "Yes"
        def_dependents = selected_preset["Dependents"] if selected_preset else "0"
        def_education = selected_preset["Education"] if selected_preset else "Graduate"
        def_self_emp = selected_preset["Self_Employed"] if selected_preset else "No"
        def_app_inc = selected_preset["ApplicantIncome"] if selected_preset else 5000.0
        def_co_inc = selected_preset["CoapplicantIncome"] if selected_preset else 0.0
        def_loan_amt = selected_preset["LoanAmount"] if selected_preset else 150.0
        def_term = selected_preset["Loan_Amount_Term"] if selected_preset else 360.0
        def_cred_label = "Favorable" if selected_preset and selected_preset["Credit_History"] == 1.0 else "Delinquent/None"
        def_prop = selected_preset["Property_Area"] if selected_preset else "Semiurban"
        
        with st.form("underwriter_applicant_form"):
            col_g, col_m, col_d = st.columns(3)
            with col_g:
                gender = st.selectbox("Gender", ["Male", "Female"], index=["Male", "Female"].index(def_gender))
            with col_m:
                married = st.selectbox("Married", ["Yes", "No"], index=["Yes", "No"].index(def_married))
            with col_d:
                dependents = st.selectbox("Dependents", ["0", "1", "2", "3+"], index=["0", "1", "2", "3+"].index(def_dependents))
                
            col_ed, col_se, col_pr = st.columns(3)
            with col_ed:
                education = st.selectbox("Education", ["Graduate", "Not Graduate"], index=["Graduate", "Not Graduate"].index(def_education))
            with col_se:
                self_employed = st.selectbox("Self Employed", ["No", "Yes"], index=["No", "Yes"].index(def_self_emp))
            with col_pr:
                property_area = st.selectbox("Property Area", ["Semiurban", "Urban", "Rural"], index=["Semiurban", "Urban", "Rural"].index(def_prop))
                
            col_i, col_ci = st.columns(2)
            with col_i:
                applicant_income = st.number_input("Monthly Applicant Income ($)", min_value=0.0, value=float(def_app_inc), step=250.0)
            with col_ci:
                coapplicant_income = st.number_input("Monthly Co-applicant Income ($)", min_value=0.0, value=float(def_co_inc), step=250.0)
                
            col_a, col_t, col_cr = st.columns(3)
            with col_a:
                loan_amount = st.number_input("Loan Amount (Thousands $)", min_value=0.0, value=float(def_loan_amt), step=10.0)
            with col_t:
                loan_term = st.selectbox("Term (Months)", [360, 240, 180, 120, 84, 60, 36, 12], index=[360, 240, 180, 120, 84, 60, 36, 12].index(int(def_term)))
            with col_cr:
                credit_history_label = st.selectbox("Credit History", ["Favorable", "Delinquent/None"], index=["Favorable", "Delinquent/None"].index(def_cred_label))
                
            credit_history = 1.0 if credit_history_label == "Favorable" else 0.0
            
            submit_btn = st.form_submit_button("🚀 Run Risk Diagnostic", use_container_width=True)
            
    with col_display:
        st.subheader("📊 Diagnostic Summary")
        
        # Execute prediction if submitted or not already present in local helper state
        if submit_btn or get_state("applicant_data") is None:
            # Construct dictionary
            applicant_data = {
                "Gender": gender,
                "Married": married,
                "Dependents": dependents,
                "Education": education,
                "Self_Employed": self_employed,
                "ApplicantIncome": float(applicant_income),
                "CoapplicantIncome": float(coapplicant_income),
                "LoanAmount": float(loan_amount),
                "Loan_Amount_Term": float(loan_term),
                "Credit_History": credit_history,
                "Property_Area": property_area
            }
            
            with st.spinner("Processing deep learning and explainability attributions..."):
                try:
                    # 1. DL prediction
                    pred_label, app_prob = predict_loan_approval(applicant_data)
                    confidence = app_prob if pred_label == "Loan Approved" else (1.0 - app_prob)
                    
                    # 2. Risk Advisor Analysis
                    report_data = generate_risk_report(applicant_data, pred_label, app_prob)
                    
                    # 3. SHAP Explainability (Feature 2)
                    from predict import load_resources
                    _, preprocessor = load_resources()
                    df_row = pd.DataFrame([applicant_data])
                    from predict import REQUIRED_FEATURES
                    for col in REQUIRED_FEATURES:
                        if col not in df_row.columns:
                            df_row[col] = np.nan
                    df_row = df_row[REQUIRED_FEATURES]
                    processed_row = preprocessor.transform(df_row)
                    
                    shap_data = compute_shap_explanations(processed_row)
                    
                    # Store variables in safe state helper
                    set_state("applicant_data", applicant_data)
                    set_state("report_data", report_data)
                    set_state("shap_data", shap_data)
                    set_state("model_prediction", pred_label)
                    set_state("prediction_confidence", confidence)
                    set_state("api_key", api_key)
                    
                except Exception as ex:
                    st.error("Error occurred in diagnostic pipeline execution:")
                    st.exception(ex)
                    st.stop()
                    
        # Load currently active diagnosis from safe state helper
        applicant_data = get_state("applicant_data")
        report_data = get_state("report_data")
        shap_data = get_state("shap_data")
        pred_label = get_state("model_prediction")
        confidence = get_state("prediction_confidence")
        
        # Load scores
        risk_score = report_data["risk_score"]
        risk_level = report_data["risk_level"]
        decision = report_data["suggested_underwriter_decision"]
        explanation = report_data["explanation"]
        
        # Setup colors
        badge_color = "low-risk-bg"
        if risk_level == "MEDIUM RISK":
            badge_color = "medium-risk-bg"
        elif risk_level == "HIGH RISK":
            badge_color = "high-risk-bg"
            
        # Display KPI Summary Card
        st.markdown(f"""
        <div style='background-color: #ffffff; border: 1px solid #dadce0; border-radius: 8px; padding: 16px; margin-bottom:15px;'>
            <h4 style='margin:0 0 10px 0;'>Diagnostic Decision: <span class='risk-badge {badge_color}'>{risk_level}</span></h4>
            <p style='margin: 0 0 5px 0; font-size:14px;'>DL Prediction: <b>{pred_label}</b> (Confidence: {confidence * 100:.1f}%)</p>
            <p style='margin: 0 0 5px 0; font-size:14px;'>Suggested Underwriter Decision: <b>{decision}</b></p>
        </div>
        """, unsafe_allow_html=True)
        
        # Interactive Plotly Gauge (Feature 5)
        fig_gauge = go.Figure(go.Indicator(
            mode = "gauge+number",
            value = risk_score,
            domain = {'x': [0, 1], 'y': [0, 1]},
            title = {'text': "Fraud/Default Risk Score Meter", 'font': {'size': 14, 'color': '#5f6368'}},
            gauge = {
                'axis': {'range': [None, 100], 'tickwidth': 1, 'tickcolor': "#5f6368"},
                'bar': {'color': "#202124", 'thickness': 0.25},
                'bgcolor': "white",
                'borderwidth': 1.5,
                'bordercolor': "#dadce0",
                'steps': [
                    {'range': [0, 30], 'color': '#e6f4ea'},
                    {'range': [30, 60], 'color': '#fef7e0'},
                    {'range': [60, 100], 'color': '#fce8e6'}
                ],
                'threshold': {
                    'line': {'color': "red", 'width': 4},
                    'thickness': 0.75,
                    'value': risk_score
                }
            }
        ))
        fig_gauge.update_layout(height=180, margin=dict(l=10, r=10, t=30, b=10))
        st.plotly_chart(fig_gauge, use_container_width=True, config={'displayModeBar': False})
        
        # Executive Summary (Feature 6)
        st.write("**Executive Summary:**")
        st.info(explanation)
        
        # Verification Documents checklist (Feature 4)
        st.write("**Recommended Verification Checklist:**")
        for step in report_data["verification_steps"]:
            st.checkbox(step, value=False, key=f"dash_step_{step[:30]}_{risk_score}")
            
        st.divider()
        
        # Download reports buttons (Feature 7)
        try:
            # Generate PDF in memory
            pdf_bytes = generate_underwriting_pdf(applicant_data, report_data, shap_data.get("summary_text"))
            
            col_pdf, col_txt = st.columns(2)
            with col_pdf:
                st.download_button(
                    label="📥 Export PDF Risk Report",
                    data=pdf_bytes,
                    file_name=f"Loan_Risk_Report_Score_{risk_score}.pdf",
                    mime="application/pdf",
                    use_container_width=True
                )
            with col_txt:
                st.download_button(
                    label="📥 Export Plain Text Report",
                    data=report_data["report_text"],
                    file_name=f"Loan_Risk_Report_Score_{risk_score}.txt",
                    mime="text/plain",
                    use_container_width=True
                )
        except Exception as e:
            st.error("Error creating report download actions.")
            logger.error(f"Failed to create report buttons: {e}")

if __name__ == "__main__":
    main()
