import json
import re
from typing import Optional, List

try:
	from llama_cpp import Llama
except Exception:
	# llama_cpp may not be available in all environments; defer import error until runtime
	Llama = None  # type: ignore


# def extract_json_block(raw: str) -> str:
# 	match = re.search(r"\{.*\}", raw, re.DOTALL)
# 	if not match:
# 		raise ValueError("Could not find a JSON object in LLM output.")

# 	json_str = match.group(0)

# 	json_str = re.sub(r'"Clear Form[^"]*"\s*,?', "", json_str)

#     # make sure to remove trailing commas before closing braces/brackets
# 	json_str = re.sub(r",(\s*[}\]])", r"\1", json_str)

# 	return json_str

def extract_json_block(raw: str) -> str:
    # Safely extract the FIRST JSON object only.
    stack = []
    start = None
    
    for i, ch in enumerate(raw):
        if ch == '{':
            if start is None:
                start = i
            stack.append(ch)
        elif ch == '}':
            if stack:
                stack.pop()
                if not stack and start is not None:
                    return raw[start:i+1]

    raise ValueError("No balanced JSON object found.")


def run_llm(model_path: str, prompt: str) -> dict:
	if Llama is None:
		raise RuntimeError("llama_cpp is not installed or could not be imported")
	
    # repo_id="Qwen/Qwen2.5-0.5B-Instruct-GGUF",
    # filename="qwen2.5-0.5b-instruct-q4_k_m.gguf",

	filename = "gemma-3-4b-it-q4_0.gguf"
	n_gpu_layers = 0
	n_ctx = 8192
	stop = ["</s>"]
	max_tokens = 8192

	llm = Llama.from_pretrained(
		repo_id=model_path,
		filename=filename,
		n_gpu_layers=n_gpu_layers,
		n_ctx=n_ctx,
	)

	response = llm(prompt, stop=stop, max_tokens=max_tokens)
	text = response["choices"][0]["text"].strip()
	parsed = None
	try:

		json_block = extract_json_block(text)
		parsed = json.loads(json_block)
		json_str = json.dumps(parsed, indent=2)
	except json.JSONDecodeError as e:
		print("Failed to parse model output:")
		# For debugging, show a few lines around the error
		lines = text.splitlines()
		line_no = e.lineno
		snippet = "\n".join(lines[max(0, line_no-3):line_no+2])
		raise ValueError(f"Error near line {line_no}:\n{snippet}")

	return {"parsed": parsed, "json_str": json_str}


def fake_run_llm(model_path: str, prompt: str) -> dict:
	# This is a stub function for testing without an actual LLM
	text = "{\n  \"Health Plan\": \"UPMC Health Insurance\",\n  \"Provider Information - Requesting Provider Name and NPI#\": \"Emily Carter, MD\",\n  \"Provider Information - Contact Person (Name)\": \"Sarah Jones\",\n  \"Member Information - Patient Name\": \"John A. Doe\",\n  \"Member Information - Address\": \"123 Main Street, Denver, CO 80202\",\n  \"Health Plan Fax #\": \"303-555-1212\",\n  \"Date Form Completed and Faxed\": \"2025-01-19\",\n  \"Check Box: Ambulatory/Outpatient Services - Surgery/Procedure (SDC)\": false,\n  \"Check Box: Ambulatory/Outpatient Services - Infusion or Oncology Drugs\": false,\n  \"Check Box: Ancillary - Acupuncture\": false,\n  \"Check Box: Ancillary - Chiropractic\": false,\n  \"Check Box: Ancillary - IVF/ART\": false,\n  \"Check Box: Ancillary - Non-Participating Specialist\": false,\n  \"Check Box: Dental - Adjunctive Dental Services\": false,\n  \"Check Box: Dental - Endodontics\": false,\n  \"Check Box: Dental - Maxillofacial Prosthetics\": false,\n  \"Check Box: Dental - Oral Surgery\": false,\n  \"Check Box: Dental - Restorative\": false,\n  \"Check Box: Durable Medical Equipment - Prosthetic Device\": false,\n  \"Check Box: Durable Medical Equipment - Purchase\": false,\n  \"Check Box: Durable Medical Equipment - Renal Supplies\": false,\n  \"Check Box: Durable Medical Equipment - Rental\": false,\n  \"Check Box: Home Health - SN, PT, OT, ST, HHA, MSW\": false,\n  \"Check Box: Home Health - Hospice\": false,\n  \"Check Box: Home Health - Infusion Therapy\": false,\n  \"Check Box: Home Health - Respite Care\": false,\n  \"Check Box: Inpatient Care/Observation - Acute Medical/Surgical\": false,\n  \"Check Box: Inpatient Care/Observation - Long Term Acute Care\": false,\n  \"Check Box: Inpatient Care/Observation - Acute Rehab\": false,\n  \"Check Box: Inpatient Care/Observation - Skilled Nursing Facility\": false,\n  \"Check Box: Inpatient Care/Observation - Observation\": false,\n  \"Check Box: Nutrition/Counseling - Counseling\": false,\n  \"Check Box: Nutrition/Counseling - Enteral Nutrition\": false,\n  \"Check Box: Nutrition/Counseling - Infant Formula\": false,\n  \"Check Box: Nutrition/Counseling - Total Parental Nutrition\": false,\n  \"Check Box: Outpatient Therapy - Occupational Therapy\": false,\n  \"Check Box: Outpatient Therapy - Physical Therapy\": false,\n  \"Check Box: Outpatient Therapy - Pulmonary/Cardiac Rehab\": false,\n  \"Check Box: Outpatient Therapy - Speech Therapy\": false,\n  \"Check Box: Transportation - Non-emergent Ground\": false,\n  \"Check Box: Transportation - Non-emergent Air\": false,\n  \"Check Box: Other - Checkbox\": false,\n  \"Text: Other - please specify\": \"\",\n  \"Text: Provider Information - Requesting Provider Phone\": \"303-555-0100\",\n  \"Text: Provider Information - Requesting Provider Fax\": \"303-555-1212\",\n  \"Text: Provider Information - Servicing Provider Name and NPI# (and Tax ID if required)\": \"Emily Carter, MD, NPI: 1295847603\",\n  \"Check Box: Provider Information - Servicing Provider Name and NPI# (and Tax ID if required), Same as Requesting Provider\": true,\n  \"Text: Provider Information - Servicing Provider Phone\": \"\",\n  \"Text: Provider Information - Servicing Provider Fax\": \"\",\n  \"Provider Information - Servicing Facility Name and NPI#\": \"Riverside Family Medicine Clinic, NPI: 987654321\",\n  \"Text: Provider Information - Servicing Facility Name Phone\": \"\",\n  \"Text: Provider Information - Servicing Facility Name Fax\": \"\",\n  \"Text: Provider Information - Contact Person Phone\": \"303-555-0101\",\n  \"Text: Provider Information - Contact Person Fax\": \"\",\n  \"Check Box: Member Information - Male\": false,\n  \"Check Box: Member Information - Female\": true,\n  \"Text: Member Information - DOB\": \"03/14/1985\",\n  \"Text: Member Information - Health Insurance ID\": \"1234567890\",\n  \"Text: Member Information - If other insurance, please specify\": \"\",\n  \"Text: Member Information - Patient Account/Control Number\": \"9876543210\",\n  \"Text: Member Information - Phone\": \"303-555-0100\",\n  \"Text: Diagnosis/Planned Procedure Information - Principal Diagnosis Description\": \"Viral upper respiratory infection\",\n  \"Text: Diagnosis/Planned Procedure Information - Principal Diagnosis Description, ICD-10 Codes\": \"J069\",\n  \"Text: Diagnosis/Planned Procedure Information - Principal Planned Procedure (Description and CPT/HCPCS Code)\": \"Persistent cough\",\n  \"Check Box:  Diagnosis/Planned Procedure Information - Principal Planned Procedure, # of Units Being Requested, Hours\": false,\n  \"Check Box:  Diagnosis/Planned Procedure Information - Principal Planned Procedure, # of Units Being Requested, Days\": false,\n  \"Check Box:  Diagnosis/Planned Procedure Information - Principal Planned Procedure, # of Units Being Requested, Months\": false,\n  \"Check Box:  Diagnosis/Planned Procedure Information - Principal Planned Procedure, # of Units Being Requested, Visits\": false,\n  \"Check Box:  Diagnosis/Planned Procedure Information - Principal Planned Procedure, # of Units Being Requested, Dosage\": false,\n  \"Text: Diagnosis/Planned Procedure Information - Secondary Diagnosis Description\": \"\",\n  \"Text: Diagnosis/Planned Procedure Information - Secondary Diagnosis Description, ICD-10 Codes\": \"\",\n  \"Text: Diagnosis/Planned Procedure Information - Secondary Planned Procedure (Description and CPT/HCPCS Code)\": \"\",\n  \"Check Box: Diagnosis/Planned Procedure Information - Secondary Planned Procedure, # of Units Being Requested, Hours\": false,\n  \"Check Box: Diagnosis/Planned Procedure Information - Secondary Planned Procedure, # of Units Being Requested, Days\": false,\n  \"Check Box: Diagnosis/Planned Procedure Information - Secondary Planned Procedure, # of Units Being Requested, Months\": false,\n  \"Check Box: Diagnosis/Planned Procedure Information - Secondary Planned Procedure, # of Units Being Requested, Visits\": false,\n  \"Check Box: Diagnosis/Planned Procedure Information - Secondary Planned Procedure, # of Units Being Requested, Dosage\": false,\n  \"Text: Diagnosis/Planned Procedure Information - Service Start Date\": \"2025-01-19\",\n  \"Text: Diagnosis/Planned Procedure Information - Service End Date\": \"2025-02-19\",\n  \"Check Box: Provider Information - Servicing Facility Name and NPI#, Same as Requesting Provider\": true,\n  \"Clear Form: Clear Form\": false\n}"

	parsed = None
	try:
		json_block = extract_json_block(text)
		parsed = json.loads(json_block)
		json_str = json.dumps(parsed)
	except json.JSONDecodeError as e:
		print("Failed to parse model output:")
		# For debugging, show a few lines around the error
		lines = text.splitlines()
		line_no = e.lineno
		snippet = "\n".join(lines[max(0, line_no-3):line_no+2])
		raise ValueError(f"Error near line {line_no}:\n{snippet}")

	return {"parsed": parsed, "json_str": json_str}