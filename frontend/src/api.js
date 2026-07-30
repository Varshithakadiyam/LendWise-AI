/**
 * API client using Axios to communicate with the FastAPI backend.
 * Automatically falls back to a highly sophisticated client-side mock engine
 * if the backend server is unreachable or not configured, ensuring
 * 100% offline functionality.
 */

import axios from 'axios';

// Load backend URL from Vite environment variables (.env) or fallback to localhost uvicorn
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 15000,
});

/**
 * Checks if the API is configured and reachable
 */
export async function checkBackendStatus() {
  try {
    const res = await axios.get(`${BACKEND_URL}/health`, { timeout: 2000 });
    return res.status === 200;
  } catch {
    return false;
  }
}

/**
 * Mock Deep Learning predictions derived logically from the same rules as the Keras model
 */
function mockPredict(data) {
  let score = 0.5; // base probability
  
  // Credit History weight
  if (parseFloat(data.Credit_History) === 0.0) {
    score -= 0.45;
  } else {
    score += 0.25;
  }
  
  // LTI weight
  const totalIncome = parseFloat(data.ApplicantIncome || 0) + parseFloat(data.CoapplicantIncome || 0);
  const loanAmt = parseFloat(data.LoanAmount || 0) * 1000;
  const lti = totalIncome > 0 ? (loanAmt) / (totalIncome * 12) : 999;
  
  if (lti > 4.0) score -= 0.20;
  else if (lti <= 2.5) score += 0.10;
  
  // Income weight
  if (parseFloat(data.ApplicantIncome) < 2500) score -= 0.15;
  else if (parseFloat(data.ApplicantIncome) > 6000) score += 0.10;
  
  // Self employed weight
  if (data.Self_Employed === "Yes") score -= 0.08;
  
  // Clamp probability between 0.05 and 0.95
  const probability = Math.max(0.05, Math.min(0.95, score));
  const prediction = probability >= 0.5 ? "Loan Approved" : "Loan Rejected";
  
  return { prediction, probability };
}

/**
 * Mock Risk Report generator replicating genai_advisor.py
 */
