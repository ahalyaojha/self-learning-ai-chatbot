from pydantic import BaseModel


class KnowledgeCreate(BaseModel):
    question: str
    answer: str


class ChatRequest(BaseModel):
    question: str