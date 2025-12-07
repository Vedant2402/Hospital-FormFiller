from langchain.document_loaders import TextLoader
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
import ollama

# === Load the ICD-10-CM 2026 file ===
file_path = "icd10cm-codes-2026.txt"

# Read file lines directly (each line = one ICD code)
try:
    with open(file_path, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f if line.strip()]
    print(f"Loaded {len(lines)} ICD entries from {file_path}")
except Exception as e:
    print(f"Error reading file: {e}")
    exit(1)

# Convert each line into a LangChain-style document
from langchain.schema import Document
docs = [Document(page_content=line) for line in lines]

# === Create embeddings for each ICD code line ===
embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-base-en-v1.5")

# === Store each ICD line embedding in Chroma ===
db = Chroma.from_documents(
    documents=docs,
    embedding=embeddings,
    collection_name="icd10cm_2026_lines"
)
print("Vector store created successfully (one embedding per line).")

# === Example query ===
query = "What are the ICD-10-CM 2026 codes related to hypertension?"

# Retrieve top 5 most relevant codes
results = db.similarity_search(query, k=5)

# Combine top matching ICD codes into a string
data = "\n".join(doc.page_content for doc in results)

# === Generate answer using Ollama ===
output = ollama.generate(
    model="llama3.2:1b",
    prompt=f"Use these ICD-10-CM 2026 codes:\n\n{data}\n\nQuestion: {query}"
)

print("\n=== Response ===")
print(output['response'])
