import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import PatientFormPage from './components/PatientFormPage';
import ConfirmationPage from './components/ConfirmationPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Simplified Public Routes (only patient flow) */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/patient-form" element={<PatientFormPage />} />
          <Route path="/confirmation/:id?" element={<ConfirmationPage />} />
          {/* Catch all route -> redirect to patient form */}
          <Route path="*" element={<Navigate to="/patient-form" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;