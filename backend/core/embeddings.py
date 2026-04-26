from langchain_openai import OpenAIEmbeddings
from core.config import settings

embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",
    openai_api_key=settings.OPENAI_API_KEY,
)
