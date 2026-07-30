from fastapi import APIRouter, HTTPException
from backend.schemas import AdvisorRequest, AdvisorResponse
from backend.services import UnderwritingService

router = APIRouter(prefix="/advisor", tags=["AI Advisor"])

@router.post("", response_model=AdvisorResponse)
async def run_advisor_endpoint(payload: AdvisorRequest):
    """
    Evaluates risk score matrices (0-100), risk levels, recommended steps, 
    and executive underwriting summaries based on predictions and raw applicant records.
    """
    try:
        raw_data = payload.applicantData.model_dump()
        report_data = UnderwritingService.generate_report_data(
            raw_data, payload.prediction, payload.probability
        )
        return AdvisorResponse(**report_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk advisory report failure: {str(e)}")
