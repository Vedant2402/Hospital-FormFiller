from typing import List, Optional
import os
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
# from langchain_chroma import Chroma
from langchain_core.documents import Document
import json
import re


def create_embeddings_from_files(file_paths: List[str]) -> Chroma:
	chunk_size = 500
	chunk_overlap = 100
	embedding_model = "BAAI/bge-base-en-v1.5"
	docs = []

	BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
	persist_directory = os.path.join(BASE_DIR, "database")

	for fp in file_paths:
		try:
			if fp.lower().endswith(".pdf"):
				loader = PyPDFLoader(fp)
			else:
				loader = TextLoader(fp)
			loaded = loader.load()
			docs.extend(loaded)
		except Exception as e:
			# Log and continue with other files
			print(f"Warning: failed to load '{fp}': {e}")

	if not docs:
		raise ValueError("No documents were loaded from provided file paths.")

	text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
	texts = text_splitter.split_documents(docs)

	embeddings = HuggingFaceEmbeddings(model_name=embedding_model)

	# If a persist directory is configured, pass it to Chroma to allow persistence.
	if persist_directory:
		db = Chroma.from_documents(
			documents=texts,
			embedding=embeddings,
			collection_name="my_collection",
			persist_directory=persist_directory,
		)
		try:
			db.persist()
		except Exception:
			# persist may be a no-op depending on Chroma backend
			pass
	else:
		db = Chroma.from_documents(
			documents=texts,
			embedding=embeddings,
			collection_name="my_collection",
		)

	return db


def get_similar_context(db: Chroma, question: str, k: int = 3) -> str:

	if db is None:
		raise ValueError("A valid Chroma vectorstore must be provided.")

	results = db.similarity_search(question, k=k)
	if not results:
		return ""

	return "\n\n".join(doc.page_content for doc in results)

def create_idc_embeddings() -> None:
	BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
	db_dir = os.path.join(BASE_DIR, "databases")
	txt_path = os.path.join(BASE_DIR, "src", "icd10cm-codes-2026.txt")
	db_path = os.path.join(db_dir, "icd2026")

	# Check if ICD-10 collection already exists
	if os.path.exists(db_path):
		print("✅ ICD-10 embeddings already exist at:", db_dir)
		return

	print("🚀 Creating ICD-10 embeddings at:", db_dir, "from file:", txt_path)

	with open(txt_path, "r", encoding="utf-8") as f:
		lines = [line.strip() for line in f if line.strip()]

	docs = [Document(page_content=line) for line in lines]

	embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-base-en-v1.5")

	Chroma.from_documents(
		documents=docs,
		embedding=embeddings,
		collection_name="icd2026",
		persist_directory=db_path,
	)

	print("✅ ICD-10 embeddings created successfully.")