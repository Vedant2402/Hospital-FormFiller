import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, UserPlus, Shield, Heart } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-medical-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MediCare Portal</h1>
                <p className="text-sm text-gray-600">Digital Healthcare Management</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-primary-600">MediCare Portal</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Streamlined healthcare management system for patients and medical professionals. 
            Submit forms, manage records, and access patient information securely.
          </p>
          
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="flex flex-col items-center p-6">
              <div className="bg-primary-100 p-4 rounded-full mb-4">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600 text-center">Your medical information is protected with enterprise-grade security</p>
            </div>
            <div className="flex flex-col items-center p-6">
              <div className="bg-medical-100 p-4 rounded-full mb-4">
                <Heart className="h-8 w-8 text-medical-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Patient-Centered</h3>
              <p className="text-gray-600 text-center">Designed with patient care and convenience as our top priority</p>
            </div>
            <div className="flex flex-col items-center p-6">
              <div className="bg-green-100 p-4 rounded-full mb-4">
                <UserPlus className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Access</h3>
              <p className="text-gray-600 text-center">Simple and intuitive interface for all users</p>
            </div>
          </div>
        </div>

        {/* Login Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Doctor Login Card */}
          <div className="card hover:shadow-xl transition-shadow duration-300">
            <div className="text-center">
              <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Stethoscope className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Doctor Portal</h3>
              <p className="text-gray-600 mb-8">
                Access patient records, manage forms, and view medical histories. 
                Secure login for healthcare professionals.
              </p>
              <ul className="text-left text-gray-600 mb-8 space-y-2">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                  Search patients by ID, email, or phone
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                  Edit and update patient forms
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                  View comprehensive patient records
                </li>
              </ul>
              <button
                onClick={() => navigate('/doctor-login')}
                className="btn-primary w-full"
              >
                Doctor Login
              </button>
            </div>
          </div>

          {/* Patient Form Card */}
          <div className="card hover:shadow-xl transition-shadow duration-300">
            <div className="text-center">
              <div className="bg-medical-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserPlus className="h-10 w-10 text-medical-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Patient Registration</h3>
              <p className="text-gray-600 mb-8">
                Submit your medical information and receive a unique patient ID. 
                Quick and secure form submission.
              </p>
              <ul className="text-left text-gray-600 mb-8 space-y-2">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-medical-600 rounded-full mr-3"></div>
                  Fill out comprehensive medical form
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-medical-600 rounded-full mr-3"></div>
                  Receive unique 9-digit patient ID
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-medical-600 rounded-full mr-3"></div>
                  Email and SMS confirmation
                </li>
              </ul>
              <button
                onClick={() => navigate('/patient-form')}
                className="btn-secondary w-full"
              >
                Submit Patient Form
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-16">
          <div className="bg-gray-50 rounded-xl p-8 max-w-3xl mx-auto">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h4>
            <p className="text-gray-600 mb-4">
              If you're a patient and need to access your information, please contact your healthcare provider 
              with your 9-digit Patient ID.
            </p>
            <p className="text-sm text-gray-500">
              For technical support or questions about this portal, please contact our IT support team.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Stethoscope className="h-6 w-6 mr-2" />
            <span className="font-semibold">MediCare Portal</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2025 MediCare Portal. All rights reserved. | Secure Healthcare Management System
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;