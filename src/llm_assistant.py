"""
LLM Assistant module for underwriter questions.
Checks for Gemini or OpenAI API keys, and routes questions to the LLM.
Provides a comprehensive rule-based local fallback parser if offline or keys are absent.
"""

import json
import logging
import requests
from pathlib import Path

logger = logging.getLogger("fraud_detection")

def call_gemini_api(api_key: str, prompt: str) -> str:
    """
    Calls the Gemini 1.5 Flash API directly via HTTP post request to avoid sdk dependency issues.
    """
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 800
            }
        }
        
        logger.info("Sending request to Gemini API...")
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        
        if response.status_code == 200:
            res_json = response.json()
            text = res_json["candidates"][0]["content"]["parts"][0]["text"]
            return text.strip()
        else:
            logger.error(f"Gemini API returned status code {response.status_code}: {response.text}")
            raise RuntimeError(f"API Error {response.status_code}")
            
    except Exception as e:
        logger.error(f"Gemini API request failed: {e}")
        raise e

def call_openai_api(api_key: str, prompt: str) -> str:
    """
    Calls OpenAI GPT-4o-mini API directly via HTTP post.
    """
    try:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "You are a professional bank loan underwriting assistant. Provide objective risk advisory analysis. Never make legal accusations of fraud."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 800
        }
        
        logger.info("Sending request to OpenAI API...")
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        
        if response.status_code == 200:
            res_json = response.json()
            text = res_json["choices"][0]["message"]["content"]
            return text.strip()
        else:
            logger.error(f"OpenAI API returned status code {response.status_code}: {response.text}")
            raise RuntimeError(f"API Error {response.status_code}")
            
    except Exception as e:
        logger.error(f"OpenAI API request failed: {e}")
        raise e

def local_rule_fallback_answer(applicant_data: dict, report_data: dict, question: str) -> str:
    """
    Local rule-based response engine that parses underwriter queries offline.
    """
    q_lower = question.lower()
    
    pred = report_data.get("prediction", "N/A")
    conf = report_data.get("confidence", 0.0) * 100
    score = report_data.get("risk_score", 0)
    level = report_data.get("risk_level", "N/A")
    decision = report_data.get("suggested_underwriter_decision", "N/A")
    explanation = report_data.get("explanation", "")
    risks = report_data.get("key_risk_indicators", [])
    positives = report_data.get("positive_indicators", [])
    steps = report_data.get("verification_steps", [])
    
    # 1. Why was it approved/rejected?
    if any(k in q_lower for k in ["why", "rejected", "approved", "reason", "decision", "result"]):
        header = f"### Decision Analysis ({pred})\n\n"
        body = f"The Deep Learning model predicts **{pred}** with a confidence score of **{conf:.1f}%**. "
        if pred == "Loan Rejected":
            body += (
                f"The rejection recommendation is primarily driven by an elevated Fraud/Default Risk Score of **{score}/100** ({level}). "
                f"Specifically, {explanation.split('The deep learning')[0].strip() if 'The deep learning' in explanation else explanation}\n\n"
            )
        else:
            body += (
                f"The approval recommendation is supported by an acceptable risk score of **{score}/100** ({level}). "
                f"Specifically, {explanation}\n\n"
            )
        body += f"**Suggested Underwriter Decision:** {decision}."
        return header + body
        
    # 2. What increased risk? / Weaknesses
    elif any(k in q_lower for k in ["risk", "weakness", "bad", "delinquent", "volatility", "threat", "danger"]):
        header = "### Potential Risk Indicators\n\n"
        if risks:
            body = "The following potential risk markers were extracted from the loan application data:\n\n"
            for r in risks:
                body += f"- **{r}**\n"
            body += f"\nThese parameters collectively elevate the Fraud/Default Risk Score to **{score}/100** ({level})."
        else:
            body = "No significant potential risk indicators were identified in the primary applicant parameters."
        return header + body
        
    # 3. Positive indicators / Strengths
    elif any(k in q_lower for k in ["positive", "strength", "good", "favorable", "benefit", "asset"]):
        header = "### Positive Indicators\n\n"
        if positives:
            body = "The following positive factors support the credit assessment:\n\n"
            for p in positives:
                body += f"- **{p}**\n"
        else:
            body = "No significant positive indicators were extracted from the documentation."
        return header + body
        
    # 4. Verification / Documents
    elif any(k in q_lower for k in ["document", "verify", "check", "audit", "slip", "tax"]):
        header = "### Recommended Verification steps\n\n"
        body = "To confirm data validity and safeguard the transaction, the underwriting check should verify the following:\n\n"
        for s in steps:
            body += f"- [ ] {s}\n"
        return header + body
        
    # 5. Summarize / Loan officer
    elif any(k in q_lower for k in ["summarize", "summary", "officer", "brief", "overview"]):
        header = "### Executive Loan Summary\n\n"
        body = (
            f"**Applicant Overview:**\n"
            f"- Monthly Income: ${applicant_data.get('ApplicantIncome', 0):,.2f} (Co-applicant: ${applicant_data.get('CoapplicantIncome', 0):,.2f})\n"
            f"- Requested Loan: ${applicant_data.get('LoanAmount', 0)*1000:,.2f} over {applicant_data.get('Loan_Amount_Term', 360):.0f} months.\n"
            f"- Credit Status: {'Favorable' if float(applicant_data.get('Credit_History', 0.0)) == 1.0 else 'Delinquent/None'}\n\n"
            f"**Underwriting Assessment:**\n"
            f"The system has registered a **{level}** profile (Score: **{score}/100**). "
            f"The Deep Learning model indicates **{pred}** ({conf:.1f}% confidence). "
            f"Underwriter guidance points to **'{decision}'** subject to checking: "
            f"{', '.join([s.split('verify ')[-1].split('check ')[-1] for s in steps[:3]])}.\n"
        )
        return header + body
        
    # 6. Default fallback response
    else:
        return (
            f"### AI Decision Support Advisory\n\n"
            f"**Current Context Summary:**\n"
            f"- ML Status: **{pred}** (Confidence: {conf:.1f}%)\n"
            f"- Risk Classification: **{level}** (Score: {score}/100)\n"
            f"- Recommended Action: **{decision}**\n\n"
            f"**Details:**\n"
            f"{explanation}\n\n"
            f"If you require specific documentation instructions, ask 'What documents should I verify?'. "
            f"For risk breakdowns, ask 'What increased the risk?'."
        )

