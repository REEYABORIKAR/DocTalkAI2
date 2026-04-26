from typing import TypedDict, List, Optional, Annotated
from langgraph.graph import StateGraph, END
import operator


class Source(TypedDict):
    file: str
    page: int
    text: str
    domain: str


class AgentState(TypedDict):
    # Input
    query: str
    mode: str  # personal | company | hybrid
    user: dict

    # Orchestrator output
    domain: str
    domain_confidence: float
    allowed_domains: List[str]

    # Retrieval output
    retrieved_docs: List[dict]
    context: str

    # Generation output
    answer: str
    sources: List[Source]

    # Verification output
    verified: bool
    verification_note: str

    # Trace for frontend
    steps: Annotated[List[str], operator.add]
