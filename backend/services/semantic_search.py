from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer("all-MiniLM-L6-v2")


def find_best_match(user_question, knowledge_list):
    if not knowledge_list:
        return None

    questions = [item.question for item in knowledge_list]

    user_embedding = model.encode([user_question])
    question_embeddings = model.encode(questions)

    similarities = cosine_similarity(
        user_embedding,
        question_embeddings
    )[0]

    best_index = similarities.argmax()
    best_score = similarities[best_index]

    return knowledge_list[best_index], float(best_score)