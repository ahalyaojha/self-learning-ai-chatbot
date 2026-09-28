from datetime import datetime

from sqlalchemy import String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from backend.database import Base


class Knowledge(Base):
    __tablename__ = "knowledge"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    question: Mapped[str] = mapped_column(
        String(500),
        nullable=False
    )

    answer: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )
class ChatHistory(Base):
    __tablename__ = "chat_history"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    question: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    answer: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )    