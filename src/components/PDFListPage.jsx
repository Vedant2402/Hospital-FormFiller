import React, { useEffect, useState } from "react";
import { fetchAuthTokenAndUid } from "../config/cookies.js";

const PDFListPage = () => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userUid, setUserUid] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const baseUrl = "api/pdf/";
  const getByUidUrl = baseUrl + "user/" + userUid;

  const fetchPdfs = async () => {
    resetError();
    setLoading(true);
    const { uid } = await fetchAuthTokenAndUid();
    setUserUid(uid);
    try {
      const response = await fetch(getByUidUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch PDFs");
      }
      const data = await response.json();
      setPdfs(data.pdfs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const pdfData = sessionStorage.getItem("pdf");
    if (pdfData && pdfData !== "undefined") {
      setSelectedFile(JSON.parse(pdfData));
    }
    fetchPdfs();
  }, [getByUidUrl]);

  const handleUpload = async (file) => {
    resetError();
    try {
      const { uid: user_uid } = fetchAuthTokenAndUid();
      if (!user_uid) {
        setError("User not authenticated");
        return;
      }

      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("user_uid", user_uid);

      const response = await fetch(`${baseUrl}upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload PDF");
      }

      const { message } = await response.json();
      console.log("Upload success:", message);

      // Refresh PDF list after upload
      await fetchPdfs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    resetError();
    try {
      const response = await fetch(baseUrl + id, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete PDF");
      }
      // Remove deleted PDF from state
      setPdfs(pdfs.filter((pdf) => pdf.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDropdownChange = (e) => {
    const pdfData = pdfs.find((pdf) => pdf.id === parseInt(e.target.value));
    setSelectedFile(pdfData);
    sessionStorage.setItem("pdf", JSON.stringify(pdfData));
  };

  const resetError = () => {
    setError(null);
  };

  if (loading) {
    return <div className="text-blue-500">Docs are loading...</div>;
  }

  // if (error) {
  //   return <div className="text-red-500">Error: {error}</div>;
  // }

  return (
    <div className="pdf-list-page glass-card p-4">
      <div className="mb-4">
        <input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files[0])}
        />

        <label
          htmlFor="pdf-upload"
          className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition inline-flex items-center gap-2"
        >
          📄 Upload PDF
        </label>
      </div>
      {error ? <div className="text-red-500 mb-4">Error: {error}</div> : null}

      {pdfs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-600">
          <p>No PDFs found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-300 shadow-sm">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-gray-200">
              <tr className="text-left">
                <th className="p-3">ID</th>
                <th className="p-3">Filename</th>
                <th className="p-3">Created At</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            {/* striped rows */}
            <tbody className="divide-y divide-gray-200">
              {pdfs.map((pdf, index) => (
                <tr
                  key={pdf.id}
                  className={
                    index % 2 === 0
                      ? "bg-white hover:bg-gray-50"
                      : "bg-gray-50 hover:bg-gray-100"
                  }
                >
                  <td className="p-3">{pdf.id}</td>
                  <td className="p-3">{pdf.filename}</td>
                  <td className="p-3">
                    {new Date(pdf.created_at).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(pdf.id)}
                      className="px-3 py-1 text-sm text-white bg-red-500 hover:bg-red-600 rounded-md shadow"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pdfs.length === 0 ? null : (
        <div className="mb-4 mt-6 flex items-center">
          <label htmlFor="pdf-dropdown" className="mr-2">
            Select Form to start filling:
          </label>
          <select
            id="pdf-dropdown"
            value={selectedFile?.id || ""}
            onChange={handleDropdownChange}
            className="px-3 py-1 border rounded-md"
          >
            <option value="">--Select File ID--</option>
            {pdfs.map((pdf) => (
              <option key={pdf.id} value={pdf.id}>
                {pdf.id}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default PDFListPage;
