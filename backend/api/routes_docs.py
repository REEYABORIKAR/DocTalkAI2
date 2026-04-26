import os
import aiofiles
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from api.routes_auth import get_current_user
from utils.pdf_processor import process_pdf
from core.config import settings
from core.vector_store import list_collections

router = APIRouter(prefix="/documents", tags=["documents"])

# In-memory document registry (use a DB in production)
DOCUMENTS_REGISTRY: list = []


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Upload and auto-index a PDF document."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)

    # Save file
    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)

    # Process and index
    try:
        meta = process_pdf(file_path, file.filename)
        meta["uploaded_by"] = current_user.get("email", "unknown")
        meta["file_path"] = file_path

        # Register document
        DOCUMENTS_REGISTRY.append(meta)

        return {
            "success": True,
            "message": f"Document indexed successfully in '{meta['domain']}' domain",
            **meta,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")


@router.get("/")
def list_documents(current_user: dict = Depends(get_current_user)):
    """List all uploaded documents."""
    return {"documents": DOCUMENTS_REGISTRY}


@router.get("/domains")
def list_domains(current_user: dict = Depends(get_current_user)):
    """List all available knowledge domains."""
    return {"domains": list_collections()}


@router.get("/{filename}/path")
def get_document_path(filename: str, current_user: dict = Depends(get_current_user)):
    """Get the file path for PDF viewer."""
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Document not found")
    return {"filename": filename, "path": file_path}
