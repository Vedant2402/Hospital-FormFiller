from pypdf import PdfReader, PdfWriter
from llama_cpp import Llama
import json, re, os
from dotenv import load_dotenv

# === IMPORT RAG MODULE ===
from rag_icd import ICDRAG

# === CONFIG ===
PDF_PATH = "HCAS_Standardized_Prior_Authorization_Form_named.pdf"
OUTPUT_PATH = "filled_form.pdf"
MODEL_PATH = "google/gemma-3-4b-it-qat-q4_0-gguf"

NARRATIVE = """
The patient is a 56-year-old male scheduled for outpatient physical therapy after hip surgery.
Requesting provider is Dr. John Smith (NPI 1234567890), phone 555-1212, fax 555-1313.
The diagnosis is postoperative pain and mobility impairment in the hip.
"""

load_dotenv()


# === JSON Extraction ===
def extract_json_block(raw: str) -> dict:
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        raise ValueError("Could not find a JSON object in LLM output.")
    return match.group(0)


# === Extract PDF Fields ===
def extract_pdf_field_names(pdf_path: str) -> list[str]:
    reader = PdfReader(pdf_path)
    fields = reader.get_fields()
    if not fields:
        raise ValueError("No fillable fields found.")
    return list(fields.keys())


# === RAG ICD-10 Retrieval ===
def retrieve_icd_codes(narrative: str) -> list[str]:
    rag = ICDRAG()
    return rag.query(f"ICD-10 codes for: {narrative}", k=5)


# === Prompt Builder ===
SYSTEM_INSTRUCTION = """
You are a form-filling assistant. Output ONLY a JSON object whose keys exactly match the PDF field names.

You MUST NOT invent any ICD-10, CPT, or HCPCS codes.
Use ONLY the ICD-10 codes supplied in the RAG section below.

RAG ICD-10 Data:
{ICD_DATA}

Form fields:
{FIELDS}

Follow rules:
- Use narrative information verbatim
- Do NOT guess missing fields
- Only include fields explicitly in the form
- Checkboxes = true/false
- Text fields = strings
"""

def build_prompt(narrative: str, fields: list[str], icd_data: list[str]) -> str:
    field_block = "\n".join(f'"{f}"' for f in fields)
    icd_block = "\n".join(icd_data)

    return f"""
[INST] <<SYS>>
{SYSTEM_INSTRUCTION.format(FIELDS=field_block, ICD_DATA=icd_block)}
<</SYS>>

NARRATIVE:
{narrative}

Return ONLY JSON.
[/INST]
"""


# === LLM Runner ===
def run_llm(model_path: str, prompt: str) -> dict:
    llm = Llama.from_pretrained(
        repo_id=model_path,
        filename="gemma-3-4b-it-q4_0.gguf",
        n_gpu_layers=0,
        n_ctx=8192,
    )

    response = llm(prompt, stop=["</s>"], max_tokens=4096)
    text = response["choices"][0]["text"].strip()
    return json.loads(extract_json_block(text))


# === PDF Filler ===
def fill_pdf(infile: str, outfile: str, field_data: dict):
    reader = PdfReader(infile)
    writer = PdfWriter()
    writer.clone_document_from_reader(reader)

    for page in writer.pages:
        mapped = {}
        for k, v in field_data.items():
            mapped[k] = "/Yes" if isinstance(v, bool) and v else ("/Off" if isinstance(v, bool) else str(v))
        writer.update_page_form_field_values(page, mapped)

    with open(outfile, "wb") as f:
        writer.write(f)


# === MAIN ===
if __name__ == "__main__":
    # Step 1 — PDF fields
    fields = extract_pdf_field_names(PDF_PATH)

    # Step 2 — get relevant ICD codes
    icd_results = retrieve_icd_codes(NARRATIVE)
    print("Retrieved ICD-10 codes:", icd_results)

    # Step 3 — build LLM prompt including RAG results
    prompt = build_prompt(NARRATIVE, fields, icd_results)

    # Step 4 — run LLM
    field_values = run_llm(MODEL_PATH, prompt)
    print("Generated fields:\n", json.dumps(field_values, indent=2))

    # Step 5 — fill PDF
    fill_pdf(PDF_PATH, OUTPUT_PATH, field_values)
    print(f"Saved: {OUTPUT_PATH}")
