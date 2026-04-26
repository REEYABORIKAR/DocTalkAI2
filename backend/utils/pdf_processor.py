import os
import json
import fitz  # PyMuPDF
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from core.llm import llm_json
from core.vector_store import add_documents_to_domain
from langchain_core.messages import HumanMessage
from typing import Dict, Any


METADATA_EXTRACTION_PROMPT = """Analyze this document title and first page content.
Extract and return ONLY a JSON object with these fields:
{{
  "department": "HR|IT|Finance|Legal|Compliance|Operations|General",
  "policy_type": "Policy|Guideline|Procedure|Handbook|Report|Contract|Other",
  "security_level": "Public|Internal|Confidential|Restricted",
  "domain": "The primary domain slug (lowercase, underscore separated)"
}}

Document filename: {filename}
First page content (first 500 chars): {preview}

Respond ONLY with the JSON object, no markdown, no explanation."""


def extract_metadata_with_llm(filename: str, preview: str) -> Dict[str, Any]:
    """Use LLM to intelligently extract document metadata."""
    try:
        prompt = METADATA_EXTRACTION_PROMPT.format(
            filename=filename, preview=preview[:500]
        )
        response = llm_json.invoke([HumanMessage(content=prompt)])
        raw = response.content.strip()
        # Strip any accidental markdown fences
        raw = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(raw)
    except Exception:
        # Fallback metadata
        return {
            "department": "General",
            "policy_type": "Document",
            "security_level": "Internal",
            "domain": "general",
        }


def process_pdf(file_path: str, filename: str) -> Dict[str, Any]:
    """
    Process a PDF file:
    1. Extract text per page with page numbers
    2. Use LLM to extract domain metadata
    3. Split into chunks preserving page number metadata
    4. Store in the correct ChromaDB domain collection
    Returns metadata dict for API response.
    """
    doc = fitz.open(file_path)
    total_pages = len(doc)

    # Build page-aware documents
    page_docs = []
    full_text_preview = ""
    for page_num in range(total_pages):
        page = doc[page_num]
        text = page.get_text("text").strip()
        if not text:
            continue
        if page_num == 0:
            full_text_preview = text
        page_docs.append(
            Document(
                page_content=text,
                metadata={
                    "filename": filename,
                    "page": page_num + 1,  # 1-indexed
                    "total_pages": total_pages,
                    "source": file_path,
                },
            )
        )

    doc.close()

    # Extract metadata using LLM
    meta = extract_metadata_with_llm(filename, full_text_preview)
    domain = meta.get("domain", "general")

    # Enrich all page docs with extracted metadata
    for d in page_docs:
        d.metadata.update(meta)

    # Split into chunks, preserving metadata
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = splitter.split_documents(page_docs)

    # Ensure each chunk retains page number from its parent doc
    # (splitter preserves metadata from source docs)
    for chunk in chunks:
        if "page" not in chunk.metadata:
            chunk.metadata["page"] = 1

    # Store in domain-specific collection AND global collection
    add_documents_to_domain(chunks, domain)
    if domain != "general":
        add_documents_to_domain(chunks, "global")

    return {
        "filename": filename,
        "total_pages": total_pages,
        "chunks_indexed": len(chunks),
        "domain": domain,
        "department": meta.get("department", "General"),
        "policy_type": meta.get("policy_type", "Document"),
        "security_level": meta.get("security_level", "Internal"),
    }
