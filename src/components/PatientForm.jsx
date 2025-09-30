import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { generatePatientId } from '../utils/patientId';
import { sendEmailNotification, sendSMSNotification } from '../utils/notifications';
import { User, Mail, Phone, MapPin, FileText, Calendar, Users, Mic, MicOff } from 'lucide-react';

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

  // Voice input state
  const recognitionRef = useRef(null);
  const [listeningField, setListeningField] = useState(null);

  const speak = (text) => {
    try {
      if (window && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      /* no-op: speech synthesis not available */
    }
  };

  const normalizeTranscript = (field, raw) => {
    const value = (raw || '').trim();
    switch (field) {
      case 'age': {
        const match = value.match(/\d{1,3}/);
        return match ? match[0] : '';
      }
      case 'gender': {
        const v = value.toLowerCase();
        if (v.includes('female') || v.includes('femail') || v.includes('women') || v.includes('woman')) return 'female';
        if (v.includes('male') || v.includes('mail') || v.includes('man') || v.includes('men')) return 'male';
        if (v.includes('other')) return 'other';
        if (v.includes('prefer') || v.includes('not') || v.includes('say')) return 'prefer-not-to-say';
        return '';
      }
      case 'email': {
        // common voice substitutions
        let s = value.toLowerCase();
        s = s.replace(/\s+at\s+/g, '@').replace(/\s+at$/g, '@').replace(/^at\s+/g, '@');
        s = s.replace(/\s+dot\s+/g, '.');
        s = s.replace(/\s+/g, '');
        return s;
      }
      case 'phoneNumber': {
        // keep + and digits only
        const s = value.replace(/[^+\d]/g, '');
        return s;
      }
      case 'address':
      case 'medicalHistory':
      case 'name':
      default:
        return value;
    }
  };

  const startVoice = (field) => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Voice input is not supported in this browser.');
        return;
      }
      // Stop any existing recognition
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* no-op */ }
      }
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      setListeningField(field);

      if (field === 'name') {
        speak('Please say your full name');
      }

      let finalTranscript = '';
      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interim += transcript;
          }
        }
        const raw = finalTranscript || interim;
        if (raw) {
          const normalized = normalizeTranscript(field, raw);
          if (normalized || field !== 'gender') {
            setFormData((prev) => ({ ...prev, [field]: normalized }));
          }
        }
      };

      recognition.onerror = () => {
        setListeningField(null);
      };
      recognition.onend = () => {
        setListeningField(null);
      };

      recognition.start();
    } catch {
      setListeningField(null);
    }
  };

  const stopVoice = () => {
    try {
      if (recognitionRef.current) recognitionRef.current.stop();
    } catch { /* no-op */ }
    setListeningField(null);
  };

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
  } else if (!/^\+?[\d\s\-()]{10,}$/.test(formData.phoneNumber)) {
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

      // Navigate to confirmation page with patient ID as route param; still pass state for convenience
      navigate(`/confirmation/${patientId}`, { 
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
                  <div className="relative">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`form-input pr-12 ${errors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="Enter your full name"
                    />
                    <button
                      type="button"
                      onClick={() => (listeningField === 'name' ? stopVoice() : startVoice('name'))}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md ${listeningField === 'name' ? 'text-red-600 bg-red-50 animate-pulse' : 'text-gray-500 hover:text-gray-700 bg-white/60'}`}
                      title={listeningField === 'name' ? 'Stop listening' : 'Speak your name'}
                      aria-label="Voice input for name"
                    >
                      {listeningField === 'name' ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
                  </div>
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
                      className={`form-input pl-10 pr-12 ${errors.age ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="Age"
                    />
                    <button
                      type="button"
                      onClick={() => (listeningField === 'age' ? stopVoice() : startVoice('age'))}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md ${listeningField === 'age' ? 'text-red-600 bg-red-50 animate-pulse' : 'text-gray-500 hover:text-gray-700 bg-white/60'}`}
                      aria-label="Voice input for age"
                    >
                      {listeningField === 'age' ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
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
                      className={`form-input pl-10 pr-12 ${errors.gender ? 'border-red-300 focus:ring-red-500' : ''}`}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => (listeningField === 'gender' ? stopVoice() : startVoice('gender'))}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md ${listeningField === 'gender' ? 'text-red-600 bg-red-50 animate-pulse' : 'text-gray-500 hover:text-gray-700 bg-white/60'}`}
                      aria-label="Voice input for gender"
                    >
                      {listeningField === 'gender' ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
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
                      className={`form-input pl-10 pr-12 resize-none ${errors.address ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="Enter your complete address"
                    />
                    <button
                      type="button"
                      onClick={() => (listeningField === 'address' ? stopVoice() : startVoice('address'))}
                      className={`absolute right-3 top-3 p-1.5 rounded-md ${listeningField === 'address' ? 'text-red-600 bg-red-50 animate-pulse' : 'text-gray-500 hover:text-gray-700 bg-white/60'}`}
                      aria-label="Voice input for address"
                    >
                      {listeningField === 'address' ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
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
                      className={`form-input pl-10 pr-12 ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="your.email@example.com"
                    />
                    <button
                      type="button"
                      onClick={() => (listeningField === 'email' ? stopVoice() : startVoice('email'))}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md ${listeningField === 'email' ? 'text-red-600 bg-red-50 animate-pulse' : 'text-gray-500 hover:text-gray-700 bg-white/60'}`}
                      aria-label="Voice input for email"
                    >
                      {listeningField === 'email' ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
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
                      className={`form-input pl-10 pr-12 ${errors.phoneNumber ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="+1 (555) 123-4567"
                    />
                    <button
                      type="button"
                      onClick={() => (listeningField === 'phoneNumber' ? stopVoice() : startVoice('phoneNumber'))}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md ${listeningField === 'phoneNumber' ? 'text-red-600 bg-red-50 animate-pulse' : 'text-gray-500 hover:text-gray-700 bg-white/60'}`}
                      aria-label="Voice input for phone number"
                    >
                      {listeningField === 'phoneNumber' ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
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
                <div className="relative">
                <textarea
                  id="medicalHistory"
                  name="medicalHistory"
                  rows="4"
                  value={formData.medicalHistory}
                  onChange={handleInputChange}
                  className="form-input resize-none pr-12"
                  placeholder="Please describe any relevant medical history, current medications, allergies, or conditions..."
                />
                <button
                  type="button"
                  onClick={() => (listeningField === 'medicalHistory' ? stopVoice() : startVoice('medicalHistory'))}
                  className={`absolute right-3 top-3 p-1.5 rounded-md ${listeningField === 'medicalHistory' ? 'text-red-600 bg-red-50 animate-pulse' : 'text-gray-500 hover:text-gray-700 bg-white/60'}`}
                  aria-label="Voice input for medical history"
                >
                  {listeningField === 'medicalHistory' ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                </div>
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
  );
};

export default PatientForm;