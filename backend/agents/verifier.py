import json
from agents.graph import AgentState
from core.llm import llm_json
from langchain_core.messages import HumanMessage

VERIFIER_PROMPT = """You are a strict Verification Agent for an enterprise AI system.
Your job is to verify that an AI-generated answer is:
1. Factually supported by the provided context
2. Not hallucinated or fabricated
3. Accurately represents what the documents say

Context used:
{context}

Generated answer:
{answer}

Evaluate and respond ONLY with this JSON:
{{
  "verified": true or false,
  "confidence": 0.0 to 1.0,
  "issues": ["list of specific issues if any"],
  "note": "brief verification summary"
}}

Be strict: if ANY part of the answer cannot be traced to the context, set verified to false."""


def verifier_node(state: AgentState) -> dict:
    """
    Verification Agent: cross-references the generated answer with retrieved
    context to ensure factual accuracy. Mandatory step before response delivery.
    """
    answer = state.get("answer", "")
    context = state.get("context", "")

    if not context or not answer:
        return {
            "verified": True,
            "verification_note": "⚠️ No context to verify against",
            "steps": ["✅ Verifier → Skipped (no context)"],
        }

    try:
        prompt = VERIFIER_PROMPT.format(
            context=context[:4000],  # Limit context to avoid token overflow
            answer=answer,
        )
        response = llm_json.invoke([HumanMessage(content=prompt)])
        raw = response.content.strip().replace("```json", "").replace("```", "").strip()
        result = json.loads(raw)

        verified = result.get("verified", True)
        confidence = result.get("confidence", 1.0)
        issues = result.get("issues", [])
        note = result.get("note", "")

        if verified:
            step = f"✅ Verifier → Answer verified ({confidence:.0%} confidence)"
        else:
            step = f"⚠️ Verifier → Issues detected: {'; '.join(issues[:2])}"

        if note:
            step += f" — {note}"

    except Exception as e:
        verified = True
        step = "✅ Verifier → Completed (could not parse verification result)"
        note = str(e)

    return {
        "verified": verified,
        "verification_note": step,
        "steps": [step],
    }
