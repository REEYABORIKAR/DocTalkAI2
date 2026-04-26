from langchain_openai import ChatOpenAI
from core.config import settings

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0,
    streaming=True,
    openai_api_key=settings.OPENAI_API_KEY,
)

llm_json = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0,
    streaming=False,
    openai_api_key=settings.OPENAI_API_KEY,
)
