from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.database import engine, Base, get_db
from backend import models
from backend.schemas import KnowledgeCreate, ChatRequest
from backend.services.semantic_search import find_best_match


app = FastAPI(
    title="Self Learning AI Chatbot",
    description="An AI chatbot that learns from user-provided knowledge.",
    version="1.0.0",
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# DATABASE
# --------------------------------------------------

Base.metadata.create_all(bind=engine)


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Self Learning AI Chatbot API is running!"
    }


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/health")
def health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }


# --------------------------------------------------
# LEARN KNOWLEDGE
# --------------------------------------------------

@app.post("/learn")
def learn(
    knowledge: KnowledgeCreate,
    db: Session = Depends(get_db)
):
    # Check exact duplicate
    existing_knowledge = (
        db.query(models.Knowledge)
        .filter(
            models.Knowledge.question.ilike(
                knowledge.question.strip()
            )
        )
        .first()
    )

    if existing_knowledge:
        raise HTTPException(
            status_code=409,
            detail="This question is already in the knowledge library."
        )

    # Check semantic duplicate
    knowledge_list = db.query(models.Knowledge).all()

    semantic_result = find_best_match(
        knowledge.question,
        knowledge_list
    )

    if semantic_result is not None:
        similar_knowledge, similarity = semantic_result

        if similarity >= 0.90:
            raise HTTPException(
                status_code=409,
                detail=(
                    "A similar question already exists "
                    "in the knowledge library."
                )
            )

    # Create new knowledge
    new_knowledge = models.Knowledge(
        question=knowledge.question.strip(),
        answer=knowledge.answer.strip()
    )

    db.add(new_knowledge)
    db.commit()
    db.refresh(new_knowledge)

    return {
        "message": "Knowledge learned successfully!",
        "id": new_knowledge.id,
        "question": new_knowledge.question,
        "answer": new_knowledge.answer
    }


# --------------------------------------------------
# CHAT
# --------------------------------------------------

@app.post("/chat")
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    knowledge_list = db.query(models.Knowledge).all()

    result = find_best_match(
        request.question,
        knowledge_list
    )

    if result is None:
        answer = (
            "I don't know this yet. "
            "You can teach me using the /learn endpoint."
        )

        source = "unknown"
        similarity = None

    else:
        knowledge, score = result

        if score >= 0.70:
            answer = knowledge.answer
            source = "semantic_search"
            similarity = round(float(score), 3)

        else:
         answer = (
        "I don't know this yet. "
        "You can teach me using the Teach AI option."
    )

    source = "unknown"
    similarity = round(float(score), 3)

    # Save conversation
    chat_history = models.ChatHistory(
        question=request.question,
        answer=answer
    )

    db.add(chat_history)
    db.commit()

    response = {
        "answer": answer,
        "source": source
    }

    if similarity is not None:
        response["similarity"] = similarity

    return response


# --------------------------------------------------
# KNOWLEDGE LIBRARY
# --------------------------------------------------

@app.get("/knowledge")
def get_knowledge(
    db: Session = Depends(get_db)
):
    knowledge_list = (
        db.query(models.Knowledge)
        .order_by(models.Knowledge.created_at.desc())
        .all()
    )

    return [
        {
            "id": item.id,
            "question": item.question,
            "answer": item.answer,
            "created_at": item.created_at
        }
        for item in knowledge_list
    ]


# --------------------------------------------------
# UPDATE KNOWLEDGE
# --------------------------------------------------

@app.put("/knowledge/{knowledge_id}")
def update_knowledge(
    knowledge_id: int,
    knowledge_data: KnowledgeCreate,
    db: Session = Depends(get_db)
):
    knowledge = (
        db.query(models.Knowledge)
        .filter(
            models.Knowledge.id == knowledge_id
        )
        .first()
    )

    if not knowledge:
        raise HTTPException(
            status_code=404,
            detail="Knowledge not found"
        )

    knowledge.question = knowledge_data.question.strip()
    knowledge.answer = knowledge_data.answer.strip()

    db.commit()
    db.refresh(knowledge)

    return {
        "message": "Knowledge updated successfully!",
        "id": knowledge.id,
        "question": knowledge.question,
        "answer": knowledge.answer
    }


# --------------------------------------------------
# DELETE KNOWLEDGE
# --------------------------------------------------

@app.delete("/knowledge/{knowledge_id}")
def delete_knowledge(
    knowledge_id: int,
    db: Session = Depends(get_db)
):
    knowledge = (
        db.query(models.Knowledge)
        .filter(
            models.Knowledge.id == knowledge_id
        )
        .first()
    )

    if not knowledge:
        raise HTTPException(
            status_code=404,
            detail="Knowledge not found"
        )

    db.delete(knowledge)
    db.commit()

    return {
        "message": "Knowledge deleted successfully!",
        "id": knowledge_id
    }


# --------------------------------------------------
# CHAT HISTORY
# --------------------------------------------------

@app.get("/history")
def get_history(
    db: Session = Depends(get_db)
):
    history = (
        db.query(models.ChatHistory)
        .order_by(
            models.ChatHistory.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": item.id,
            "question": item.question,
            "answer": item.answer,
            "created_at": item.created_at
        }
        for item in history
    ]


# --------------------------------------------------
# DELETE ALL CHAT HISTORY
# --------------------------------------------------

@app.delete("/history")
def clear_history(
    db: Session = Depends(get_db)
):
    db.query(models.ChatHistory).delete()
    db.commit()

    return {
        "message": "Chat history cleared successfully!"
    }


# --------------------------------------------------
# DELETE ONE CHAT HISTORY
# --------------------------------------------------

@app.delete("/history/{history_id}")
def delete_history(
    history_id: int,
    db: Session = Depends(get_db)
):
    history = (
        db.query(models.ChatHistory)
        .filter(
            models.ChatHistory.id == history_id
        )
        .first()
    )

    if not history:
        raise HTTPException(
            status_code=404,
            detail="Chat history not found"
        )

    db.delete(history)
    db.commit()

    return {
        "message": "Chat history deleted successfully!",
        "id": history_id
    }