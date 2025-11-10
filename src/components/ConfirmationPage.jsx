import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';

const ConfirmationPage = () => {
  const location = useLocation();
  const { id } = useParams();
  const { patientId: navPatientId } = location.state || {};
  const [record, setRecord] = useState(null);

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem('patients') || '[]');
    const found = all.find(p => p.patientId === (navPatientId || id));
    setRecord(found || null);
  }, [navPatientId, id]);

  // No clipboard interactions in this simplified confirmation view

  if (!record) {
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
            {record && (
              <p className="text-gray-500 text-sm mt-2">Stored locally only. Patient ID: <span className="font-semibold">{record.patientId}</span></p>
            )}

              {record && (
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Patient ID:</span>
                      <span className="font-medium text-gray-900">{record.patientId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-gray-900">{record.personalInfo?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900">{record.contactInfo?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium text-gray-900">{record.contactInfo?.phoneNumber}</span>
                    </div>
                  </div>
                </div>
              )}

        {!record && (
          <p className="text-sm text-gray-500 pt-3">No record data found.</p>
        )}

        <Link to="/" className="btn-primary mt-6 w-full max-w-xs mx-auto inline-flex justify-center">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default ConfirmationPage;