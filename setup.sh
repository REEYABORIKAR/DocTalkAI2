#!/bin/bash
# DockTalk Multi-Agent Platform - Setup Script
set -e

echo "╔══════════════════════════════════════════════╗"
echo "║  DockTalk - Multi-Agent Enterprise Platform  ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# ── Backend Setup ────────────────────────────────────
echo "▶ Setting up Python backend..."
cd backend

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "  ✔ Created .env from template"
  echo "  ⚠  IMPORTANT: Edit backend/.env and add your OPENAI_API_KEY"
fi

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt --quiet
echo "  ✔ Python dependencies installed"

cd ..

# ── Frontend Setup ───────────────────────────────────
echo ""
echo "▶ Setting up React frontend..."
cd frontend

if [ ! -f ".env" ]; then
  echo "VITE_API_URL=/api" > .env
  echo "  ✔ Created frontend .env"
fi

npm install --silent
echo "  ✔ Node dependencies installed"

cd ..

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  Setup complete! To start the platform:      ║"
echo "║                                              ║"
echo "║  Terminal 1 (Backend):                       ║"
echo "║    cd backend                                ║"
echo "║    source venv/bin/activate                  ║"
echo "║    python main.py                            ║"
echo "║                                              ║"
echo "║  Terminal 2 (Frontend):                      ║"
echo "║    cd frontend                               ║"
echo "║    npm run dev                               ║"
echo "║                                              ║"
echo "║  Open: http://localhost:5173                 ║"
echo "╚══════════════════════════════════════════════╝"
