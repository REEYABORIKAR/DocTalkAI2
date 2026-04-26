import json
import asyncio
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from api.routes_auth import get_current_user
from agents import run_agent

router = APIRouter(prefix="/chat", tags=["chat"])


class AskRequest(BaseModel):
    query: str
    mode: str = "company"  # personal | company | hybrid


@router.post("/ask")
async def ask(
    req: AskRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Run the multi-agent pipeline and stream back the response as SSE.
    Each SSE event is a JSON chunk of type: 'step' | 'answer' | 'sources' | 'done' | 'error'
    """

    async def event_stream():
        try:
            # Stream step: starting
            yield _sse({"type": "step", "data": "🚀 Initializing agent pipeline..."})
            await asyncio.sleep(0)

            # Run the full LangGraph pipeline
            result = await run_agent(
                query=req.query,
                mode=req.mode,
                user=current_user,
            )

            # Stream each agent step
            for step in result.get("steps", []):
                yield _sse({"type": "step", "data": step})
                await asyncio.sleep(0.05)

            # Stream the answer word by word for typewriter effect
            answer = result.get("answer", "")
            words = answer.split(" ")
            chunk_size = 3
            for i in range(0, len(words), chunk_size):
                chunk = " ".join(words[i:i + chunk_size])
                if i + chunk_size < len(words):
                    chunk += " "
                yield _sse({"type": "answer_chunk", "data": chunk})
                await asyncio.sleep(0.03)

            # Stream sources
            yield _sse({
                "type": "sources",
                "data": result.get("sources", []),
            })

            # Stream metadata
            yield _sse({
                "type": "meta",
                "data": {
                    "domain": result.get("domain", "global"),
                    "verified": result.get("verified", False),
                },
            })

            # Done
            yield _sse({"type": "done", "data": True})

        except Exception as e:
            yield _sse({"type": "error", "data": str(e)})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


def _sse(payload: dict) -> str:
    return f"data: {json.dumps(payload)}\n\n"
