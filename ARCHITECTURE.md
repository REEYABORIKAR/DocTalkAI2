# DockTalk - Multi-Agent Enterprise Platform

## Folder Structure

```
docktalk/
├── backend/
│   ├── main.py                    # FastAPI entry point
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example               # Environment variables template
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── orchestrator.py        # Master Router Agent (LangGraph)
│   │   ├── domain_agent.py        # Generic Domain Sub-Agent
│   │   ├── verifier.py            # Verification/Accuracy Agent
│   │   └── graph.py               # LangGraph State Machine definition
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes_chat.py         # /ask endpoint (streaming)
│   │   ├── routes_docs.py         # /upload, /documents endpoints
│   │   └── routes_auth.py         # /login, /register endpoints
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py              # Settings & environment config
│   │   ├── vector_store.py        # ChromaDB multi-collection manager
│   │   ├── embeddings.py          # Embedding model setup
│   │   └── llm.py                 # LLM client setup
│   └── utils/
│       ├── __init__.py
│       ├── pdf_processor.py       # PDF ingestion + metadata extraction
│       └── auth.py                # JWT / RBAC utilities
│
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── styles/
        │   └── globals.css
        ├── store/
        │   ├── chatStore.ts        # Zustand chat state
        │   ├── docStore.ts         # Zustand document state
        │   └── authStore.ts        # Zustand auth state
        ├── hooks/
        │   ├── useChat.ts          # Streaming chat hook
        │   └── useDocuments.ts     # Document management hook
        ├── components/
        │   ├── layout/
        │   │   ├── Sidebar.tsx     # Left navigation sidebar
        │   │   └── Header.tsx      # Top header with mode switcher
        │   ├── chat/
        │   │   ├── ChatPanel.tsx   # Main chat area
        │   │   ├── MessageBubble.tsx
        │   │   ├── ThinkingTrace.tsx  # Agent steps display
        │   │   ├── CitationChip.tsx
        │   │   └── ChatInput.tsx
        │   ├── pdf/
        │   │   ├── PDFViewer.tsx   # Right-side PDF viewer
        │   │   └── PDFHighlight.tsx
        │   ├── auth/
        │   │   ├── LoginPage.tsx
        │   │   └── RegisterPage.tsx
        │   └── sidebar/
        │       ├── ChatList.tsx
        │       └── DocumentList.tsx
        ├── pages/
        │   ├── ChatPage.tsx        # Main split-screen workspace
        │   ├── DocumentsPage.tsx
        │   ├── SourcesPage.tsx
        │   └── SettingsPage.tsx
        └── utils/
            ├── api.ts              # Axios client
            └── streaming.ts        # SSE streaming parser
```

## Data Flow

```
User Query
    │
    ▼
FastAPI /ask
    │
    ▼
LangGraph State Machine
    │
    ├─► Orchestrator Agent
    │       └─► Classifies domain (HR/IT/Finance/Legal/General)
    │
    ├─► Domain Sub-Agent
    │       └─► Queries domain-specific ChromaDB collection
    │           Returns: chunks + page numbers + filenames
    │
    ├─► Verifier Agent
    │       └─► Cross-references answer with context
    │           Ensures factual accuracy
    │
    └─► Streaming Response to Frontend
            {
              "answer": "...",
              "steps": ["Orchestrator → IT Agent", "Verifier ✓"],
              "sources": [{"file": "Remote Work.pdf", "page": 3, "text": "..."}]
            }
```
