"""
Streamlit page for Generative AI Loan Risk Advisor.
Provides an interactive form to input applicant data, run Deep Learning prediction,
calculate the Fraud Risk Score, and display the Generative AI risk assessment report.
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

# Configure Streamlit page
st.set_page_config(
    page_title="AI Loan Risk Advisor",
    page_icon="🏛️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom premium styling
st.markdown("""
<style>
    .main {
        background-color: #f8f9fa;
    }
    .risk-card {
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 20px;
        border: 1px solid #e9ecef;
    }
    .low-risk-bg {
        background-color: #e6f4ea;
        border-left: 5px solid #137333;
    }
    .medium-risk-bg {
        background-color: #fef7e0;
        border-left: 5px solid #b06000;
    }
    .high-risk-bg {
        background-color: #fce8e6;
        border-left: 5px solid #c5221f;
    }
    .badge {
        display: inline-block;
        padding: 6px 12px;
        border-radius: 4px;
        font-weight: bold;
        font-size: 14px;
        text-align: center;
    }
    .badge-approved {
        background-color: #e6f4ea;
        color: #137333;
        border: 1px solid #137333;
    }
    .badge-rejected {
        background-color: #fce8e6;
        color: #c5221f;
        border: 1px solid #c5221f;
    }
    .badge-low {
        background-color: #137333;
        color: white;
    }
    .badge-medium {
        background-color: #b06000;
        color: white;
    }
    .badge-high {
        background-color: #c5221f;
        color: white;
    }
