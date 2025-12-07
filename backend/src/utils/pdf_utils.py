from pypdf import PdfReader, PdfWriter
import io

def extract_pdf_field_names(pdf_file) -> list[str]:
    if isinstance(pdf_file, (bytes, bytearray)):
        pdf_stream = io.BytesIO(pdf_file)
    else:
        pdf_stream = pdf_file  # e.g., a file-like object

    reader = PdfReader(pdf_stream)
    fields = reader.get_fields()

    if not fields:
        raise ValueError("No fillable fields found in PDF.")

    return list(fields.keys())

def fill_pdf_form(pdf_file, field_values: dict[str, str]) -> bytes:
    if isinstance(pdf_file, (bytes, bytearray)):
        pdf_stream = io.BytesIO(pdf_file)
    else:
        pdf_stream = pdf_file  # e.g., a file-like object

    reader = PdfReader(pdf_stream)
    writer = PdfWriter()

    try:
        writer.clone_document_from_reader(reader)
    except Exception:
        # Fallback: if clone isn't supported for this reader, copy pages
        for page in reader.pages:
            writer.add_page(page)

    def _normalize_value(v):
        if isinstance(v, bool):
            return "/Yes" if v else "/Off"
        return str(v)

    normalized = {k: _normalize_value(v) for k, v in field_values.items()}

    for page in writer.pages:
        writer.update_page_form_field_values(page, normalized)

    output_stream = io.BytesIO()
    writer.write(output_stream)
    return output_stream.getvalue()


def extract_pdf_text(pdf_file) -> str:
    if isinstance(pdf_file, (bytes, bytearray)):
        pdf_stream = io.BytesIO(pdf_file)
    else:
        pdf_stream = pdf_file  # e.g., a file-like object

    reader = PdfReader(pdf_stream)
    text_content = []

    for page in reader.pages:
        text_content.append(page.extract_text() or "")

    return "\n".join(text_content)