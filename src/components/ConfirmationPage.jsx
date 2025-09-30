import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { CircleCheck as CheckCircle } from 'lucide-react';

const ConfirmationPage = () => {
  const location = useLocation();
  const params = useParams();
  const routeId = params.id;
  const { patientId: stateId } = location.state || {};
  const patientId = stateId || routeId;

  // No clipboard interactions in this simplified confirmation view

  if (!patientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-primary-50 flex items-center justify-center py-12 px-4">
        <div className="glass-card max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Data Found</h2>
          <p className="text-gray-600 mb-6">Please submit the patient form first.</p>
          <Link to="/patient-form" className="btn-secondary">Go to Patient Form</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-medical-50 via-white to-primary-50 p-4 pt-16">
      <div className="glass-card w-full max-w-lg text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 mb-4">
          <CheckCircle className="h-10 w-10 text-primary-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900">Submission Successful!</h2>
        <p className="text-gray-600 mt-1">Thank you for providing your information. Your patient record has been created.</p>

        <div className="mt-6 bg-white/70 border border-white/60 rounded-md p-4">
          <p className="text-sm text-gray-600 mb-1">Please keep your Patient ID for future reference:</p>
          <p className="text-2xl font-bold tracking-widest text-gray-900 font-mono">{patientId}</p>
        </div>

        <p className="text-sm text-gray-500 pt-3">
          A confirmation with your Patient ID has been sent to your email and phone (if configured).
        </p>

        <Link to="/" className="btn-primary mt-6 w-full max-w-xs mx-auto inline-flex justify-center">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default ConfirmationPage;