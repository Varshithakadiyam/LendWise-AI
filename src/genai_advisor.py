"""
Generative AI Advisor module for loan risk assessment.
Computes a decision-support Fraud Risk Score, extracts risk and positive indicators,
recommends verification steps, and generates a structured advisory report.
Includes a rule-based engine as a robust fallback in the absence of LLM API keys.
"""

import os
import json
import logging
from pathlib import Path
import pandas as pd
import numpy as np

logger = logging.getLogger("fraud_detection")

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

def calculate_fraud_risk_score(raw_data: dict) -> tuple[int, str]:
    """
    Computes a rule-based decision-support Fraud Risk Score (0-100) and risk level.

    Scoring Criteria:
    - Credit History (Max 45): Poor = 45, Missing = 20, Good = 0.
    - Loan-to-Income Ratio (Max 25): LTI > 4.0 = 25, LTI 2.5-4.0 = 12, else 0.
    - Applicant Income (Max 15): < 2500 = 15, 2500-5000 = 5, else 0.
    - Co-applicant Dependency (Max 5): Dependency > 50% = 5, else 0.
    - Self-Employed Status (Max 8): Self-Employed = 8, else 0.
    - Missing Fields (Max 15): +5 per missing REQUIRED_FEATURES field.

    Args:
        raw_data (dict): Dictionary of raw applicant features.

    Returns:
        tuple[int, str]: (Risk Score [0-100], Risk Level ["LOW RISK", "MEDIUM RISK", "HIGH RISK"])
    """
    try:
        score_components = {}
        
        # 1. Credit History
        cred = raw_data.get("Credit_History")
        if cred is None or (isinstance(cred, float) and np.isnan(cred)) or str(cred).strip() == "":
            score_components["credit"] = 20
        elif float(cred) == 0.0:
            score_components["credit"] = 45
        else:
            score_components["credit"] = 0
            
        # 2. Loan-to-Income (LTI) Ratio
        app_inc = float(raw_data.get("ApplicantIncome") or 0.0)
        co_inc = float(raw_data.get("CoapplicantIncome") or 0.0)
        total_monthly = app_inc + co_inc
        total_annual = total_monthly * 12
        loan_amt_thousands = float(raw_data.get("LoanAmount") or 0.0)
        loan_amt_dollars = loan_amt_thousands * 1000
        
        if total_annual > 0:
            lti = loan_amt_dollars / total_annual
        else:
            lti = 999.0
            
        if lti > 4.0:
            score_components["lti"] = 25
        elif lti > 2.5:
            score_components["lti"] = 12
        else:
            score_components["lti"] = 0
            
        # 3. Applicant Income
        if app_inc < 2500:
            score_components["income"] = 15
        elif app_inc < 5000:
            score_components["income"] = 5
        else:
            score_components["income"] = 0
            
        # 4. Co-applicant Dependency
        if co_inc > 0 and total_monthly > 0 and (co_inc / total_monthly) > 0.5:
            score_components["coapplicant"] = 5
        else:
            score_components["coapplicant"] = 0
            
        # 5. Employment Volatility
        is_self_employed = raw_data.get("Self_Employed") == "Yes"
        score_components["employment"] = 8 if is_self_employed else 0
        
        # 6. Missing Fields
        missing_count = 0
        for feature in REQUIRED_FEATURES:
            val = raw_data.get(feature)
            if val is None or (isinstance(val, float) and np.isnan(val)) or str(val).strip() == "":
                missing_count += 1
        score_components["missing"] = min(missing_count * 5, 15)
        
        # Aggregate
        total_score = sum(score_components.values())
        total_score = min(total_score, 100)
        
        # Risk Categorization
        if total_score <= 30:
            risk_level = "LOW RISK"
        elif total_score <= 60:
            risk_level = "MEDIUM RISK"
        else:
            risk_level = "HIGH RISK"
            
        logger.info(f"Risk score computed: {total_score} ({risk_level}). Breakdown: {score_components}")
        return total_score, risk_level
        
    except Exception as e:
        logger.error(f"Error computing risk score: {e}", exc_info=True)
        return 50, "MEDIUM RISK" # safe fallback

