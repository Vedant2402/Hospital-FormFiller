from flask import Flask
from src.db import db

class PDFDocument(db.Model):
    __tablename__ = 'pdf_documents'

    id = db.Column(db.Integer, primary_key=True)
    user_uid = db.Column(db.Integer, nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    content = db.Column(db.LargeBinary, nullable=False)
    fields_json = db.Column(db.Text, nullable=True)  
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())