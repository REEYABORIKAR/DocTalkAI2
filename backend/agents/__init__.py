from langgraph.graph import StateGraph, END
from agents.graph import AgentState
from agents.orchestrator import orchestrator_node
from agents.domain_agent import domain_agent_node
from agents.verifier import verifier_node


def build_graph():
    """Build and compile the LangGraph multi-agent state machine."""
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("orchestrator", orchestrator_node)
    workflow.add_node("domain_agent", domain_agent_node)
    workflow.add_node("verifier", verifier_node)

    # Define edges
    workflow.set_entry_point("orchestrator")
    workflow.add_edge("orchestrator", "domain_agent")
    workflow.add_edge("domain_agent", "verifier")
    workflow.add_edge("verifier", END)

    return workflow.compile()


# Compiled graph singleton
agent_graph = build_graph()


async def run_agent(
    query: str,
    mode: str = "company",
    user: dict = None,
) -> dict:
    """
    Run the multi-agent pipeline for a given query.
    Returns the full state including answer, sources, and steps.
    """
    if user is None:
        user = {"role": "admin", "department": "General"}

    initial_state: AgentState = {
        "query": query,
        "mode": mode,
        "user": user,
        "domain": "global",
        "domain_confidence": 0.0,
        "allowed_domains": [],
        "retrieved_docs": [],
        "context": "",
        "answer": "",
        "sources": [],
        "verified": False,
        "verification_note": "",
        "steps": [],
    }

    final_state = await agent_graph.ainvoke(initial_state)

    return {
        "answer": final_state.get("answer", ""),
        "steps": final_state.get("steps", []),
        "sources": final_state.get("sources", []),
        "domain": final_state.get("domain", "global"),
        "verified": final_state.get("verified", False),
    }