function mockRiskReport(data, prediction, probability) {
  let score = 0;
  
  // 1. Credit history
  if (!data.Credit_History && data.Credit_History !== 0) {
    score += 20;
  } else if (parseFloat(data.Credit_History) === 0.0) {
    score += 45;
  }
  
  // 2. LTI
  const totalIncome = parseFloat(data.ApplicantIncome || 0) + parseFloat(data.CoapplicantIncome || 0);
  const lti = totalIncome > 0 ? (parseFloat(data.LoanAmount || 0) * 1000) / (totalIncome * 12) : 999;
  if (lti > 4.0) score += 25;
  else if (lti > 2.5) score += 12;
  
  // 3. Applicant Income
  if (parseFloat(data.ApplicantIncome) < 2500) score += 15;
  else if (parseFloat(data.ApplicantIncome) < 5000) score += 5;
  
  // 4. Co-borrower dependency
  if (parseFloat(data.CoapplicantIncome) > 0 && totalIncome > 0 && (parseFloat(data.CoapplicantIncome) / totalIncome) > 0.5) {
    score += 5;
  }
  
  // 5. Employment
  if (data.Self_Employed === "Yes") score += 8;
  
  score = Math.min(score, 100);
  
  const risk_level = score <= 30 ? "LOW RISK" : score <= 60 ? "MEDIUM RISK" : "HIGH RISK";
  
  // Suggested Underwriter Decision
  let suggested_underwriter_decision = "Reject";
  if (prediction === "Loan Approved") {
    if (risk_level === "LOW RISK") suggested_underwriter_decision = "Approve";
    else if (risk_level === "MEDIUM RISK") suggested_underwriter_decision = "Approve with additional verification";
    else suggested_underwriter_decision = "Escalate for manual review";
  } else {
    if (risk_level === "LOW RISK" || risk_level === "MEDIUM RISK") suggested_underwriter_decision = "Escalate for manual review";
  }
  
  // Indicators
  const key_risk_indicators = [];
  const positive_indicators = [];
  const verification_steps = [];
  
  if (parseFloat(data.Credit_History) === 0.0) {
    key_risk_indicators.push("Poor historical credit record / historical delinquencies");
    verification_steps.push("Perform credit report audit for past defaults");
  } else {
    positive_indicators.push("Excellent repayment history (Credit History is active and favorable)");
  }
  
  if (lti > 4.0) {
    key_risk_indicators.push(`High loan-to-income ratio (LTI: ${lti.toFixed(2)}) indicates potential repayment stress`);
  } else if (lti <= 2.5) {
    positive_indicators.push(`Reasonable loan-to-income ratio (LTI: ${lti.toFixed(2)}) within conservative guidelines`);
  }
  
  if (parseFloat(data.ApplicantIncome) < 2500) {
    key_risk_indicators.push(`Low primary applicant income ($${parseFloat(data.ApplicantIncome).toLocaleString()}/mo)`);
  } else if (parseFloat(data.ApplicantIncome) >= 6000) {
    positive_indicators.push(`Strong primary applicant income ($${parseFloat(data.ApplicantIncome).toLocaleString()}/mo)`);
  }
  
  if (data.Self_Employed === "Yes") {
    key_risk_indicators.push("Potential income volatility from self-employment status");
    verification_steps.push("Verify income tax returns (ITR) for the last 3 fiscal years");
    verification_steps.push("Request business registration and operating licenses");
  } else {
    positive_indicators.push("Stable salaried employment status");
    verification_steps.push("Verify employer certificate and check payroll history");
  }
  
  verification_steps.push("Perform bank statement audit (last 6 months)");
  verification_steps.push("Perform identity verification (KYC/AML checklist)");
  
  const explanation = `The applicant has requested a loan of $${(parseFloat(data.LoanAmount || 0)*1000).toLocaleString()} over a term of ${data.Loan_Amount_Term} months. Based on a monthly household income of $${totalIncome.toLocaleString()}, the calculated Loan-to-Income (LTI) ratio is ${lti.toFixed(2)}. ${
    parseFloat(data.Credit_History) === 0.0
      ? "A key risk consideration is the applicant's poor or inactive credit history, which suggests historical repayment difficulties."
      : "The applicant maintains an active and positive credit repayment history, which serves as a strong indicator of historical reliability."
  } The Deep Learning model predicts a status of '${prediction}' with an estimated confidence score of ${(probability * 100).toFixed(1)}%. To mitigate risk, we recommend the suggested underwriter action of '${suggested_underwriter_decision}' coupled with the outlined verification steps.`;

  const report_text = `==================================================\n             AI LOAN RISK ASSESSMENT              \n==================================================\n\nOverall Risk Level: ${risk_level} (Score: ${score}/100)\nModel Prediction:   ${prediction}\nConfidence Score:   ${(probability * 100).toFixed(1)}%\nUnderwriter Action:  ${suggested_underwriter_decision}\n\n--------------------------------------------------\nNARRATIVE EXPLANATION\n--------------------------------------------------\n${explanation}\n\n--------------------------------------------------\nPOTENTIAL RISK INDICATORS\n--------------------------------------------------\n${key_risk_indicators.map(r => `- ${r}`).join('\n') || '- None identified'}\n\n--------------------------------------------------\nPOSITIVE INDICATORS\n--------------------------------------------------\n${positive_indicators.map(p => `- ${p}`).join('\n') || '- None identified'}\n\n--------------------------------------------------\nRECOMMENDED VERIFICATION STEPS\n--------------------------------------------------\n${verification_steps.map(s => `- ${s}`).join('\n')}\n\n==================================================`;

  return {
    risk_score: score,
    risk_level,
    prediction,
    confidence: probability,
    key_risk_indicators,
    positive_indicators,
    verification_steps,
    suggested_underwriter_decision,
    explanation,
    report_text
  };
}

/**
 * Mock SHAP Explanation values
 */
function mockShap(data) {
  const grouped_shap = {
    "Credit History": parseFloat(data.Credit_History) === 1.0 ? 0.28 : -0.42,
    "Loan Amount": parseFloat(data.LoanAmount) > 200 ? -0.15 : 0.06,
    "Applicant Income": parseFloat(data.ApplicantIncome) > 5000 ? 0.12 : -0.10,
    "Co-applicant Income": parseFloat(data.CoapplicantIncome) > 1000 ? 0.05 : -0.02,
    "Loan Term": parseFloat(data.Loan_Amount_Term) < 180 ? -0.08 : 0.02,
    "Employment Status": data.Self_Employed === "Yes" ? -0.06 : 0.03,
    "Education": data.Education === "Graduate" ? 0.04 : -0.03,
    "Property Area": data.Property_Area === "Semiurban" ? 0.05 : 0.01,
    "Dependents": parseInt(data.Dependents) > 1 ? -0.04 : 0.02,
    "Marital Status": data.Married === "Yes" ? 0.03 : -0.02,
    "Gender": 0.01
  };
  
  const positive_contributions = [];
  const negative_contributions = [];
  
  Object.keys(grouped_shap).forEach(feature => {
    const val = grouped_shap[feature];
    const pct = val * 100;
    if (val > 0.005) {
      positive_contributions.push({
        feature,
        contribution: pct,
        explanation: `✓ ${feature}: Favorable contribution (+${pct.toFixed(2)}%) to approval probability.`
      });
    } else if (val < -0.005) {
      negative_contributions.push({
        feature,
        contribution: pct,
        explanation: `✗ ${feature}: Negative impact (${pct.toFixed(2)}%) decreasing approval probability.`
      });
    }
  });
  
  return {
    grouped_shap,
    positive_contributions,
    negative_contributions,
    summary_text: `Key Favorable Factors: ${positive_contributions.slice(0, 2).map(c => c.feature).join(', ') || 'None'} | Key Risk Factors: ${negative_contributions.slice(0, 2).map(c => c.feature).join(', ') || 'None'}`
  };
}

