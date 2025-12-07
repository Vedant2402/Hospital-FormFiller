# rag_icd.py
# from langchain.embeddings import HuggingFaceEmbeddings
# from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
# from langchain.schema import Document
from langchain_core.documents import Document
import os

# src/icd10cm-codes-2026.txt
ICD_TXT = "src/icd10cm-codes-2026.txt"
CHROMA_DIR = "chroma_icd"

class ICDRAG:
    def __init__(self):
        # Load data
        with open(ICD_TXT, "r", encoding="utf-8") as f:
            lines = [line.strip() for line in f if line.strip()]

        docs = [Document(page_content=line) for line in lines]

        # Embeddings
        embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-base-en-v1.5")

        # Vector DB
        self.db = Chroma.from_documents(
            documents=docs,
            embedding=embeddings,
            collection_name="icd2026",
            persist_directory=CHROMA_DIR,
        )

    def query(self, question: str, k=5) -> list[str]:
        """Return the top-k matching ICD codes (as raw text lines)."""
        results = self.db.similarity_search(question, k=k)
        return [doc.page_content for doc in results]
    
# run script test
if __name__ == "__main__":
    rag = ICDRAG()
    query = "What are the ICD-10-CM 2026 codes related to diabetes?"
    results = rag.query(query, k=5)
    print("Top ICD codes for query:", query)
    for code in results:
        print(code)