def extract_indicators_and_steps(raw_data: dict, risk_level: str, model_pred: str) -> tuple[list[str], list[str], list[str], str]:
    """
    Identifies risk indicators, positive indicators, verification recommendations, 
    and underwriter recommendations based on input parameters.
    """
    risks = []
    positives = []
    steps = []
    
    app_inc = float(raw_data.get("ApplicantIncome") or 0.0)
    co_inc = float(raw_data.get("CoapplicantIncome") or 0.0)
    total_inc = app_inc + co_inc
    loan_amt = float(raw_data.get("LoanAmount") or 0.0)
    cred = raw_data.get("Credit_History")
    self_emp = raw_data.get("Self_Employed")
    term = float(raw_data.get("Loan_Amount_Term") or 0.0)
    
    # 1. Evaluate Credit History
    if cred is None or (isinstance(cred, float) and np.isnan(cred)):
        risks.append("Missing credit history data")
        steps.append("Request credit bureau report manually")
    elif float(cred) == 0.0:
        risks.append("Poor historical credit record / historical delinquencies")
        steps.append("Perform credit report audit for past defaults")
    else:
        positives.append("Excellent repayment history (Credit History is active and favorable)")
        
    # 2. Evaluate Income & Debt Ratios
    lti = (loan_amt * 1000) / (total_inc * 12) if total_inc > 0 else 999.0
    if lti > 4.0:
        risks.append(f"High loan-to-income ratio (LTI: {lti:.2f}) indicates potential repayment stress")
    elif lti <= 2.5 and lti > 0:
        positives.append(f"Reasonable loan-to-income ratio (LTI: {lti:.2f}) within conservative guidelines")
        
    if app_inc < 2500:
        risks.append(f"Low primary applicant income (${app_inc:,.2f}/mo)")
    elif app_inc >= 6000:
        positives.append(f"Strong primary applicant income (${app_inc:,.2f}/mo)")
        
    if co_inc > 0 and total_inc > 0 and (co_inc / total_inc) > 0.5:
        risks.append(f"Large co-applicant dependency (Co-applicant contributes {co_inc/total_inc*100:.1f}% of household income)")
        
    # 3. Evaluate Employment & Term
    if self_emp == "Yes":
        risks.append("Potential income volatility from self-employment status")
        steps.append("Verify income tax returns (ITR) for the last 3 fiscal years")
        steps.append("Request business registration and operating licenses")
    else:
        positives.append("Stable salaried employment status")
        steps.append("Verify employer certificate and check payroll history")
        
    if term < 180 and term > 0:
        risks.append(f"Short loan term ({term:.0f} months) significantly raises monthly installment payments")
        
    if loan_amt <= 150 and loan_amt > 0:
        positives.append(f"Conservative loan size request (${loan_amt * 1000:,.2f})")
        
    # Check for missing values
    missing_fields = [f for f in REQUIRED_FEATURES if raw_data.get(f) is None or (isinstance(raw_data.get(f), float) and np.isnan(raw_data.get(f))) or str(raw_data.get(f)).strip() == ""]
    if missing_fields:
        risks.append(f"Missing documentation for: {', '.join(missing_fields)}")
        steps.append("Request immediate submission of missing documentation")
    else:
        positives.append("Complete loan application documentation")
        
    # Standard steps
    steps.append("Perform bank statement audit (last 6 months)")
    steps.append("Perform identity verification (KYC/AML checklist)")
    steps.append("Verify current debt obligations and debt-service coverage ratio (DSCR)")
    
    # Suggested Underwriter Decision
    if model_pred == "Loan Approved":
        if risk_level == "LOW RISK":
            decision = "Approve"
        elif risk_level == "MEDIUM RISK":
            decision = "Approve with additional verification"
        else:
            decision = "Escalate for manual review"
    else:
        if risk_level == "LOW RISK" or risk_level == "MEDIUM RISK":
            decision = "Escalate for manual review"
        else:
            decision = "Reject"
            
    return risks, positives, steps, decision

