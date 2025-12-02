import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// import { useAuthState } from "react-firebase-hooks/auth";
// import { auth } from "./config/firebase";
import LandingPage from "./components/LandingPage";
import DoctorLogin from "./components/DoctorLogin";
import PatientFormPage from "./components/PatientFormPage";
import ConfirmationPage from "./components/ConfirmationPage";
import DoctorDashboard from "./components/DoctorDashboard";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  // const [user, loading] = useAuthState(auth);

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-medical-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  const token = localStorage.getItem("authToken");

  if (!token) {
    return <Navigate to="/doctor-login" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/doctor-login" element={<DoctorLogin />} />
          <Route path="/patient-form" element={<PatientFormPage />} />
          <Route path="/confirmation/:id?" element={<ConfirmationPage />} />

          {/* Protected Routes */}
          <Route
            path="/doctor-dashboard"
            element={
              <ProtectedRoute>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
