from flask import Blueprint, request, jsonify
import logging
import traceback
import os
from chromadb import PersistentClient
# from langchain_community.vectorstores import Chroma
# from langchain_huggingface import HuggingFaceEmbeddings

from src.utils.llm_utils import run_llm, fake_run_llm
from src.utils.narrative_utils import build_prompt

llm_bp = Blueprint("llm", __name__)

@llm_bp.route("/run", methods=["POST"])
def run():
	data = request.get_json() or {}
	narrative = data.get("narrative")
	fields = data.get("fields")
      
	model_path = "google/gemma-3-4b-it-qat-q4_0-gguf"

	if not model_path or not narrative or not fields:
		return (
			jsonify({"error": "model_path, narrative and fields are required"}),
			400,
		)

	try:
		prompt = build_prompt(narrative, fields)
		# result = run_llm(model_path, prompt)
		result = fake_run_llm(model_path, prompt)  # for testing
		return jsonify({"result": result}), 200
	except Exception as e:
		logging.error("Error in LLM route: %s", traceback.format_exc())
		return jsonify({"error": str(e)}), 500
	
@llm_bp.route("/check_db", methods=["GET"])
def check_db():
    persist_directory = "/app/databases"
    
    if not os.path.exists(persist_directory):
        return jsonify({"exists": False}), 200

    try:
        client = get_chroma_client(persist_directory)
        collections = [c.name for c in client.list_collections()]
        return jsonify({"exists": True, "collections": collections}), 200

    except Exception as e:
        logging.error("Error checking Chroma DB: %s", traceback.format_exc())
        return jsonify({"error": str(e)}), 500
	
	
def get_chroma_client(path: str):
    return PersistentClient(path)