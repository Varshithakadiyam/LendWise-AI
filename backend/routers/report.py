from fastapi import APIRouter, HTTPException, Response
from backend.schemas import ReportRequest
from backend.services import UnderwritingService

router = APIRouter(prefix="/generate-report", tags=["Underwriting Reports"])

@router.post("")
async def run_report_endpoint(payload: ReportRequest):
    """
    Assembles underwriting assessment metrics and drafts print-ready PDF attachments,
    returning a raw application/pdf binary download stream.
    """
    try:
        raw_data = payload.applicantData.model_dump()
        report_data = payload.reportData.model_dump()
        pdf_bytes = UnderwritingService.generate_pdf(
            raw_data, report_data, payload.summary_text
        )
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=Underwriting_Report_Risk_Score_{payload.reportData.risk_score}.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF report generation failure: {str(e)}")
