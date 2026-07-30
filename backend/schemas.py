from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ApplicantData(BaseModel):
    Gender: str = Field(..., description="Applicant gender: 'Male' or 'Female'")
    Married: str = Field(..., description="Marital status: 'Yes' or 'No'")
    Dependents: str = Field(..., description="Number of dependents: '0', '1', '2', or '3+'")
    Education: str = Field(..., description="Education level: 'Graduate' or 'Not Graduate'")
    Self_Employed: str = Field(..., description="Self employment status: 'Yes' or 'No'")
    ApplicantIncome: float = Field(..., ge=0, description="Monthly applicant income in USD")
    CoapplicantIncome: float = Field(..., ge=0, description="Monthly co-applicant income in USD")
    LoanAmount: float = Field(..., ge=0, description="Requested loan amount in thousands of USD")
    Loan_Amount_Term: float = Field(..., ge=0, description="Loan term in months")
    Credit_History: float = Field(..., description="Credit history flag: 1.0 (favorable) or 0.0 (delinquent)")
    Property_Area: str = Field(..., description="Property location area: 'Urban', 'Semiurban', or 'Rural'")

    model_config = {
        "json_schema_extra": {
            "example": {
                "Gender": "Male",
                "Married": "Yes",
                "Dependents": "0",
                "Education": "Graduate",
                "Self_Employed": "No",
                "ApplicantIncome": 5000.0,
                "CoapplicantIncome": 1500.0,
                "LoanAmount": 150.0,
                "Loan_Amount_Term": 360.0,
                "Credit_History": 1.0,
                "Property_Area": "Semiurban"
            }
        }
    }

class PredictionResponse(BaseModel):
    prediction: str = Field(..., description="'Loan Approved' or 'Loan Rejected'")
    probability: float = Field(..., description="The calculated approval probability score (0.0 to 1.0)")

class AdvisorRequest(BaseModel):
    applicantData: ApplicantData
    prediction: str
    probability: float

class AdvisorResponse(BaseModel):
    risk_score: int
    risk_level: str
    prediction: str
    confidence: float
    key_risk_indicators: List[str]
    positive_indicators: List[str]
    verification_steps: List[str]
    suggested_underwriter_decision: str
    explanation: str
    report_text: str

class ChatRequest(BaseModel):
    applicantData: ApplicantData
    reportData: AdvisorResponse
    question: str
    apiKey: Optional[str] = Field(None, description="Optional custom client-provided API key")

class ChatResponse(BaseModel):
    response: str

class ReportRequest(BaseModel):
    applicantData: ApplicantData
    reportData: AdvisorResponse
    summary_text: Optional[str] = Field("", description="Optional custom SHAP text summary")

class ReportResponse(BaseModel):
    pdf_base64: str = Field(..., description="Base64 encoded bytes representing the generated PDF document")

class ModelInfoResponse(BaseModel):
    tensorflow_version: str
    model_path: str
    preprocessor_path: str
    required_features: List[str]

class HealthResponse(BaseModel):
    status: str = Field("OK")
    service: str = Field("LendWise AI Gateway")

class ServiceStatusItem(BaseModel):
    status: str = Field(..., description="'online' | 'offline'")
    details: Optional[str] = None

class StatusResponse(BaseModel):
    FastAPI: ServiceStatusItem
    TensorFlow: ServiceStatusItem
    SHAP: ServiceStatusItem
    Gemini: ServiceStatusItem
    OpenAI: ServiceStatusItem
    PDF_Compiler: ServiceStatusItem
