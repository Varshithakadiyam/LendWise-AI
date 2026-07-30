"""
Streamlit subpage for What-If Scenario Analysis (Feature 3).
Loads the baseline applicant data from session state,
provides interactive form controls to adjust features,
and visualizes side-by-side delta comparisons for prediction, score, and decision shifts.
Generates plain-English scenario summaries.
"""

import sys
from pathlib import Path
import streamlit as st
import pandas as pd

# Setup python path to import modules from src/
project_root = Path(__file__).resolve().parent.parent.parent
src_dir = project_root / "src"
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

# Configure Page
st.set_page_config(
    page_title="What-If Analysis",
    page_icon="🔮",
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
    if key == "report_data":
        return {
            "risk_score": 15, "risk_level": "LOW RISK", "prediction": "Loan Approved",
            "confidence": 0.85, "suggested_underwriter_decision": "Approve",
            "explanation": "Applicant has favorable credit history and stable employment.",
            "key_risk_indicators": ["Loan Amount is moderate"],
            "positive_indicators": ["Active credit history", "Salaried employment"],
            "verification_steps": ["Verify payroll deposits", "Check credit record"]
        }
    if key == "model_prediction":
        return "Loan Approved"
    return default

try:
    from predict import predict_loan_approval
    from genai_advisor import generate_risk_report
except Exception as e:
    st.error("Failed to load prediction modules.")
    st.exception(e)
    st.stop()

def get_whatif_explanation(old_data: dict, new_data: dict, old_pred: str, new_pred: str, old_prob: float, new_prob: float, old_score: int, new_score: int) -> str:
    """
    Generates a localized, detailed underwriting narrative explaining why the decision/score shifted.
    """
    deltas = []
    
    # 1. Check Credit History
    if old_data.get("Credit_History") != new_data.get("Credit_History"):
        old_cred = "Favorable" if float(old_data.get("Credit_History", 0.0)) == 1.0 else "Delinquent/None"
        new_cred = "Favorable" if float(new_data.get("Credit_History", 0.0)) == 1.0 else "Delinquent/None"
        deltas.append(f"Credit History was adjusted from '{old_cred}' to '{new_cred}', which is a primary driver of default risk scores.")
        
    # 2. Check Income change
    old_total_inc = old_data.get("ApplicantIncome", 0) + old_data.get("CoapplicantIncome", 0)
    new_total_inc = new_data.get("ApplicantIncome", 0) + new_data.get("CoapplicantIncome", 0)
    if old_total_inc != new_total_inc:
        diff = new_total_inc - old_total_inc
        dir_word = "increased" if diff > 0 else "decreased"
        deltas.append(f"Combined monthly household income was {dir_word} by ${abs(diff):,.2f} (from ${old_total_inc:,.2f} to ${new_total_inc:,.2f}).")
        
    # 3. Check Loan Amount
    if old_data.get("LoanAmount") != new_data.get("LoanAmount"):
        diff = new_data.get("LoanAmount", 0) - old_data.get("LoanAmount", 0)
        dir_word = "increased" if diff > 0 else "decreased"
        deltas.append(f"Requested loan size was {dir_word} by ${abs(diff)*1000:,.2f} (from ${old_data.get('LoanAmount', 0)*1000:,.2f} to ${new_data.get('LoanAmount', 0)*1000:,.2f}).")
        
    # 4. Check Self Employed
    if old_data.get("Self_Employed") != new_data.get("Self_Employed"):
        deltas.append(f"Employment status was modified from Self-Employed='{old_data.get('Self_Employed')}' to '{new_data.get('Self_Employed')}', altering volatility indicators.")
        
    # Build narrative
    prob_diff = (new_prob - old_prob) * 100
    score_diff = new_score - old_score
    
    explanation_parts = []
    if deltas:
        explanation_parts.append("### Scenario Impact Analysis\n")
        explanation_parts.append("The following scenario adjustments were made:")
        for d in deltas:
            explanation_parts.append(f"- {d}")
            
        # Decision shifts
        explanation_parts.append("\n**Resulting Underwriting Attributions:**")
        if old_pred != new_pred:
            explanation_parts.append(f"- **Decision Shift:** The prediction changed from **{old_pred}** to **{new_pred}**.")
        else:
            explanation_parts.append(f"- **Decision Shift:** The prediction remained **{new_pred}**.")
            
        # Probability shift
        dir_prob = "increased" if prob_diff > 0 else "decreased"
        explanation_parts.append(f"- **Probability Change:** The model's approval probability {dir_prob} by **{abs(prob_diff):.2f}%** (from {old_prob*100:.1f}% to {new_prob*100:.1f}%).")
        
        # Risk Score shift
        if score_diff != 0:
            dir_score = "increased" if score_diff > 0 else "decreased"
            explanation_parts.append(f"- **Fraud/Default Risk Score:** The risk score {dir_score} by **{abs(score_diff)} points** (from {old_score} to {new_score}).")
            
        explanation_parts.append(
            "\n*Underwriter Guidance:* Adjusting applicant parameters changes repayment ability. "
            "Verification of altered variables (such as tax statements, payroll deposits, or business receipts) "
            "is strongly recommended before finalizing underwriting overrides."
        )
    else:
        explanation_parts.append("No parameters were changed. Use the form controls on the left to modify applicant parameters.")
        
    return "\n".join(explanation_parts)

def main():
    st.title("🔮 Interactive What-If Scenario Playground")
    st.markdown(
        "Modify applicant variables in real-time to simulate decision shifts, "
        "re-estimate approval probabilities, and view immediate Fraud Risk Score deltas."
    )
    
    st.divider()
    
    # Check baseline applicant safely
    baseline_data = get_state("applicant_data")
    if baseline_data is None:
        st.warning("⚠️ No active applicant evaluation found. Please evaluate an applicant on the 🏛️ Enterprise Dashboard first to establish a baseline.")
        st.stop()
        
    # Baseline data
    baseline_report = get_state("report_data")
    baseline_pred = get_state("model_prediction")
    baseline_prob = baseline_report.get("confidence", 0.0)
    old_approval_prob = baseline_prob if baseline_pred == "Loan Approved" else (1.0 - baseline_prob)
    old_risk_score = baseline_report["risk_score"]
    
    # 2 Column Split Layout: Left scenario controls, Right delta summaries
    col_ctrl, col_delta = st.columns([1, 1.2])
    
    with col_ctrl:
        st.subheader("🛠️ Adjust Scenario Parameters")
        st.write("Modify one or more variables to test what-if scenarios:")
        
        # Scenario form/controls
        col_g, col_m, col_d = st.columns(3)
        with col_g:
            gender = st.selectbox("Gender", ["Male", "Female"], index=["Male", "Female"].index(baseline_data.get("Gender", "Male")), key="wi_g")
        with col_m:
            married = st.selectbox("Married", ["Yes", "No"], index=["Yes", "No"].index(baseline_data.get("Married", "Yes")), key="wi_m")
        with col_d:
            dependents = st.selectbox("Dependents", ["0", "1", "2", "3+"], index=["0", "1", "2", "3+"].index(baseline_data.get("Dependents", "0")), key="wi_d")
            
        col_ed, col_se, col_pr = st.columns(3)
        with col_ed:
            education = st.selectbox("Education", ["Graduate", "Not Graduate"], index=["Graduate", "Not Graduate"].index(baseline_data.get("Education", "Graduate")), key="wi_ed")
        with col_se:
            self_employed = st.selectbox("Self Employed", ["No", "Yes"], index=["No", "Yes"].index(baseline_data.get("Self_Employed", "No")), key="wi_se")
        with col_pr:
            property_area = st.selectbox("Property Area", ["Semiurban", "Urban", "Rural"], index=["Semiurban", "Urban", "Rural"].index(baseline_data.get("Property_Area", "Semiurban")), key="wi_pr")
            
        col_i, col_ci = st.columns(2)
        with col_i:
            applicant_income = st.number_input("Monthly Applicant Income ($)", min_value=0.0, value=float(baseline_data.get("ApplicantIncome", 5000.0)), step=250.0, key="wi_i")
        with col_ci:
            coapplicant_income = st.number_input("Monthly Co-applicant Income ($)", min_value=0.0, value=float(baseline_data.get("CoapplicantIncome", 0.0)), step=250.0, key="wi_ci")
            
        col_a, col_t, col_cr = st.columns(3)
        with col_a:
            loan_amount = st.number_input("Loan Amount (Thousands $)", min_value=0.0, value=float(baseline_data.get("LoanAmount", 150.0)), step=10.0, key="wi_a")
        with col_t:
            loan_term = st.selectbox("Term (Months)", [360, 240, 180, 120, 84, 60, 36, 12], index=[360, 240, 180, 120, 84, 60, 36, 12].index(int(baseline_data.get("Loan_Amount_Term", 360))), key="wi_t")
        with col_cr:
            credit_history_label = st.selectbox("Credit History", ["Favorable", "Delinquent/None"], index=["Favorable", "Delinquent/None"].index("Favorable" if float(baseline_data.get("Credit_History", 1.0)) == 1.0 else "Delinquent/None"), key="wi_cr")
            
        credit_history = 1.0 if credit_history_label == "Favorable" else 0.0
        
        # Compile Scenario Dictionary
        scenario_data = {
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
        
    with col_delta:
        st.subheader("🔄 Real-Time Comparison Results")
        
        # Calculate Scenario
        try:
            # 1. Model inference
            new_pred_label, new_approval_prob = predict_loan_approval(scenario_data)
            new_confidence = new_approval_prob if new_pred_label == "Loan Approved" else (1.0 - new_approval_prob)
            
            # 2. Risk Advisor
            new_report = generate_risk_report(scenario_data, new_pred_label, new_approval_prob)
            new_risk_score = new_report["risk_score"]
            new_risk_level = new_report["risk_level"]
            new_decision = new_report["suggested_underwriter_decision"]
            
        except Exception as e:
            st.error("Error executing scenario simulation.")
            st.exception(e)
            st.stop()
            
        # Display side-by-side comparison tables
        comparison_df = pd.DataFrame({
            "Metric/Decision": [
                "DL Prediction",
                "Model Approval Probability",
                "Model Confidence",
                "Fraud Risk Score",
                "Risk Classification",
                "Underwriter Decision"
            ],
            "Baseline Value (Old)": [
                baseline_pred,
                f"{old_approval_prob * 100:.1f}%",
                f"{baseline_prob * 100:.1f}%",
                old_risk_score,
                baseline_report.get("risk_level"),
                baseline_report.get("suggested_underwriter_decision")
            ],
            "Scenario Value (New)": [
                new_pred_label,
                f"{new_approval_prob * 100:.1f}%",
                f"{new_confidence * 100:.1f}%",
                new_risk_score,
                new_risk_level,
                new_decision
            ]
        })
        
        st.table(comparison_df)
        
        # 3. AI Plain English Explanation of delta (Feature 3)
        st.write("**What-If Analysis Attributions:**")
        explanation = get_whatif_explanation(
            baseline_data, scenario_data,
            baseline_pred, new_pred_label,
            old_approval_prob, new_approval_prob,
            old_risk_score, new_risk_score
        )
        st.info(explanation)
        
        # Simple change badge
        if baseline_pred != new_pred_label:
            st.warning(f"⚠️ Warning: Parameter changes caused the DL model prediction to switch from '{baseline_pred}' to '{new_pred_label}'!")

if __name__ == "__main__":
    main()
