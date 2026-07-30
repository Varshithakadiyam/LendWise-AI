from fastapi import APIRouter, HTTPException
from backend.schemas import ChatRequest, ChatResponse
from backend.services import UnderwritingService

router = APIRouter(prefix="/chat", tags=["Ask AI Q&A Assistant"])

@router.post("", response_model=ChatResponse)
async def run_chat_endpoint(payload: ChatRequest):
    """
    Submits underwriter questions to live LLMs (Gemini/OpenAI) or parses
    keywords for local rule responses if API keys are not active.
    """
    try:
        raw_data = payload.applicantData.model_dump()
        report_data = payload.reportData.model_dump()
        answer = UnderwritingService.chat(
            raw_data, report_data, payload.question, payload.apiKey
        )
        return ChatResponse(response=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ask AI underwriter chatbot failure: {str(e)}")
