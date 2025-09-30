import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { generatePatientId } from '../utils/patientId';
import { sendEmailNotification, sendSMSNotification } from '../utils/notifications';
import { ArrowLeft, User, Mail, Phone, MapPin, FileText, Calendar, Users } from 'lucide-react';

const PatientForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    address: '',
    email: '',
    phoneNumber: '',
    medicalHistory: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.age || formData.age < 1 || formData.age > 150) {
      newErrors.age = 'Please enter a valid age (1-150)';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Generate unique patient ID
      const patientId = generatePatientId();
      
      // Prepare data for Firestore
      const patientData = {
        ...formData,
        patientId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to Firestore
      await addDoc(collection(db, 'patients'), patientData);

      // Send notifications
      try {
        await sendEmailNotification(formData.email, patientId);
        await sendSMSNotification(formData.phoneNumber, patientId);
      } catch (notificationError) {
        console.error('Notification sending failed:', notificationError);
        // Continue even if notifications fail
      }

      // Navigate to confirmation page with patient ID
      navigate('/confirmation', { 
        state: { 
          patientId, 
          email: formData.email,
          phoneNumber: formData.phoneNumber 
        } 
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to submit form. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-medical-600 hover:text-medical-700 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Form Card */}
        <div className="card">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-medical-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-medical-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Patient Registration Form</h2>
            <p className="text-gray-600 mt-2">Please fill out all required information</p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-medical-600" />
                Personal Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="form-label">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`form-input ${errors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="age" className="form-label">
                    Age *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="age"
                      name="age"
                      type="number"
                      required
                      min="1"
                      max="150"
                      value={formData.age}
                      onChange={handleInputChange}
                      className={`form-input pl-10 ${errors.age ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="Age"
                    />
                  </div>
                  {errors.age && <p className="text-red-600 text-sm mt-1">{errors.age}</p>}
                </div>

                <div>
                  <label htmlFor="gender" className="form-label">
                    Gender *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      id="gender"
                      name="gender"
                      required
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`form-input pl-10 ${errors.gender ? 'border-red-300 focus:ring-red-500' : ''}`}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                  {errors.gender && <p className="text-red-600 text-sm mt-1">{errors.gender}</p>}
                </div>

                <div>
                  <label htmlFor="address" className="form-label">
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      id="address"
                      name="address"
                      required
                      rows="3"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`form-input pl-10 resize-none ${errors.address ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="Enter your complete address"
                    />
                  </div>
                  {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-medical-600" />
                Contact Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="form-label">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`form-input pl-10 ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="form-label">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className={`form-input pl-10 ${errors.phoneNumber ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  {errors.phoneNumber && <p className="text-red-600 text-sm mt-1">{errors.phoneNumber}</p>}
                </div>
              </div>
            </div>

            {/* Medical History Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-medical-600" />
                Medical History
              </h3>
              
              <div>
                <label htmlFor="medicalHistory" className="form-label">
                  Medical History (Optional)
                </label>
                <textarea
                  id="medicalHistory"
                  name="medicalHistory"
                  rows="4"
                  value={formData.medicalHistory}
                  onChange={handleInputChange}
                  className="form-input resize-none"
                  placeholder="Please describe any relevant medical history, current medications, allergies, or conditions..."
                />
                <p className="text-sm text-gray-500 mt-2">
                  Include any allergies, current medications, chronic conditions, or previous surgeries.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting Form...
                  </div>
                ) : (
                  'Submit Patient Form'
                )}
              </button>
            </div>
          </form>

          {/* Privacy Notice */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Privacy Notice:</strong> Your information is securely stored and will only be accessed by authorized medical personnel. 
              You will receive a unique Patient ID via email and SMS for future reference.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;