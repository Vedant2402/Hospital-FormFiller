import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Mail, MessageSquare, Copy, Home } from 'lucide-react';

const ConfirmationPage = () => {
  const location = useLocation();
  const { patientId, email, phoneNumber } = location.state || {};

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (!patientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-primary-50 flex items-center justify-center py-12 px-4">
        <div className="card max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Data Found</h2>
          <p className="text-gray-600 mb-6">Please submit the patient form first.</p>
          <Link to="/patient-form" className="btn-secondary">
            Go to Patient Form
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Card */}
        <div className="card text-center">
          {/* Success Icon */}
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Form Submitted Successfully!
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for submitting your patient information. Your form has been securely stored in our system.
          </p>

          {/* Patient ID Display */}
          <div className="bg-gradient-to-r from-medical-50 to-primary-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Patient ID</h3>
            <div className="bg-white rounded-lg p-4 border-2 border-dashed border-medical-300">
              <div className="flex items-center justify-center space-x-3">
                <span className="text-3xl font-bold text-medical-600 font-mono tracking-wider">
                  {patientId}
                </span>
                <button
                  onClick={() => copyToClipboard(patientId)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  title="Copy to clipboard"
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Please save this ID safely. You'll need it for future reference.
            </p>
          </div>

          {/* Notification Status */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Confirmation Sent</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Email Confirmation</p>
                    <p className="text-sm text-gray-600">{email}</p>
                  </div>
                </div>
                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Sent
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">SMS Confirmation</p>
                    <p className="text-sm text-gray-600">{phoneNumber}</p>
                  </div>
                </div>
                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Sent
                </div>
              </div>
            </div>
          </div>

          {/* Important Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h4 className="text-lg font-semibold text-yellow-800 mb-3">Important Instructions</h4>
            <ul className="text-left text-yellow-700 space-y-2">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Keep your Patient ID safe and accessible</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Bring your Patient ID to all medical appointments</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Check your email and SMS for the confirmation message</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span>Contact your healthcare provider if you need to update any information</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/"
              className="btn-primary flex items-center justify-center"
            >
              <Home className="h-5 w-5 mr-2" />
              Return to Home
            </Link>
            <button
              onClick={() => window.print()}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Print Confirmation
            </button>
          </div>
        </div>

        {/* Additional Support Info */}
        <div className="text-center mt-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h4>
            <p className="text-gray-600 mb-4">
              If you have any questions or need to update your information, please contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <div className="flex items-center justify-center">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                <span>support@medicare-portal.com</span>
              </div>
              <div className="flex items-center justify-center">
                <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                <span>+1 (555) 123-HELP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;