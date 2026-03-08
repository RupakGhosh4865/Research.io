from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import secrets
from app.database import get_db
from app.middleware.auth import get_current_user, get_optional_user
from app.models.user import User
from app.models.research import Report
from app.services.pdf_service import generate_report_pdf

router = APIRouter()

@router.get("/{report_id}")
async def get_report(report_id: str, user: User = Depends(get_optional_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Report).filter(Report.id == report_id))
    report = result.scalars().first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    # Check Auth vs Public access
    if report.session_id: # Needs proper auth checking for owned reports
        pass
        
    return {
        "id": report.id,
        "title": report.title,
        "content": report.content,
        "citations": report.citations,
        "quality_score": report.quality_score,
        "word_count": report.word_count
    }

@router.get("/{report_id}/export/pdf")
async def export_pdf(report_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Report).filter(Report.id == report_id))
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    pdf_bytes = generate_report_pdf(report)
    
    from fastapi.responses import Response
    return Response(
        content=pdf_bytes, 
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="research-report-{report.id}.pdf"'}
    )

@router.post("/{report_id}/share")
async def share_report(report_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Report).filter(Report.id == report_id))
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    token = secrets.token_urlsafe(16)
    report.share_token = token
    await db.commit()
    
    return {"share_url": f"https://deepresearch.ai/r/{token}"}

@router.get("/shared/{share_token}")
async def get_shared_report(share_token: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Report).filter(Report.share_token == share_token))
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    return {
        "id": report.id,
        "title": report.title,
        "content": report.content,
        "citations": report.citations,
        "quality_score": report.quality_score
    }
