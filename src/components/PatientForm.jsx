import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Users,
  Mic,
  MicOff,
  FileUp,
  Loader2,
} from "lucide-react";

const baseUrl = "api/pdf/";
const uploadAndExtractUrl = baseUrl + "upload_and_extract";
// const submitFormUrl = baseUrl + "form/submit";

const PatientForm = () => {
  const [loading, setLoading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadError, setUploadError] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [isPDFImported, setIsPDFImported] = useState(false);
  const [fileName, setFileName] = useState("");

  // Voice input state
  // const recognitionRef = useRef(null);
  const pdfInputRef = useRef(null);

  // const normalizeTranscript = (field, raw) => {
  //   const value = (raw || "").trim();
  //   switch (field) {
  //     case "age": {
  //       const match = value.match(/\d{1,3}/);
  //       return match ? match[0] : "";
  //     }
  //     case "gender": {
  //       const v = value.toLowerCase();
  //       if (
  //         v.includes("female") ||
  //         v.includes("femail") ||
  //         v.includes("women") ||
  //         v.includes("woman")
  //       )
  //         return "female";
  //       if (
  //         v.includes("male") ||
  //         v.includes("mail") ||
  //         v.includes("man") ||
  //         v.includes("men")
  //       )
  //         return "male";
  //       if (v.includes("other")) return "other";
  //       if (v.includes("prefer") || v.includes("not") || v.includes("say"))
  //         return "prefer-not-to-say";
  //       return "";
  //     }
  //     case "email": {
  //       // common voice substitutions
  //       let s = value.toLowerCase();
  //       s = s
  //         .replace(/\s+at\s+/g, "@")
  //         .replace(/\s+at$/g, "@")
  //         .replace(/^at\s+/g, "@");
  //       s = s.replace(/\s+dot\s+/g, ".");
  //       s = s.replace(/\s+/g, "");
  //       return s;
  //     }
  //     case "phoneNumber": {
  //       // keep + and digits only
  //       const s = value.replace(/[^+\d]/g, "");
  //       return s;
  //     }
  //     case "address":
  //     case "medicalHistory":
  //     case "name":
  //     default:
  //       return value;
  //   }
  // };

  // const startVoice = (field) => {
  //   try {
  //     const SpeechRecognition =
  //       window.SpeechRecognition || window.webkitSpeechRecognition;
  //     if (!SpeechRecognition) {
  //       alert("Voice input is not supported in this browser.");
  //       return;
  //     }
  //     // Stop any existing recognition
  //     if (recognitionRef.current) {
  //       try {
  //         recognitionRef.current.stop();
  //       } catch {
  //         /* no-op */
  //       }
  //     }
  //     const recognition = new SpeechRecognition();
  //     recognitionRef.current = recognition;
  //     recognition.lang = "en-US";
  //     recognition.interimResults = true;
  //     recognition.maxAlternatives = 1;
  //     setListeningField(field);

  //     if (field === "name") {
  //       speak("Please say your full name");
  //     }

  //     let finalTranscript = "";
  //     recognition.onresult = (event) => {
  //       let interim = "";
  //       for (let i = event.resultIndex; i < event.results.length; i++) {
  //         const transcript = event.results[i][0].transcript;
  //         if (event.results[i].isFinal) {
  //           finalTranscript += transcript;
  //         } else {
  //           interim += transcript;
  //         }
  //       }
  //       const raw = finalTranscript || interim;
  //       if (raw) {
  //         const normalized = normalizeTranscript(field, raw);
  //         if (normalized || field !== "gender") {
  //           setFormData((prev) => ({ ...prev, [field]: normalized }));
  //         }
  //       }
  //     };

  //     recognition.onerror = () => {
  //       setListeningField(null);
  //     };
  //     recognition.onend = () => {
  //       setListeningField(null);
  //     };

  //     recognition.start();
  //   } catch {
  //     setListeningField(null);
  //   }
  // };

  // const stopVoice = () => {
  //   try {
  //     if (recognitionRef.current) recognitionRef.current.stop();
  //   } catch {
  //     /* no-op */
  //   }
  //   setListeningField(null);
  // };

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));

  //   // Clear error when user starts typing
  //   if (errors[name]) {
  //     setErrors((prev) => ({
  //       ...prev,
  //       [name]: "",
  //     }));
  //   }
  // };

  const handlePdfUploadClick = () => {
    setUploadError("");
    pdfInputRef.current?.click();
  };

  // API call to upload and extract PDF
  const fetchUploadAndExtract = async (file) => {
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const response = await fetch(uploadAndExtractUrl, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload and extract PDF");
      }
      const data = await response.json();
      return data; // expecting { extracted_text, message, similar_context}
    } catch (err) {
      console.error("PDF upload and extract error:", err);
      throw new Error("Failed to upload and extract PDF");
    }
  };

  const handlePdfSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    setUploadError("");
    try {
      const response = await fetchUploadAndExtract(file);
      if (!response) {
        throw new Error("No response from PDF extraction");
      }
      const { extracted_text } = response;
      setIsPDFImported(true);
      setFileName(file.name);
      sessionStorage.setItem("narrative_text", extracted_text || "");
    } catch (err) {
      console.error("PDF import failed:", err);
      setUploadError(
        "Could not read that PDF. Please ensure it is a clear, text-based scan of the prior auth form."
      );
    } finally {
      setUploadingPdf(false);
      // reset input so same file can be re-selected
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isPDFImported) {
      // naviaget to confirmationPage
      navigate("/confirmation");
      return;
    }
    setLoading(true);
  };

  return (
    <div className="card w-full">
      {/* Hidden PDF input */}
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handlePdfSelected}
      />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="bg-medical-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-medical-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">
          Patient Registration Form
        </h2>
        <p className="text-gray-600 mt-2">
          Please fill out all required information
        </p>

        {/* Import PDF button below description */}
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handlePdfUploadClick}
            disabled={uploadingPdf}
            className="btn-primary flex items-center gap-2 disabled:opacity-60"
            title="Import a Prior Authorization PDF to auto-fill the form"
          >
            {uploadingPdf ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Importing PDF...
              </>
            ) : (
              <>
                <FileUp className="h-5 w-5" />
                Import PDF
              </>
            )}
          </button>
        </div>
      </div>

      {isPDFImported && (
        <div className="relative bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          {/* Close Button */}
          <button
            onClick={() => setIsPDFImported(false)}
            className="absolute top-2 right-2 text-green-600 hover:text-green-800"
          >
            ✕
          </button>

          <p className="text-green-700 text-sm">
            Successfully imported: {fileName}
          </p>
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 text-sm">{uploadError}</p>
        </div>
      )}

      {/* Submit Error */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 text-sm">{errors.submit}</p>
        </div>
      )}

      {/* <div className="mb-6 flex justify-center">
        <span className="flex items-center justify-center w-10 h-10 border border-gray-400 rounded-full text-sm font-medium text-gray-700">
          OR
        </span>
      </div> */}

      <div className="mt-6 p-4">
        <label htmlFor="text-area">Other Information:</label>

        <textarea
          id="text-area"
          name="otherInfo"
          rows="8"
          defaultValue=""
          className="form-textarea mt-2 w-full h-48 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-medical-500 resize-none"
          placeholder="Please provide any additional information that may assist in processing your prior authorization request."
        ></textarea>
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={loading}
          className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Submitting Form...
            </div>
          ) : (
            "Submit Patient Form"
          )}
        </button>
      </div>

      {/* Privacy Notice */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Privacy Notice:</strong> Your information is securely stored
          and will only be accessed by authorized medical personnel. You will
          receive a unique Patient ID via email and SMS for future reference.
        </p>
      </div>
    </div>
  );
};

export default PatientForm;
