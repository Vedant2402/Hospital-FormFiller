import React, { useState, useEffect } from "react";
import FormPreview from "./FormPreview";

const llmUrl = "api/llm/run";
const getDownloadUrl = (id) => `api/pdf/${id}/fill`;

const ConfirmationPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [llmData, setLlmData] = useState(null);
  const [entries, setEntries] = useState([]);
  const [id, setId] = useState(null);

  const fetchLLMData = async () => {
    setLoading(true);
    setError(null);

    try {
      const narrative = sessionStorage.getItem("narrative_text");
      const pdfRaw = sessionStorage.getItem("pdf");
      const pdf = pdfRaw ? JSON.parse(pdfRaw) : null;

      const fields = pdf?.fields_json ? JSON.parse(pdf.fields_json) : [];

      if (!narrative) {
        setError("No narrative text found");
        throw new Error("No narrative text found");
      }

      const requestBody = {
        narrative,
        fields,
      };

      const response = await fetch(llmUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        setError("Failed to fetch LLM data");
        throw new Error("Failed to fetch LLM data");
      }
      const data = await response.json();
      const json_strRaw = data.result.json_str;
      // const parsed = data.result.parsed;

      const json_str = JSON.parse(json_strRaw);

      if (!json_str || Object.keys(json_str).length === 0) {
        setError("No LLM data found");
        throw new Error("No LLM data found");
      }
      const entries = Object.entries(json_str);

      setLlmData(json_str);
      setEntries(entries);
      setLoading(false);
      sessionStorage.setItem("llm_data", JSON.stringify(llmData));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetcDownload = async () => {
    try {
      const downloadUrl = getDownloadUrl(id);
      const response = await fetch(downloadUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          field_values: JSON.stringify(Object.fromEntries(entries)),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch filled document");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "filled_document.pdf");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (key, newValue) => {
    const updatedEntries = entries.map(([k, v]) =>
      k === key ? [k, newValue] : [k, v]
    );

    setEntries(updatedEntries);

    // Save updated data to sessionStorage
    const updatedObj = Object.fromEntries(updatedEntries);
    sessionStorage.setItem("llm_data", JSON.stringify(updatedObj));
  };

  useEffect(() => {
    const pdfRaw = sessionStorage.getItem("pdf");
    const pdf = pdfRaw ? JSON.parse(pdfRaw) : null;
    if (pdf && pdf.id) {
      setId(pdf.id);
    }

    fetchLLMData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500"></div>
        <p className="text-gray-600 text-sm">
          Running AI... this may take 2–3 minutes.
        </p>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold mb-4">Review and Confirm</h2>
        <p className="text-gray-600 mb-6">
          Please review the extracted information below. You can make edits
          before downloading the final document.
        </p>
      </div>
      <FormPreview entries={entries} onChange={handleChange} />
      <div className="mt-6 text-sm text-gray-600 justify-center flex">
        <button
          className="mt-6 mb-6 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={fetcDownload}
        >
          Download
        </button>
      </div>
    </>
  );
};

export default ConfirmationPage;
