from fastapi import APIRouter, HTTPException
from backend.schemas import ApplicantData
from backend.services import UnderwritingService
from typing import Dict, Any

router = APIRouter(prefix="/explain", tags=["SHAP Explainability"])

@router.post("", response_model=Dict[str, Any])
async def run_explain_endpoint(payload: ApplicantData):
    """
    Runs local SHAP KernelExplainer attributions to yield feature contributions
    and human-readable attributions explaining the model outputs.
    """
    try:
        raw_data = payload.model_dump()
        shap_explanations = UnderwritingService.explain(raw_data)
        return shap_explanations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SHAP explanation calculation failure: {str(e)}")
