"""
Streamlit subpage for model explainability via SHAP (Feature 2).
Loads Keras predictions and SHAP values from session state,
plots Plotly bar charts of local feature attribution,
and outlines positive and negative contributions in plain English.
"""

import sys
from pathlib import Path
import streamlit as st

# Setup python path to import modules from src/
project_root = Path(__file__).resolve().parent.parent.parent
src_dir = project_root / "src"
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

# Configure Page
st.set_page_config(
    page_title="SHAP Explainability",
    page_icon="🔬",
    layout="wide"
)

# Safe session state helper for bare python compatibility
def get_state(key, default=None):
    try:
        if key in st.session_state:
            return st.session_state[key]
    except Exception:
        pass
    # Fallback default values for bare mode testing
    if key == "applicant_data":
        return {
            "Gender": "Male", "Married": "Yes", "Dependents": "0", "Education": "Graduate",
            "Self_Employed": "No", "ApplicantIncome": 5000, "CoapplicantIncome": 0,
            "LoanAmount": 150, "Loan_Amount_Term": 360, "Credit_History": 1.0, "Property_Area": "Semiurban"
        }
    if key == "shap_data":
        return {
            "grouped_shap": {
                "Credit History": 0.25, "Loan Amount": -0.05, "Applicant Income": 0.08,
                "Co-applicant Income": 0.0, "Loan Term": 0.01, "Employment Status": 0.02
            },
            "positive_contributions": [
                {"feature": "Credit History", "contribution": 25.0, "explanation": "✓ Credit History: Clean repayment history supports application stability."}
            ],
            "negative_contributions": [
                {"feature": "Loan Amount", "contribution": -5.0, "explanation": "✗ Loan Amount: Higher requested loan size slightly increases default probability."}
            ],
            "summary_text": "Key Favorable Factors: Credit History, Applicant Income | Key Risk Factors: Loan Amount"
        }
    if key == "model_prediction":
        return "Loan Approved"
    if key == "prediction_confidence":
        return 0.85
    return default

try:
    from explainability import plot_shap_bar_chart, PLAIN_ENGLISH_EXPLANATIONS
except Exception as e:
    st.error("Failed to load explainability modules.")
    st.exception(e)
    st.stop()

def main():
    st.title("🔬 Deep Learning Model Explainability (SHAP)")
    st.markdown(
        "This view visualizes local **SHAP (SHapley Additive exPlanations)** attributions "
        "to illustrate how individual applicant features contributed to the deep learning model's approval probability."
    )
    
    st.divider()
    
    # Check if applicant is evaluated
    applicant_data = get_state("applicant_data")
    if applicant_data is None:
        st.warning("⚠️ No active applicant evaluation found. Please go back to the 🏛️ Enterprise Dashboard first, input applicant parameters, and run a diagnostic.")
        st.stop()
        
    # Load session state variables safely
    shap_data = get_state("shap_data")
    pred_label = get_state("model_prediction")
    confidence = get_state("prediction_confidence")
    
    # Renders the Plotly horizontal bar chart of grouped contributions
    grouped_shap = shap_data.get("grouped_shap", {})
    if not grouped_shap:
        st.error("SHAP computations failed or were not populated correctly.")
        st.stop()
        
    fig_shap = plot_shap_bar_chart(grouped_shap)
    st.plotly_chart(fig_shap, use_container_width=True)
    
    st.write(f"**Attribution Summary:** {shap_data.get('summary_text', '')}")
    
    st.divider()
    
    # 2-column breakdown of Positive/Negative features
    col_pos, col_neg = st.columns(2)
    
    with col_pos:
        st.markdown("##### 🟢 Favorable Contributions (Pushes towards Approval)")
        pos_contribs = shap_data.get("positive_contributions", [])
        if pos_contribs:
            for item in pos_contribs:
                st.markdown(
                    f"<div style='background-color:#e6f4ea; padding:10px; border-radius:6px; border-left:4px solid #137333; margin-bottom:10px;'>"
                    f"<b>{item['feature']}</b>: +{item['contribution']:.2f}%<br>"
                    f"<span style='font-size:12.5px; color:#5f6368;'>{PLAIN_ENGLISH_EXPLANATIONS.get(item['feature'], '')}</span>"
                    f"</div>",
                    unsafe_allow_html=True
                )
        else:
            st.write("*No significant favorable contributors identified.*")
            
    with col_neg:
        st.markdown("##### 🔴 Risk Contributions (Pushes towards Rejection)")
        neg_contribs = shap_data.get("negative_contributions", [])
        if neg_contribs:
            for item in neg_contribs:
                st.markdown(
                    f"<div style='background-color:#fce8e6; padding:10px; border-radius:6px; border-left:4px solid #c5221f; margin-bottom:10px;'>"
                    f"<b>{item['feature']}</b>: {item['contribution']:.2f}%<br>"
                    f"<span style='font-size:12.5px; color:#5f6368;'>{PLAIN_ENGLISH_EXPLANATIONS.get(item['feature'], '')}</span>"
                    f"</div>",
                    unsafe_allow_html=True
                )
        else:
            st.write("*No significant risk contributors identified.*")

if __name__ == "__main__":
    main()
