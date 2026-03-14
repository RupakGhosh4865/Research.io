import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User, PlanType
from app.models.research import Document
from app.config import get_settings

router = APIRouter()
settings = get_settings()

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check plan limits
    res = await db.execute(select(func.count(Document.id)).filter(Document.user_id == user.id))
    doc_count = res.scalar() or 0
    
    if user.plan == PlanType.free and doc_count >= 1:
         raise HTTPException(status_code=403, detail="Free plan limited to 1 document. Please upgrade.")
    if user.plan == PlanType.test and doc_count >= 3:
         raise HTTPException(status_code=403, detail="Test plan limited to 3 documents. Please upgrade.")
    if user.plan == PlanType.starter and doc_count >= 10:
         raise HTTPException(status_code=403, detail="Pro plan limited to 10 documents. Please upgrade to Special Pro.")
    if user.plan == PlanType.pro and doc_count >= 30:
         raise HTTPException(status_code=403, detail="Special Pro plan limited to 30 documents.")

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    saved_filename = f"{file_id}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, saved_filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    new_doc = Document(
        id=uuid.UUID(file_id),
        user_id=user.id,
        filename=file.filename,
        file_path=file_path,
        file_type="pdf"
    )
    db.add(new_doc)
    await db.commit()
    await db.refresh(new_doc)

    return {
        "document_id": str(new_doc.id),
        "filename": new_doc.filename,
        "status": "uploaded"
    }

@router.get("/")
async def list_documents(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy.future import select
    result = await db.execute(select(Document).filter(Document.user_id == user.id))
    docs = result.scalars().all()
    return [{
        "id": str(doc.id),
        "filename": doc.filename,
        "created_at": doc.created_at
    } for doc in docs]
