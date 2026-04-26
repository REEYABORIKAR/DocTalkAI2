from agents.graph import AgentState
from core.vector_store import get_retriever, search_across_domains
from core.llm import llm_json
from langchain_core.messages import HumanMessage, SystemMessage

DOMAIN_AGENT_SYSTEM = """You are an expert enterprise document analyst.
Answer the user's question based STRICTLY on the provided context documents.
Be precise, professional, and cite which document and page number supports each claim.
If the context doesn't contain the answer, say so clearly - do NOT fabricate information.
Format your answer in clear, professional prose."""

DOMAIN_AGENT_PROMPT = """Context documents:
{context}

User question: {query}

Provide a comprehensive answer based only on the context above.
Reference specific documents and page numbers when making claims."""


def domain_agent_node(state: AgentState) -> dict:
    """
    Domain Sub-Agent: retrieves relevant chunks from the assigned domain
    collection and generates an answer with source citations.
    """
    query = state["query"]
    domain = state.get("domain", "global")
    allowed_domains = state.get("allowed_domains", ["global"])

    step = f"🔍 **{domain.upper()} Agent** → Searching knowledge base..."

    # Retrieve from assigned domain; fallback to multi-domain search
    try:
        retriever = get_retriever(domain, k=6)
        docs = retriever.invoke(query)
        if not docs and domain != "global":
            docs = search_across_domains(query, allowed_domains, k=6)
            step += f" (expanded to multi-domain search)"
    except Exception:
        docs = search_across_domains(query, allowed_domains, k=6)
        step += " (fallback multi-domain)"

    if not docs:
        return {
            "retrieved_docs": [],
            "context": "",
            "answer": "I could not find relevant information in the knowledge base for your query. Please ensure relevant documents have been uploaded.",
            "sources": [],
            "steps": [step, "⚠️ No relevant documents found in knowledge base"],
        }

    # Build context string and sources list
    context_parts = []
    sources = []
    seen_sources = set()

    for i, doc in enumerate(docs):
        meta = doc.metadata
        filename = meta.get("filename", "Unknown Document")
        page = meta.get("page", 1)
        text_snippet = doc.page_content[:300].strip()

        context_parts.append(
            f"[Source {i+1}] {filename} (Page {page}):\n{doc.page_content}"
        )

        source_key = f"{filename}:{page}"
        if source_key not in seen_sources:
            seen_sources.add(source_key)
            sources.append({
                "file": filename,
                "page": page,
                "text": text_snippet,
                "domain": meta.get("domain", domain),
            })

    context = "\n\n---\n\n".join(context_parts)

    # Generate answer
    messages = [
        SystemMessage(content=DOMAIN_AGENT_SYSTEM),
        HumanMessage(content=DOMAIN_AGENT_PROMPT.format(
            context=context, query=query
        )),
    ]
    response = llm_json.invoke(messages)
    answer = response.content.strip()

    step += f" → Found {len(docs)} relevant chunks from {len(sources)} source(s)"

    return {
        "retrieved_docs": [
            {"content": d.page_content, "metadata": d.metadata} for d in docs
        ],
        "context": context,
        "answer": answer,
        "sources": sources,
        "steps": [step],
    }
