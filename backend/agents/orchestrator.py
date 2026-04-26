import json
from agents.graph import AgentState
from core.llm import llm_json
from core.vector_store import list_collections
from langchain_core.messages import HumanMessage
from utils.auth import check_domain_access

ORCHESTRATOR_PROMPT = """You are a Master Router for an enterprise document AI system.
Your job is to classify the user's query into the most relevant domain.

Available domains in the knowledge base: {available_domains}

User query: "{query}"

Analyze the query and respond ONLY with a JSON object:
{{
  "domain": "the most relevant domain slug from the list, or 'global' if unsure",
  "confidence": 0.0 to 1.0,
  "reasoning": "one sentence explanation"
}}

Rules:
- If the query is ambiguous or cross-domain, use 'global'
- If no specific domain matches well (confidence < 0.5), use 'global'
- Return ONLY the JSON, no markdown"""


def orchestrator_node(state: AgentState) -> dict:
    """
    Master Router: classifies query domain and filters accessible collections
    based on user RBAC permissions.
    """
    query = state["query"]
    user = state.get("user", {})
    mode = state.get("mode", "company")

    # Get all available collections
    all_collections = list_collections()
    if not all_collections:
        all_collections = ["global"]

    # Filter by user RBAC
    accessible = [
        col for col in all_collections
        if check_domain_access(user, col)
    ]
    if not accessible:
        accessible = ["global"]

    # For personal mode, restrict further
    if mode == "personal":
        accessible = ["global"]

    # Ask LLM to classify domain
    prompt = ORCHESTRATOR_PROMPT.format(
        available_domains=", ".join(accessible),
        query=query,
    )
    try:
        response = llm_json.invoke([HumanMessage(content=prompt)])
        raw = response.content.strip().replace("```json", "").replace("```", "").strip()
        result = json.loads(raw)
        domain = result.get("domain", "global")
        confidence = float(result.get("confidence", 0.5))
        reasoning = result.get("reasoning", "")
    except Exception:
        domain = "global"
        confidence = 0.5
        reasoning = "Fallback to global search"

    # Ensure domain is accessible
    if domain not in accessible:
        domain = accessible[0] if accessible else "global"

    step = f"🧭 Orchestrator → Routing to **{domain.upper()}** domain (confidence: {confidence:.0%})"
    if reasoning:
        step += f" — {reasoning}"

    return {
        "domain": domain,
        "domain_confidence": confidence,
        "allowed_domains": accessible,
        "steps": [step],
    }