def generate_risk_report(raw_data: dict, model_prediction: str, prediction_probability: float) -> dict:
    """
    Assembles a comprehensive, structured advisory report using local rule logic.
    Ensures language is professional and non-accusatory.
    
    Args:
        raw_data (dict): Raw feature details of the applicant.
        model_prediction (str): Model prediction ("Loan Approved" or "Loan Rejected").
        prediction_probability (float): Model confidence score/probability.
        
    Returns:
        dict: The structured analysis report data.
    """
    try:
        # Calculate scores
        score, risk_level = calculate_fraud_risk_score(raw_data)
        
        # Extract features and steps
        risks, positives, steps, decision = extract_indicators_and_steps(
            raw_data, risk_level, model_prediction
        )
        
        # Build plain-English explanation
        lti = 0.0
        app_inc = float(raw_data.get("ApplicantIncome") or 0.0)
        co_inc = float(raw_data.get("CoapplicantIncome") or 0.0)
        loan_amt = float(raw_data.get("LoanAmount") or 0.0)
        total_inc = app_inc + co_inc
        if total_inc > 0:
            lti = (loan_amt * 1000) / (total_inc * 12)
            
        explanation_parts = []
        explanation_parts.append(
            f"The applicant has requested a loan of ${loan_amt * 1000:,.2f} over a term of {raw_data.get('Loan_Amount_Term', 360)} months. "
            f"Based on a monthly household income of ${total_inc:,.2f}, the calculated Loan-to-Income (LTI) ratio is {lti:.2f}."
        )
        
        if float(raw_data.get("Credit_History") or 0.0) == 0.0:
            explanation_parts.append(
                "A significant risk consideration is the applicant's poor or inactive credit history, "
                "which indicates potential historical repayment issues."
            )
        elif float(raw_data.get("Credit_History") or 0.0) == 1.0:
            explanation_parts.append(
                "The applicant maintains an active and positive credit repayment history, which serves "
                "as a strong indicator of historical reliability."
            )
            
        if lti > 4.0:
            explanation_parts.append(
                "The requested debt size is elevated relative to the applicant's current verified income stream, "
                "potentially increasing structural default risk under adverse economic conditions."
            )
            
        if raw_data.get("Self_Employed") == "Yes":
            explanation_parts.append(
                "Self-employed employment status has been identified, which introduces potential income volatility "
                "that should be verified against historical tax filings."
            )
            
        explanation_parts.append(
            f"The Deep Learning model predicts a status of '{model_prediction}' with an estimated confidence "
            f"score of {prediction_probability * 100:.1f}%. To mitigate risk, we recommend the suggested "
            f"underwriter action of '{decision}' coupled with the outlined verification steps."
        )
        
        explanation = " ".join(explanation_parts)
        
        # Build formatted report text (Markdown)
        report_text = (
            f"==================================================\n"
            f"             AI LOAN RISK ASSESSMENT              \n"
            f"==================================================\n\n"
            f"Overall Risk Level: {risk_level} (Score: {score}/100)\n"
            f"Model Prediction:   {model_prediction}\n"
            f"Confidence Score:   {prediction_probability * 100:.1f}%\n"
            f"Underwriter Action:  {decision}\n\n"
            f"--------------------------------------------------\n"
            f"NARRATIVE EXPLANATION\n"
            f"--------------------------------------------------\n"
            f"{explanation}\n\n"
            f"--------------------------------------------------\n"
            f"POTENTIAL RISK INDICATORS\n"
            f"--------------------------------------------------\n"
        )
        for r in risks:
            report_text += f"- {r}\n"
        if not risks:
            report_text += "- None identified\n"
            
        report_text += (
            f"\n--------------------------------------------------\n"
            f"POSITIVE INDICATORS\n"
            f"--------------------------------------------------\n"
        )
        for p in positives:
            report_text += f"- {p}\n"
        if not positives:
            report_text += "- None identified\n"
            
        report_text += (
            f"\n--------------------------------------------------\n"
            f"RECOMMENDED VERIFICATION STEPS\n"
            f"--------------------------------------------------\n"
        )
        for s in steps:
            report_text += f"- {s}\n"
            
        report_text += "\n=================================================="
        
        report_data = {
            "risk_score": score,
            "risk_level": risk_level,
            "prediction": model_prediction,
            "confidence": prediction_probability,
            "key_risk_indicators": risks,
            "positive_indicators": positives,
            "verification_steps": steps,
            "suggested_underwriter_decision": decision,
            "explanation": explanation,
            "report_text": report_text
        }
        
        logger.info("Structured risk report generated successfully.")
        return report_data
        
    except Exception as e:
        logger.error(f"Failed to generate risk report: {e}", exc_info=True)
        raise e

if __name__ == "__main__":
    # Test script run
    print("Testing genai_advisor...")
    test_app = {
        "Gender": "Male",
        "Married": "Yes",
        "Dependents": "1",
        "Education": "Graduate",
        "Self_Employed": "Yes",
        "ApplicantIncome": 3000,
        "CoapplicantIncome": 0,
        "LoanAmount": 250,
        "Loan_Amount_Term": 360,
        "Credit_History": 0.0,
        "Property_Area": "Rural"
    }
    rep = generate_risk_report(test_app, "Loan Rejected", 0.85)
    print(rep["report_text"])
