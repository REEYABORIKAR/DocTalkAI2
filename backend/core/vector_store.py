import chromadb
from langchain_community.vectorstores import Chroma
from core.config import settings
from core.embeddings import embeddings
from typing import List, Dict, Any, Optional

# Persistent ChromaDB client
_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)

GLOBAL_COLLECTION = "global"


def _sanitize_collection_name(name: str) -> str:
    """ChromaDB collection names must be 3-63 chars, alphanumeric + hyphens."""
    sanitized = name.lower().replace(" ", "_").replace("/", "_")
    sanitized = "".join(c for c in sanitized if c.isalnum() or c == "_")
    return sanitized[:63] if len(sanitized) >= 3 else f"col_{sanitized}"


def get_vectorstore(domain: str = GLOBAL_COLLECTION) -> Chroma:
    """Get or create a Chroma vectorstore for a given domain collection."""
    collection_name = _sanitize_collection_name(domain)
    return Chroma(
        client=_client,
        collection_name=collection_name,
        embedding_function=embeddings,
    )


def get_retriever(domain: str = GLOBAL_COLLECTION, k: int = 5):
    """Get a retriever for a specific domain."""
    return get_vectorstore(domain).as_retriever(
        search_type="similarity",
        search_kwargs={"k": k},
    )


def list_collections() -> List[str]:
    """List all available domain collections."""
    return [col.name for col in _client.list_collections()]


def add_documents_to_domain(
    chunks: List[Any],
    domain: str,
) -> None:
    """Add document chunks to the appropriate domain collection."""
    vs = get_vectorstore(domain)
    vs.add_documents(chunks)


def search_across_domains(
    query: str,
    domains: Optional[List[str]] = None,
    k: int = 5,
) -> List[Any]:
    """Search across multiple domain collections and merge results."""
    if domains is None:
        domains = list_collections()
        if not domains:
            domains = [GLOBAL_COLLECTION]

    all_docs = []
    for domain in domains:
        try:
            retriever = get_retriever(domain, k=k)
            docs = retriever.invoke(query)
            all_docs.extend(docs)
        except Exception:
            pass

    # Deduplicate by content
    seen = set()
    unique_docs = []
    for doc in all_docs:
        key = doc.page_content[:100]
        if key not in seen:
            seen.add(key)
            unique_docs.append(doc)

    return unique_docs[:k]
