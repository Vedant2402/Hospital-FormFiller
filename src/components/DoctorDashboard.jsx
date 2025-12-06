import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Stethoscope,
  LogOut,
  FileSearch,
  ArrowRight,
  Download,
  BarChart3,
  CalendarClock,
  ShieldCheck,
  Home,
} from "lucide-react";
import PDFListPage from "./PDFListPage.jsx";
import { fetchAuthTokenAndUid } from "../config/cookies.js";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const { authToken: token } = fetchAuthTokenAndUid();

    if (!token) {
      navigate("/doctor-login", { replace: true });
    }
  }, []);

  const logout = () => {
    resetError();
    // clear cookies
    document.cookie =
      "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "uid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // clear session storage
    sessionStorage.clear();

    navigate("/doctor-login", { replace: true });
  };

  const handleNavigateToPatientForm = () => {
    resetError();
    const pdfData = sessionStorage.getItem("pdf");
    if (pdfData && pdfData !== "undefined") {
      setSelectedFile(JSON.parse(pdfData));
      navigate("/patient-form");
    } else {
      setError("Please select a form from the dropdown to proceed.");
    }
  };

  const resetError = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen animated-gradient p-4 pt-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="glass-card flex items-center justify-between mb-6 anim-fade-in">
          <div className="flex items-center">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-primary-100 mr-3 shadow-inner">
              <Stethoscope className="h-7 w-7 text-primary-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="glass-button px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg inline-flex items-center gap-2"
            >
              <Home className="h-5 w-5" /> Home
            </Link>
            <button
              onClick={logout}
              className="glass-button px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg inline-flex items-center gap-2"
            >
              <LogOut className="h-5 w-5" /> Log Out
            </button>
          </div>
        </div>

        {/* PDF List Page */}
        <div>
          <PDFListPage></PDFListPage>
        </div>

        <div className="glass-card anim-fade-in">
          <div className="flex items-center justify-center mb-4">
            <button
              onClick={handleNavigateToPatientForm}
              className="btn-primary inline-flex items-center gap-2"
            >
              <ArrowRight className="h-5 w-5" />
              Proceed to Patient Form
            </button>
          </div>
          {error && (
            <div className="text-red-500 text-center mb-4">{error}</div>
          )}
          <div className="text-center">
            {/* <Link to="/patient-form" className="btn-secondary">
              New Pre-Auth
            </Link> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
