from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
import json
import io
import re
import os
from src.db import db
from src.models import PDFDocument
from src.utils.pdf_utils import extract_pdf_field_names, fill_pdf_form, extract_pdf_text
from src.utils.db_utils import DBUtils
from langchain_community.vectorstores import Chroma
# from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings


pdf_bp = Blueprint("pdf", __name__)

# ====== upload PDF and extract fields ====== #
@pdf_bp.route("/upload", methods=["POST"])
def upload_pdf():
    user_uid = request.form.get("user_uid")
    if not user_uid:
        return jsonify({"error": "user_uid is required"}), 400

    if "pdf" not in request.files:
        return jsonify({"error": "No PDF uploaded"}), 400

    file = request.files["pdf"]
    filename = secure_filename(file.filename)
    pdf_data = file.read()

    try:
        fields = extract_pdf_field_names(pdf_data)

        if not fields:
            return jsonify({"error": "No form fields found in the PDF"}), 400

        fields_json = json.dumps(fields)

        pdf_record = DBUtils.create(
            PDFDocument,
            user_uid=user_uid,
            filename=filename,
            content=pdf_data,
            fields_json=fields_json
        )

        return jsonify({
            "message": "PDF uploaded and saved successfully",
            "id": pdf_record.id,
            "user_uid": pdf_record.user_uid,
            "filename": pdf_record.filename,
            "fields": fields
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ===== get all pdf by uid ====== #
@pdf_bp.route("/user/<user_uid>", methods=["GET"])
def get_pdfs_by_user(user_uid):
    pdf_records = DBUtils.get_all_by_uid(PDFDocument, user_uid)
    pdfs_list = [
        {
            "id": pdf.id,
            "user_uid": pdf.user_uid,
            "filename": pdf.filename,
            "fields_json": pdf.fields_json,
            "created_at": pdf.created_at.isoformat()
        }
        for pdf in pdf_records
    ]
    return jsonify({"pdfs": pdfs_list}), 200

# ===== get PDF fields by ID ====== #
@pdf_bp.route("/<int:pdf_id>/fields", methods=["GET"])
def get_pdf_fields(pdf_id):
    
    pdf_record = PDFDocument.query.get(pdf_id)
    if not pdf_record:
        return jsonify({"error": "PDF not found"}), 404

    if not pdf_record.fields_json:
        return jsonify({"error": "No fields extracted for this PDF"}), 404
    
    try:
        fields = json.loads(pdf_record.fields_json)
    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse fields JSON"}), 500
    
    return jsonify({"fields": fields}), 200

# ===== delete PDF by ID ====== #
@pdf_bp.route("/<int:pdf_id>", methods=["DELETE"])
def delete_pdf(pdf_id):
    try:
        success = DBUtils.delete(PDFDocument, pdf_id)
        if not success:
            return jsonify({"error": "PDF not found"}), 404
        return jsonify({"message": "PDF deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

# ===== Fill pdf ===== #
@pdf_bp.route("/<int:pdf_id>/fill", methods=["POST"])
def fill_pdf_route(pdf_id):
    data = request.get_json() or {}
    field_values_str = data.get("field_values")

    try:
        field_values = json.loads(field_values_str)  # convert string to dict
    except json.JSONDecodeError:
        return {"error": "Invalid JSON in field_values"}, 400

    pdf_record = DBUtils.get_by_id(PDFDocument, pdf_id)
    if not pdf_record:
        return jsonify({"error": "PDF not found"}), 404

    try:
        filled_pdf_data = fill_pdf_form(pdf_record.content, field_values)

        return send_file(
        io.BytesIO(filled_pdf_data),
        as_attachment=True,
        download_name=f"filled_{pdf_record.filename}",
        mimetype="application/pdf"
        ), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
 
# ===== Extract text from uploaded pdf + create embedding + store in chroma db ===== #
@pdf_bp.route("/upload_and_extract", methods=["POST"])
def upload_and_embed_pdf():
    
    if "pdf" not in request.files:
        return jsonify({"error": "No PDF uploaded"}), 400

    file = request.files["pdf"]
    pdf_data = file.read()
    BASE_DIR = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../..")   # two levels up
    )
    db_dir = os.path.join(BASE_DIR, "databases")
    COLLECTION_NAME = "icd2026"
    QUERY = "Whar are the icd code relared to this assesments - {ASSESSMENT}?"

    try:
        text = extract_pdf_text(pdf_data)
        match = re.search(r"ASSESSMENT:\s*(.*?)\s*PLAN:", text, re.DOTALL | re.IGNORECASE)
        assessment = match.group(1).strip() if match else None
     
        embedding = HuggingFaceEmbeddings(model_name="BAAI/bge-base-en-v1.5")
        
        chroma_db = Chroma(
            collection_name=COLLECTION_NAME,
            embedding_function=embedding,
            persist_directory=db_dir
        )

        if assessment:
            query_text = QUERY.replace("{ASSESSMENT}", assessment)
        else:
            query_text = "List some ICD codes related to medical assessments."

        similar_context = chroma_db.similarity_search(query_text, k=3)
        similar_context = "\n\n".join(doc.page_content for doc in similar_context)

        text = text + "\n\nICD CODES:\n" + similar_context

        return jsonify({
            "message": "PDF uploaded, text extracted successfully",
            "similar_context": similar_context,
            "extracted_text": text
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
       