</style>
""", unsafe_allow_html=True)

try:
    from predict import predict_loan_approval
    from genai_advisor import generate_risk_report
except Exception as e:
    st.error("Failed to load backend prediction and genai advisor modules. Ensure src/ is in the correct directory.")
    st.exception(e)
    st.stop()

def main():
    st.title("🏛️ AI-Powered Loan Risk Advisor & Advisor Assessment")
    st.markdown(
        "This diagnostic tool combines **Deep Learning inference** with a **Generative AI Risk Engine** "
        "to assist underwriters by predicting loan approvals, evaluating structural fraud/default risks, "
        "and outlining critical verification workflows."
    )
    
    st.divider()
    
    # Grid Layout: Left form, Right results
    col_form, col_results = st.columns([1, 1.2])
    
    with col_form:
        st.subheader("📋 Applicant Profile Form")
        st.write("Complete the details below to evaluate the loan request:")
        
        with st.form("applicant_form"):
            # Inputs matching the 11 features
            col_gender, col_married, col_dependents = st.columns(3)
            with col_gender:
                gender = st.selectbox("Gender", ["Male", "Female"])
            with col_married:
                married = st.selectbox("Married", ["Yes", "No"])
            with col_dependents:
                dependents = st.selectbox("Dependents", ["0", "1", "2", "3+"])
                
            col_edu, col_self, col_prop = st.columns(3)
            with col_edu:
                education = st.selectbox("Education", ["Graduate", "Not Graduate"])
            with col_self:
                self_employed = st.selectbox("Self Employed", ["No", "Yes"])
            with col_prop:
                property_area = st.selectbox("Property Area", ["Semiurban", "Urban", "Rural"])
                
            col_inc, col_coinc = st.columns(2)
            with col_inc:
                applicant_income = st.number_input(
                    "Monthly Applicant Income ($)", 
                    min_value=0, 
                    value=5000, 
                    step=250,
                    help="Monthly gross income of the primary applicant."
                )
            with col_coinc:
                coapplicant_income = st.number_input(
                    "Monthly Co-applicant Income ($)", 
                    min_value=0, 
                    value=0, 
                    step=250,
                    help="Monthly income of the co-applicant (spouse/co-borrower)."
                )
                
            col_amt, col_term, col_credit = st.columns(3)
            with col_amt:
                loan_amount = st.number_input(
                    "Loan Amount (in Thousands $)", 
                    min_value=0, 
                    value=150, 
                    step=10,
                    help="Requested loan amount (e.g. 150 = $150,000)."
                )
            with col_term:
                loan_amount_term = st.selectbox(
                    "Loan Term (Months)", 
                    [360, 240, 180, 120, 84, 60, 36, 12],
                    index=0,
                    help="Repayment duration in months."
                )
            with col_credit:
                credit_history_label = st.selectbox(
                    "Credit History", 
                    ["Favorable (Active/Clean)", "Delinquent / Inactive"],
                    help="Repayment history status from credit bureau records."
                )
                
            credit_history = 1.0 if credit_history_label == "Favorable (Active/Clean)" else 0.0
            
            submit_btn = st.form_submit_button("🚀 Run Risk Analysis", use_container_width=True)
            
    with col_results:
        st.subheader("📊 Diagnostic Assessment")
        
        if submit_btn:
            # 1. Structure applicant dict
            applicant_data = {
                "Gender": gender,
                "Married": married,
                "Dependents": dependents,
                "Education": education,
                "Self_Employed": self_employed,
                "ApplicantIncome": float(applicant_income),
                "CoapplicantIncome": float(coapplicant_income),
                "LoanAmount": float(loan_amount),
                "Loan_Amount_Term": float(loan_amount_term),
                "Credit_History": credit_history,
                "Property_Area": property_area
            }
            
            with st.spinner("Executing Deep Learning inference and Generative Risk checks..."):
                try:
                    # 2. Run DL Prediction
                    model_decision, approval_prob = predict_loan_approval(applicant_data)
                    
                    # Calculate model confidence score
                    # For approved: confidence is approval_prob
                    # For rejected: confidence is (1.0 - approval_prob)
                    confidence = approval_prob if model_decision == "Loan Approved" else (1.0 - approval_prob)
                    
                    # 3. Run Generative AI risk advisor
                    report = generate_risk_report(applicant_data, model_decision, approval_prob)
                    
                except Exception as ex:
                    st.error("Error occurred while processing request:")
                    st.exception(ex)
                    st.stop()
            
            # 4. Display Results
            risk_score = report["risk_score"]
            risk_level = report["risk_level"]
            decision = report["suggested_underwriter_decision"]
            explanation = report["explanation"]
            
            # Risk Level background styling selector
            bg_class = "low-risk-bg"
            badge_class = "badge-low"
            if risk_level == "MEDIUM RISK":
                bg_class = "medium-risk-bg"
                badge_class = "badge-medium"
            elif risk_level == "HIGH RISK":
                bg_class = "high-risk-bg"
                badge_class = "badge-high"
                
            # Display overall summary card
            st.markdown(f"""
            <div class='risk-card {bg_class}'>
                <h3>Overall Risk Profile: <span class='badge {badge_class}'>{risk_level}</span></h3>
                <p style='font-size:15px; margin-bottom:5px;'><b>Fraud/Default Risk Score:</b> {risk_score} / 100</p>
                <p style='font-size:15px; margin-bottom:5px;'><b>DL Model Prediction:</b> 
                    <span class='badge {"badge-approved" if model_decision == "Loan Approved" else "badge-rejected"}'>{model_decision}</span>
                    (Confidence: {confidence * 100:.1f}%)
                </p>
                <p style='font-size:15px; margin-bottom:0;'><b>Suggested Underwriter Action:</b> <b>{decision}</b></p>
            </div>
            """, unsafe_allow_html=True)
            
            # Display progress bar for score
            st.write("**Fraud Risk Score Meter:**")
            st.progress(risk_score / 100.0)
            
            # Explainability
            st.write("**Plain-English Explainability Analysis:**")
            st.info(explanation)
            
            # Subplots / Columns for Indicators and Verification
            col_risk, col_pos = st.columns(2)
            
            with col_risk:
                st.markdown("##### ⚠️ Potential Risk Indicators")
                if report["key_risk_indicators"]:
                    for r in report["key_risk_indicators"]:
                        st.markdown(f"- {r}")
                else:
                    st.write("*None identified*")
                    
            with col_pos:
                st.markdown("##### ✅ Positive Indicators")
                if report["positive_indicators"]:
                    for p in report["positive_indicators"]:
                        st.markdown(f"- {p}")
                else:
                    st.write("*None identified*")
                    
            st.divider()
            
            # Verification checklist
            st.markdown("##### 📋 Recommended Verification Checklist")
            for step in report["verification_steps"]:
                st.checkbox(step, value=False, key=f"step_{step[:30]}_{risk_score}")
                
            # Expandable full report & download
            with st.expander("📄 View Full Raw AI Advisor Report"):
                st.text(report["report_text"])
                
            st.download_button(
                label="📥 Download AI Report as TXT File",
                data=report["report_text"],
                file_name=f"AI_Risk_Assessment_Report_Score_{risk_score}.txt",
                mime="text/plain",
                use_container_width=True
            )
            
        else:
            # Welcome message when form is not submitted
            st.info(
                "👈 Populate the Applicant Profile Form on the left and click "
                "**Run Risk Analysis** to generate the neural network assessment, risk score, "
                "and underwriter guidance report."
            )

if __name__ == "__main__":
    main()
