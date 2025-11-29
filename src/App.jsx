import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import PatientFormPage from './components/PatientFormPage';
import ConfirmationPage from './components/ConfirmationPage';
import DoctorLogin from './components/DoctorLogin';
import DoctorDashboard from './components/DoctorDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/patient-form" element={<PatientFormPage />} />
          <Route path="/confirmation/:id?" element={<ConfirmationPage />} />
          <Route path="/doctor-login" element={<DoctorLogin />} />
          <Route path="/doctor" element={
            <ProtectedRoute>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;