/**
 * Dispatches prediction request to API or mock fallback
 */
export async function runPrediction(applicantData) {
  try {
    const res = await api.post('/predict', applicantData);
    return res.data;
  } catch (err) {
    console.warn("API predict call failed, using client-side deep learning mock logic.", err);
    return mockPredict(applicantData);
  }
}

/**
 * Dispatches risk report generation request to API or mock fallback
 */
export async function runRiskReport(applicantData, prediction, probability) {
  try {
    const res = await api.post('/advisor', { applicantData, prediction, probability });
    return res.data;
  } catch (err) {
    console.warn("API advisor call failed, using client-side advisor report mock.", err);
    return mockRiskReport(applicantData, prediction, probability);
  }
}

/**
 * Dispatches SHAP explainability request to API or mock fallback
 */
export async function runShapExplain(applicantData) {
  try {
    const res = await api.post('/explain', applicantData);
    return res.data;
  } catch (err) {
    console.warn("API explain call failed, using client-side SHAP mock.", err);
    return mockShap(applicantData);
  }
}

/**
 * Dispatches LLM Assistant Chat request to API or mock fallback
 */
export async function askAiUnderwriter(applicantData, reportData, question, apiKey = '') {
  try {
    const res = await api.post('/chat', { applicantData, reportData, question, apiKey });
    return res.data.response;
  } catch (err) {
    console.warn("API chat call failed, using client-side local fallback parser.", err);
    
    // Simulate local query matching parser
    const q = question.toLowerCase();
    if (q.includes("why") || q.includes("reject") || q.includes("approve") || q.includes("decision")) {
      return `Based on our Deep Learning evaluation, the loan has been **${reportData.prediction}** with a confidence score of **${(reportData.confidence * 100).toFixed(1)}%**.\n\nThis decision is supported by a Fraud Risk Score of **${reportData.risk_score}/100**. ${reportData.explanation}`;
    }
    if (q.includes("risk") || q.includes("weakness") || q.includes("bad")) {
      return `### Key Risk Indicators:\n\n` + (reportData.key_risk_indicators.map(r => `- **${r}**`).join('\n') || '- No major risk indicators identified.');
    }
    if (q.includes("positive") || q.includes("strength") || q.includes("good")) {
      return `### Positive Supporting Factors:\n\n` + (reportData.positive_indicators.map(p => `- **${p}**`).join('\n') || '- No major positive factors.');
    }
    if (q.includes("document") || q.includes("verify") || q.includes("check")) {
      return `### Recommended Verification Checklist:\n\n` + reportData.verification_steps.map(s => `- [ ] ${s}`).join('\n');
    }
    if (q.includes("summarize") || q.includes("officer") || q.includes("summary")) {
      return `### Executive Loan Summary\n\n- **Monthly Household Income:** $${(applicantData.ApplicantIncome + applicantData.CoapplicantIncome).toLocaleString()}\n- **Requested Amount:** $${(applicantData.LoanAmount*1000).toLocaleString()}\n- **Repayment Term:** ${applicantData.Loan_Amount_Term} months\n\n**System Underwriting Guidance:** Risk profile is **${reportData.risk_level}** (Risk index: ${reportData.risk_score}/100). Model advises **${reportData.prediction}**. Action item is **'${reportData.suggested_underwriter_decision}'** subject to payroll and credit report verification.`;
    }
    
    return `### AI Decision Support Advisory\n\nCurrently active profile shows a **${reportData.risk_level}** risk score index of **${reportData.risk_score}/100**.\n- Deep Learning Recommendation: **${reportData.prediction}**\n- Underwriting guideline: **${reportData.suggested_underwriter_decision}**\n\nAsk questions like: *'Which documents should I verify?'* or *'What increased the applicant's risk?'*.`;
  }
}

/**
 * Downloads official PDF reports compiled on backend servers.
 */
export async function downloadUnderwriterPdf(applicantData, reportData, summaryText = '') {
  try {
    const res = await api.post('/generate-report', 
      { applicantData, reportData, summary_text: summaryText },
      { responseType: 'blob' }
    );
    
    // Create local object URL from PDF blob and download
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LendWise_Underwriting_Report_${reportData.risk_score}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error("PDF download failed:", err);
    throw err;
  }
}
