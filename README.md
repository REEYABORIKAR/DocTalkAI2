# DockTalk – Multi-Agent Enterprise RAG Platform

A production-grade, LangGraph-powered document AI platform with multi-domain routing, PDF viewing, streaming responses, and citation highlighting.

---

## Quick Start

```bash
# 1. Clone / extract the project
cd docktalk

# 2. Run setup (creates venvs, installs deps)
chmod +x setup.sh && ./setup.sh

# 3. Edit backend/.env — add your OpenAI key
nano backend/.env

# 4. Start backend (Terminal 1)
cd backend && source venv/bin/activate && python main.py

# 5. Start frontend (Terminal 2)
cd frontend && npm run dev

# 6. Open http://localhost:5173
```

---

## Architecture

```
User → FastAPI → LangGraph State Machine
                       │
              ┌────────┼────────┐
              ▼        ▼        ▼
        Orchestrator  Domain   Verifier
        (Router)      Agent    (Accuracy)
              │        │
              └──► ChromaDB (per-domain collections)
```

### Agent Pipeline

| Step | Agent | Role |
|------|-------|------|
| 1 | **Orchestrator** | Classifies query domain (HR/IT/Finance/Legal/General) using LLM |
| 2 | **Domain Agent** | Retrieves from domain-specific ChromaDB collection; generates answer |
| 3 | **Verifier** | Cross-references answer with context to ensure 100% accuracy |

---

## Features

- **Multi-Agent System** — LangGraph orchestration with Master Router → Domain Agent → Verifier
- **Dynamic Domain Onboarding** — Upload any PDF; LLM auto-extracts department/security metadata
- **Multi-Tenancy** — Separate ChromaDB collections per domain (IT never sees HR data)
- **RBAC** — Admin vs User roles; domain-level access control
- **Streaming UI** — SSE-based word-by-word streaming with agent trace indicators
- **PDF Viewer** — Click any citation to open the PDF at the exact page
- **Source Citations** — Every answer includes `[file, page, text snippet]` references
- **Split-Screen** — Chat on left, live PDF viewer on right
- **Dark Theme** — Professional enterprise UI matching the DockTalk design

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Get JWT token |
| GET  | `/auth/me` | Current user |
| POST | `/documents/upload` | Upload & auto-index PDF |
| GET  | `/documents/` | List documents |
| GET  | `/documents/domains` | List ChromaDB collections |
| POST | `/chat/ask` | Streaming SSE chat (requires Bearer token) |
| GET  | `/files/{filename}` | Serve PDF file for viewer |

### `/chat/ask` SSE Event Types

```json
{ "type": "step",         "data": "🧭 Orchestrator → Routing to IT domain" }
{ "type": "step",         "data": "🔍 IT Agent → Found 5 relevant chunks" }
{ "type": "step",         "data": "✅ Verifier → Answer verified (96% confidence)" }
{ "type": "answer_chunk", "data": "According to the" }
{ "type": "sources",      "data": [{"file": "Remote Work.pdf", "page": 3, "text": "..."}] }
{ "type": "meta",         "data": {"domain": "it", "verified": true} }
{ "type": "done",         "data": true }
```

---

## Environment Variables

```env
# backend/.env
OPENAI_API_KEY=sk-...           # Required
SECRET_KEY=change-me            # JWT signing key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CHROMA_PERSIST_DIR=./chroma_db  # Vector DB storage
UPLOAD_DIR=./uploads            # PDF storage
CORS_ORIGINS=http://localhost:5173
```

---

## Adding a New Domain

No code changes needed. Simply upload a PDF:

```bash
curl -X POST http://localhost:8000/documents/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@legal_handbook.pdf"
```

The LLM will automatically:
1. Extract `department`, `policy_type`, `security_level`, `domain`
2. Create a new ChromaDB collection (e.g., `legal`)
3. Route future queries about legal topics to that collection

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI + LangGraph + LangChain |
| LLM | GPT-4o-mini (OpenAI) |
| Embeddings | text-embedding-3-small |
| Vector DB | ChromaDB (persistent, multi-collection) |
| PDF Processing | PyMuPDF (fitz) |
| Auth | JWT (python-jose) + bcrypt |
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Streaming | Fetch API + SSE |

---

## Project Structure

```
docktalk/
├── backend/
│   ├── main.py                  # FastAPI app
│   ├── requirements.txt
│   ├── agents/
│   │   ├── __init__.py          # run_agent() entry point + LangGraph compile
│   │   ├── graph.py             # AgentState TypedDict
│   │   ├── orchestrator.py      # Master Router Agent
│   │   ├── domain_agent.py      # Domain Sub-Agent
│   │   └── verifier.py          # Verification Agent
│   ├── api/
│   │   ├── routes_auth.py       # /auth endpoints
│   │   ├── routes_docs.py       # /documents endpoints
│   │   └── routes_chat.py       # /chat/ask SSE endpoint
│   ├── core/
│   │   ├── config.py            # Pydantic settings
│   │   ├── vector_store.py      # ChromaDB multi-collection manager
│   │   ├── embeddings.py        # OpenAI embeddings
│   │   └── llm.py               # LLM clients
│   └── utils/
│       ├── pdf_processor.py     # PDF ingestion + LLM metadata extraction
│       └── auth.py              # JWT + RBAC utilities
└── frontend/
    └── src/
        ├── App.tsx              # Router + protected routes
        ├── store/               # Zustand state (auth, chat, docs)
        ├── utils/               # API client + SSE streaming parser
        ├── components/
        │   ├── layout/          # Sidebar + Header
        │   ├── chat/            # ChatPanel, MessageBubble, ThinkingTrace, CitationChip, ChatInput
        │   ├── pdf/             # PDFViewer
        │   └── auth/            # LoginPage, RegisterPage
        └── pages/               # ChatPage, DocumentsPage, SourcesPage, SettingsPage
```
"# DocTalkAI2" 
