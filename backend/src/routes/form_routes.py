from flask import Blueprint, request, jsonify
from src.models.form_dataclass import patientForm
from src.utils.narrative_utils import build_narrative

form_bp = Blueprint("form", __name__)

# ====== submit form data ====== #
@form_bp.route("/submit", methods=["POST"])
def submit_form():
    data = request.get_json()

    try:
        form = patientForm(**data)
    except TypeError as e:
        return jsonify({"error": str(e)}), 400

    errors = form.custom_validation()

    if errors:
        return jsonify({"errors": errors}), 400
    
    narrative = build_narrative(form)
    
    return jsonify({"narrative": narrative}), 200
