"""
PDF Generation module for loan risk assessments.
Uses fpdf2 to build a clean, structured, and print-ready PDF underwriting report.
Exportable directly as a bytes buffer in Streamlit download actions.
"""

import logging
from pathlib import Path
from fpdf import FPDF
import numpy as np

logger = logging.getLogger("fraud_detection")

class LoanRiskPDF(FPDF):
    """
    Custom FPDF class to structure headers, footers, and table grids.
    """
    def header(self):
        # Title banner
        self.set_font('helvetica', 'B', 15)
        self.set_text_color(32, 33, 36) # dark charcoal
        self.cell(0, 10, 'APEX COMMERCIAL BANK - LOAN RISK REPORT', border=0, align='C', ln=1)
        self.set_font('helvetica', 'I', 9)
        self.set_text_color(128, 128, 128)
        self.cell(0, 5, 'AI-Powered Decision Support Systems (Advisory)', border=0, align='C', ln=1)
        # Line separating header
        self.set_draw_color(192, 192, 192)
        self.line(10, 27, 200, 27)
        self.ln(8)
        
    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.set_text_color(128, 128, 128)
        # Left-aligned disclaimer, right-aligned page count
        self.cell(120, 10, 'CONFIDENTIAL - DECISION SUPPORT ONLY - NOT FOR DIRECT PUBLIC EXPOSURE', border=0, align='L')
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}}', border=0, align='R')

