from fastapi import APIRouter, HTTPException, Depends
from backend.schemas import ApplicantData, PredictionResponse
from backend.services import UnderwritingService

router = APIRouter(prefix="/predict", tags=["Underwriting Prediction"])

@router.post("", response_model=PredictionResponse)
async def run_predict_endpoint(payload: ApplicantData):
    """
    Submits applicant variables to the cached TensorFlow/Keras neural network
    to predict loan approval decision and probability.
    """
    try:
        raw_data = payload.model_dump()
        prediction, probability = UnderwritingService.predict(raw_data)
        return PredictionResponse(prediction=prediction, probability=probability)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction pipeline failure: {str(e)}")
