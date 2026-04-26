import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from core.config import settings
from api.routes_auth import router as auth_router
from api.routes_docs import router as docs_router
from api.routes_chat import router as chat_router

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)

app = FastAPI(
    title="DockTalk - Multi-Agent Enterprise Platform",
    description="LangGraph-powered RAG system with domain routing",
    version="2.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded PDFs statically for the PDF viewer
app.mount("/files", StaticFiles(directory=settings.UPLOAD_DIR), name="files")

# Routers
app.include_router(auth_router)
app.include_router(docs_router)
app.include_router(chat_router)


@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}


@app.get("/")
def root():
    return {
        "message": "DockTalk Multi-Agent Platform",
        "docs": "/docs",
        "agents": ["Orchestrator", "DomainAgent", "Verifier"],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