def ask_ai_assistant(applicant_data: dict, report_data: dict, question: str, api_key: str = None) -> str:
    """
    Main API router for Ask AI underwriter chat assistant.
    Dispatches to Gemini/OpenAI if key is present, otherwise executes local rule fallback.
    """
    if not question.strip():
        return "Please input a valid question."
        
    # Build a comprehensive LLM context prompt
    prompt = (
        f"You are a professional bank loan underwriting assistant. "
        f"You are assisting a loan officer with a specific loan application. "
        f"Analyze the following context and answer the underwriter's question.\n\n"
        f"CONTEXT:\n"
        f"- Applicant Details: {json.dumps(applicant_data)}\n"
        f"- Deep Learning Prediction: {report_data.get('prediction')}\n"
        f"- Prediction Confidence: {report_data.get('confidence', 0.0)*100:.1f}%\n"
        f"- Fraud/Default Risk Score: {report_data.get('risk_score')}/100\n"
        f"- Risk Classification: {report_data.get('risk_level')}\n"
        f"- Risk Indicators: {report_data.get('key_risk_indicators')}\n"
        f"- Positive Indicators: {report_data.get('positive_indicators')}\n"
        f"- Recommended Verification Steps: {report_data.get('verification_steps')}\n"
        f"- Suggested Underwriter Decision: {report_data.get('suggested_underwriter_decision')}\n"
        f"- Plain-English Explanation: {report_data.get('explanation')}\n\n"
        f"RULES:\n"
        f"1. Use professional, objective, non-accusatory language.\n"
        f"2. NEVER state or claim that fraud exists. Use wording like 'potential risk indicators', 'manual review recommended'.\n"
        f"3. Focus on decision support.\n\n"
        f"UNDERWRITER QUESTION: {question}\n\n"
        f"ANSWER:"
    )
    
    # Try LLM APIs if keys are available
    if api_key:
        api_key_clean = api_key.strip()
        # Detect key type
        if api_key_clean.startswith("sk-"):
            # OpenAI Key
            try:
                return call_openai_api(api_key_clean, prompt)
            except Exception:
                logger.warning("OpenAI API call failed, falling back to local advisor.")
        else:
            # Assume Gemini key
            try:
                return call_gemini_api(api_key_clean, prompt)
            except Exception:
                logger.warning("Gemini API call failed, falling back to local advisor.")
                
    # Local rule-based fallback
    return local_rule_fallback_answer(applicant_data, report_data, question)