def generate_underwriting_pdf(applicant_data: dict, report_data: dict, shap_summary: str = None) -> bytes:
    """
    Compiles applicant profile, model prediction, risk score, explanations,
    indicators, and verification checklist into a PDF binary object.
    
    Args:
        applicant_data (dict): Raw applicant features.
        report_data (dict): Structured AI report details.
        shap_summary (str, optional): Key SHAP factors description.
        
    Returns:
        bytes: PDF binary content.
    """
    try:
        logger.info("Starting PDF generation...")
        
        pdf = LoanRiskPDF(orientation='P', unit='mm', format='A4')
        pdf.alias_nb_pages()
        pdf.add_page()
        pdf.set_margins(15, 15, 15)
        
        # 1. Summary Section Card
        pdf.set_font('helvetica', 'B', 11)
        pdf.set_text_color(32, 33, 36)
        pdf.cell(0, 7, '1. RISK PROFILE SUMMARY', border=0, ln=1)
        
        # Risk Table Grid
        pdf.set_font('helvetica', '', 9)
        # Set background fill colors
        level = report_data.get("risk_level", "UNKNOWN")
        if "LOW" in level:
            bg_color = (230, 244, 234) # light green
            text_color = (19, 115, 51)  # dark green
        elif "MEDIUM" in level:
            bg_color = (254, 247, 224) # light orange
            text_color = (176, 96, 0)   # dark orange
        else:
            bg_color = (252, 232, 230) # light red
            text_color = (197, 34, 31)  # dark red
            
        # Draw table header
        pdf.set_fill_color(241, 243, 244) # grey
        pdf.set_font('helvetica', 'B', 9)
        pdf.cell(60, 8, 'Metric / Target', border=1, align='C', fill=True)
        pdf.cell(115, 8, 'Value Assessment', border=1, align='C', fill=True, ln=1)
        
        # Table rows
        pdf.set_font('helvetica', '', 9)
        # Risk Score
        pdf.cell(60, 8, 'Fraud/Default Risk Score', border=1)
        pdf.set_fill_color(*bg_color)
        pdf.set_text_color(*text_color)
        pdf.set_font('helvetica', 'B', 9)
        pdf.cell(115, 8, f'{report_data.get("risk_score", 0)} / 100 ({level})', border=1, fill=True, ln=1)
        
        # Model prediction
        pdf.set_text_color(32, 33, 36)
        pdf.set_font('helvetica', '', 9)
        pdf.cell(60, 8, 'DL Model Prediction', border=1)
        pred = report_data.get("prediction", "N/A")
        pdf.set_font('helvetica', 'B', 9)
        pdf.cell(115, 8, f'{pred} (Confidence: {report_data.get("confidence", 0.0)*100:.1f}%)', border=1, ln=1)
        
        # Underwriter Recommendation
        pdf.set_font('helvetica', '', 9)
        pdf.cell(60, 8, 'Suggested Underwriter Decision', border=1)
        pdf.set_font('helvetica', 'B', 9)
        pdf.cell(115, 8, str(report_data.get("suggested_underwriter_decision", "N/A")), border=1, ln=1)
        
        pdf.ln(5)
        
        # 2. Applicant Data Table
        pdf.set_text_color(32, 33, 36)
        pdf.set_font('helvetica', 'B', 11)
        pdf.cell(0, 7, '2. APPLICANT REGISTRATION DATA', border=0, ln=1)
        
        pdf.set_font('helvetica', '', 9)
        # 2-column key value printing
        cols_data = [
            ("Applicant Income", f"${applicant_data.get('ApplicantIncome', 0):,.2f}/mo", "Co-applicant Income", f"${applicant_data.get('CoapplicantIncome', 0):,.2f}/mo"),
            ("Requested Loan", f"${applicant_data.get('LoanAmount', 0)*1000:,.2f}", "Loan Term", f"{applicant_data.get('Loan_Amount_Term', 360):.0f} months"),
            ("Gender", str(applicant_data.get('Gender', 'N/A')), "Marital Status", f"Married: {applicant_data.get('Married', 'N/A')}"),
            ("Dependents", str(applicant_data.get('Dependents', '0')), "Education Level", str(applicant_data.get('Education', 'N/A'))),
            ("Self Employed", str(applicant_data.get('Self_Employed', 'N/A')), "Credit History", "Favorable" if float(applicant_data.get('Credit_History', 0.0)) == 1.0 else "Delinquent/None"),
            ("Property Area", str(applicant_data.get('Property_Area', 'N/A')), "", "")
        ]
        
        # Draw header
        pdf.set_fill_color(241, 243, 244)
        pdf.set_font('helvetica', 'B', 9)
        pdf.cell(45, 7, 'Feature Field', border=1, fill=True)
        pdf.cell(42, 7, 'Value', border=1, fill=True)
        pdf.cell(45, 7, 'Feature Field', border=1, fill=True)
        pdf.cell(43, 7, 'Value', border=1, fill=True, ln=1)
        
        pdf.set_font('helvetica', '', 9)
        for row in cols_data:
            if not row[0]:
                continue
            pdf.cell(45, 6, row[0], border=1)
            pdf.cell(42, 6, row[1], border=1)
            pdf.cell(45, 6, row[2], border=1)
            pdf.cell(43, 6, row[3], border=1, ln=1)
            
        pdf.ln(5)
        
        # 3. AI Underwriter Narrative Explanation
        pdf.set_font('helvetica', 'B', 11)
        pdf.cell(0, 7, '3. AI ADVISORY EXPLANATION', border=0, ln=1)
        pdf.set_font('helvetica', '', 9)
        # Multi-line writing
        pdf.multi_cell(0, 5, report_data.get("explanation", ""))
        
        # SHAP Explainability Sub-summary
        if shap_summary and shap_summary != "Explainability computation is temporarily unavailable.":
            pdf.ln(2)
            pdf.set_font('helvetica', 'B', 9)
            pdf.cell(0, 5, 'SHAP Contributions Summary:', border=0, ln=1)
            pdf.set_font('helvetica', 'I', 9)
            pdf.multi_cell(0, 4, shap_summary)
            
        pdf.ln(4)
        
        # 4. Risk / Positive Indicators
        pdf.set_font('helvetica', 'B', 11)
        pdf.cell(0, 7, '4. ASSESSED INDICATORS BREAKDOWN', border=0, ln=1)
        
        pdf.set_font('helvetica', 'B', 9)
        pdf.cell(0, 5, 'Potential Risk Indicators:', border=0, ln=1)
        pdf.set_font('helvetica', '', 9)
        risks = report_data.get("key_risk_indicators", [])
        if risks:
            for r in risks:
                pdf.cell(5, 5, '-', border=0)
                pdf.cell(0, 5, r, border=0, ln=1)
        else:
            pdf.cell(0, 5, 'None identified', border=0, ln=1)
            
        pdf.ln(2)
        
        pdf.set_font('helvetica', 'B', 9)
        pdf.cell(0, 5, 'Positive Supporting Factors:', border=0, ln=1)
        pdf.set_font('helvetica', '', 9)
        positives = report_data.get("positive_indicators", [])
        if positives:
            for p in positives:
                pdf.cell(5, 5, '-', border=0)
                pdf.cell(0, 5, p, border=0, ln=1)
        else:
            pdf.cell(0, 5, 'None identified', border=0, ln=1)
            
        pdf.ln(4)
        
        # 5. Smart Verification Checklist
        pdf.set_font('helvetica', 'B', 11)
        pdf.cell(0, 7, '5. RECOMMENDED UNDERWRITING CHECKLIST', border=0, ln=1)
        pdf.set_font('helvetica', '', 9)
        steps = report_data.get("verification_steps", [])
        for s in steps:
            # draw box representation like [ ]
            pdf.cell(8, 5, '[   ]', border=0)
            pdf.cell(0, 5, s, border=0, ln=1)
            
        logger.info("PDF generation successful.")
        
        # Output PDF as raw bytes
        pdf_bytes = pdf.output()
        return bytes(pdf_bytes)
        
    except Exception as e:
        logger.error(f"Failed to generate underwriting PDF: {e}", exc_info=True)
        raise e
