# 🤖 Self-Learning AI Chatbot

A full-stack AI chatbot that can learn new knowledge from users and use that knowledge to answer future questions.

The application uses semantic search to find relevant stored knowledge instead of relying only on exact keyword matching. User-provided knowledge is stored in PostgreSQL and retrieved using sentence embeddings and cosine similarity.

---

## ✨ Features

- 💬 AI Chat
- 🧠 User-controlled self-learning
- 🔍 Semantic question matching
- 📚 Knowledge Library
- 🔎 Knowledge search
- ✏️ Edit learned knowledge
- 🗑️ Delete learned knowledge
- 💬 Chat History
- 🗑️ Delete individual conversations
- 🧹 Clear chat history
- 🛡️ Exact duplicate detection
- 🛡️ Semantic duplicate detection
- 📖 Interactive FastAPI Swagger documentation
- 🌐 HTML, CSS and JavaScript frontend
- 🗄️ PostgreSQL database

---

## 🧠 How It Works

The chatbot uses a Sentence Transformer model to convert questions into numerical embeddings.

The application compares the user's question with questions stored in the knowledge database using cosine similarity.

```text
User asks a question
        │
        ▼
Generate question embedding
        │
        ▼
Compare with stored knowledge
        │
        ▼
Calculate cosine similarity
        │
        ▼
Similarity >= 0.70?
        │
     ┌──┴──┐
    YES    NO
     │      │
     ▼      ▼
Return   Unknown
answer   question
            │
            ▼
        Teach AI
            │
            ▼
       Save knowledge
            │
            ▼
        PostgreSQL
            │
            ▼
      Ask question again
            │
            ▼
       Learned answer
🔎 Semantic Search
The project uses:
Sentence Transformers
Cosine Similarity
all-MiniLM-L6-v2
For example:
What is Python?
and:
Explain Python programming.
can be recognized as semantically similar questions.
🎯 Similarity Thresholds
Chat Threshold
The chatbot uses a similarity threshold of 0.70.
If the similarity score is at least 0.70, the chatbot considers the stored knowledge relevant enough to answer the question.
Otherwise, the chatbot responds that it does not know the answer yet.
Duplicate Detection Threshold
The chatbot uses a similarity threshold of 0.90 for semantic duplicate detection.
A similarity score of 0.90 or higher is treated as a potential duplicate when new knowledge is added.
🏗️ System Architecture
┌──────────────────────────────┐
│          Frontend            │
│      HTML / CSS / JS         │
└──────────────┬───────────────┘
               │
               │ REST API
               ▼
┌──────────────────────────────┐
│           FastAPI            │
│          Backend             │
└──────────────┬───────────────┘
               │
       ┌───────┼────────┐
       │       │        │
       ▼       ▼        ▼
┌──────────┐ ┌────────┐ ┌──────────────┐
│SQLAlchemy│ │Pydantic│ │Semantic      │
│          │ │Schemas │ │Search        │
└────┬─────┘ └────────┘ └──────┬───────┘
     │                          │
     ▼                          ▼
┌──────────────┐       ┌──────────────────┐
│ PostgreSQL   │       │ Sentence         │
│ Database     │       │ Transformers     │
└──────────────┘       │ all-MiniLM-L6-v2 │
                       └──────────────────┘
🛠️ Tech Stack
Frontend
HTML5
CSS3
JavaScript
Fetch API
Backend
Python
FastAPI
Uvicorn
Pydantic
Database
PostgreSQL
SQLAlchemy
Psycopg2
AI / NLP
Sentence Transformers
Scikit-learn
Cosine Similarity
all-MiniLM-L6-v2
Development Tools
Visual Studio Code
PowerShell
Git
GitHub
📁 Project Structure
self_learning_ai_chatbot/
│
├── backend/
│   ├── services/
│   │   └── semantic_search.py
│   │
│   ├── __init__.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── .gitignore
├── .env.example
└── README.md
The actual .env file is kept local and is not uploaded to GitHub.
🗄️ Database
The application uses PostgreSQL with SQLAlchemy.
Knowledge
Each knowledge record contains:
id
question
answer
created_at
Chat History
Each conversation contains:
id
question
answer
created_at
🔌 API Endpoints
Method
Endpoint
Description
GET
/
API status
GET
/health
Health and database check
POST
/learn
Teach the chatbot new knowledge
POST
/chat
Ask the chatbot a question
GET
/knowledge
Get all learned knowledge
PUT
/knowledge/{id}
Update knowledge
DELETE
/knowledge/{id}
Delete knowledge
GET
/history
Get chat history
DELETE
/history/{id}
Delete one history entry
DELETE
/history
Clear all chat history
📖 API Documentation
FastAPI provides interactive API documentation through Swagger UI.
After starting the backend, open:
http://127.0.0.1:8000/docs
⚙️ Installation
1. Clone the Repository
Clone this project repository and open the project folder.
cd self_learning_ai_chatbot
2. Create a Virtual Environment
python -m venv .venv
Windows PowerShell
.\.venv\Scripts\Activate.ps1
3. Install Dependencies
pip install -r backend/requirements.txt
🐘 PostgreSQL Setup
Create a PostgreSQL database named:
self_learning_ai
The application uses this database to store learned knowledge and chat history.
🔐 Environment Variables
Create a .env file in the project root and add your local PostgreSQL connection details.
The required environment variable is:
DATABASE_URL=postgresql+psycopg2://<your-local-postgresql-credentials>
Keep the .env file private and never upload it to GitHub.
▶️ Run the Backend
From the project root:
uvicorn backend.main:app --reload
The backend will run at:
http://127.0.0.1:8000
Health check:
http://127.0.0.1:8000/health
Swagger documentation:
http://127.0.0.1:8000/docs
🌐 Run the Frontend
Open the frontend folder in Visual Studio Code.
Use the Live Server extension to open:
frontend/index.html
The frontend can then be accessed through the local Live Server address.
Make sure the FastAPI backend is running before using the chatbot.
🧪 Example
1. Ask a Question
What is Python?
The chatbot searches the knowledge library and returns the most relevant stored answer.
Example:
Python is a high-level programming language used for
software development, automation, data science, and
artificial intelligence.
2. Ask an Unknown Question
What is quantum computing?
If the chatbot does not have sufficiently similar knowledge:
I don't know this yet.
You can teach me using the Teach AI option.
3. Teach the Chatbot
Click:
🧠 Teach AI
Enter the question and its answer.
The information is stored in PostgreSQL.
4. Ask Again
Ask the same or a semantically similar question.
The chatbot can retrieve the newly learned knowledge using semantic search.
🔄 Self-Learning Cycle
        ┌──────────────┐
        │     User     │
        └──────┬───────┘
               │
               ▼
        Ask a question
               │
               ▼
       Semantic Search
               │
        ┌──────┴──────┐
        │             │
     Known         Unknown
        │             │
        ▼             ▼
 Return answer    Teach AI
                      │
                      ▼
               Save knowledge
                      │
                      ▼
                 PostgreSQL
                      │
                      ▼
              Ask question again
                      │
                      ▼
               Learned answer
🛡️ Duplicate Prevention
The /learn endpoint checks for duplicate knowledge.
Exact Duplicate
If the same question already exists, the chatbot prevents duplicate knowledge from being added.
Semantic Duplicate
If a new question is highly similar to an existing question, the chatbot prevents the similar knowledge from being added.
This helps keep the knowledge library organized.
🔒 Security
The project keeps database credentials outside the source code through environment variables.
The .env file should never be committed to GitHub.
Before production deployment, additional security measures such as authentication, HTTPS, restricted CORS, authorization and API rate limiting can be implemented.
🚀 Future Improvements
👤 User authentication
👥 Multiple user knowledge bases
🧠 Conversation context
🎙️ Voice input
🔊 Text-to-speech
🏷️ Knowledge categories and tags
📊 Admin dashboard
🗃️ Vector database integration
🔐 Authentication and authorization
🐳 Docker deployment
☁️ Cloud deployment
🧪 Automated testing
⚡ Streaming responses
📱 Improved mobile UI
🎓 Project Purpose
This project demonstrates practical implementation of:
Full-stack web development
Python backend development
REST API development
FastAPI
PostgreSQL
SQLAlchemy
Natural Language Processing
Sentence Transformers
Semantic Search
Cosine Similarity
Frontend development
Database management
AI/ML application development
This project is intended for educational, academic, and portfolio purposes.
👨‍💻 Author
Ahalya Ojha
B.Tech – Computer Science & Engineering
Nalanda Institute of Technology, Bhubaneswar
📄 License
This project is created for educational and portfolio purposes.