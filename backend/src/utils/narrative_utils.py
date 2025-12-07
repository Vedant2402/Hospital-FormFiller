from src.models.form_dataclass import patientForm

SYSTEM_INSTRUCTION_OLD = """
You are a form-filling assistant. Your task is to read a user-provided narrative and output a JSON object containing values for a PDF form. The form has a fixed list of possible fields, provided as {FIELDS}. You must only include fields from this list and do not add or invent any fields not explicitly listed. Each field is one of two types: Text, which expects a string value, or Check Box, which expects a boolean value (true if checked, false otherwise). Follow these guidelines: use only fields explicitly listed in {FIELDS} and exclude all others even if relevant; include only values clearly stated by the narrative and do not guess or fabricate data; if a field’s value is missing or not implied, omit it entirely from the JSON output; for Text fields, use the exact language or details from the narrative, cleaning formatting only if necessary; for Check Box fields, set to true only if the narrative clearly indicates it should be checked, otherwise set to false; for ICD-10, CPT, or HCPCS codes, include codes only if the form explicitly has fields for them, append codes appropriately in combined description/code fields, and use only standard medically accepted mappings. Output a valid JSON object with keys exactly matching the field names in {FIELDS} and do not include comments, explanations, or extra text — only JSON.
"""

SYSTEM_INSTRUCTION = """
You are a form-filling assistant. Your task is to output a JSON object containing values for a PDF form. 
The form has a fixed list of possible fields, provided as {FIELDS}. Some fields may include additional semantic context derived from similar past patient records. You can use this context to better understand what text or symptoms usually map to a field. 
Each field is one of two types: Text, which expects a string value, or Check Box, which expects a boolean value (true if checked, false otherwise). 

Follow these guidelines:
- Ignore any patient narrative; do not use any external text beyond the provided semantic context.
- You must only include fields from this list and do not add or invent any fields not explicitly listed.
- Include only values clearly indicated by the semantic context; do not guess or fabricate data.
- For ICD-10, CPT, or HCPCS codes, include codes only if the form explicitly has fields for them, append codes appropriately in combined description/code fields, and use only standard medically accepted mappings.
- Semantic context is **optional guidance**: use it only to interpret each field and never to invent or add data not present in the context.

Output a valid JSON object with keys exactly matching the field names in {FIELDS}
- Do not include any comments, explanations, or extra text — only JSON.

USE THIS CONTEXT TO FILL THE FORM FIELDS:
{NARRATIVE}
"""


def build_narrative(form: patientForm) -> str:
    narrative = f"The patient name is {form.name}. They are {form.age} years old. "
    narrative += "The patient is experiencing the following symptoms: " + ", ".join(form.symptoms) + ". "
    if form.diagnosis:
        narrative += f"The diagnosis is {form.diagnosis}. "
    if form.treatment_plan:
        narrative += f"The treatment plan includes {form.treatment_plan}. "
        
    return narrative

def build_prompt(narrative: str, fields: dict) -> str:
    field_block = "\n".join(f'"{field}"' for field in fields)
    system_text = SYSTEM_INSTRUCTION.format(
        FIELDS=field_block,
        NARRATIVE=narrative
    )
    prompt = f"[INST] <<SYS>>{system_text}<</SYS>>\n{narrative}\n[/INST]"
    return prompt
