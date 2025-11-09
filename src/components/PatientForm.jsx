import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { generatePatientId } from '../utils/patientId';
import { sendEmailNotification, sendSMSNotification } from '../utils/notifications';
import { User, Mail, Phone, MapPin, FileText, Calendar, Users, Mic, MicOff, Upload, X } from 'lucide-react';

const PatientForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    address: '',
    email: '',
    phoneNumber: '',
    medicalHistory: '',
    // Prior Authorization: Insurance
    healthPlan: '',
    healthPlanFax: '',
    // Prior Authorization: Service Types
    serviceTypes: [], // array of strings
    otherServiceType: '',
    // Prior Authorization: Provider Information
    requestingProviderNameNPI: '',
    requestingProviderPhone: '',
    requestingProviderFax: '',
    servicingProviderNameNPITaxId: '',
    servicingProviderPhone: '',
    servicingProviderFax: '',
    sameAsRequestingProvider: false,
    servicingFacilityNameNPI: '',
    servicingFacilityPhone: '',
    servicingFacilityFax: '',
    sameAsRequestingProviderFacility: false,
    contactPerson: '',
    // Prior Authorization: Member Information
    dob: '',
    healthInsuranceId: '',
    otherInsurance: '',
    patientAccountNumber: '',
    memberAddress: '',
    // Prior Authorization: Diagnosis/Procedure
    principalDiagnosisDescription: '',
    principalDiagnosisICD10: '',
    secondaryDiagnosisDescription: '',
    secondaryDiagnosisICD10: '',
    principalPlannedProcedureDescriptionCPT: '',
    principalUnitsNumber: '',
    principalUnitsType: '', // Hours | Days | Months | Visits | Dosage
    secondaryPlannedProcedureDescriptionCPT: '',
    secondaryUnitsNumber: '',
    secondaryUnitsType: '',
    serviceStartDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Voice input state
  const recognitionRef = useRef(null);
  const [listeningField, setListeningField] = useState(null);

  // PDF upload (UI only)
  const pdfInputRef = useRef(null);
  const [pdfName, setPdfName] = useState('');
  const [pdfError, setPdfError] = useState('');

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

  // ===== PDF Upload (UI only) =====
  const openPdfPicker = () => {
    setPdfError('');
    pdfInputRef.current?.click();
  };

  const onPdfSelected = (e) => {
    setPdfError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setPdfError('Please upload a PDF file (.pdf).');
      setPdfName('');
      return;
    }
    const maxBytes = 25 * 1024 * 1024; // 25 MB limit for UI
    if (file.size > maxBytes) {
      setPdfError('File is too large. Please select a PDF under 25 MB.');
      setPdfName('');
      return;
    }
    setPdfName(file.name);
    // Parsing will be added later; UI only for now.
  };

  const clearPdf = () => {
    setPdfName('');
    setPdfError('');
    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
    }
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

  // Toggle checkbox for multi-select service types
  const toggleServiceType = (service) => {
    setFormData((prev) => {
      const exists = prev.serviceTypes.includes(service);
      const next = exists
        ? prev.serviceTypes.filter((s) => s !== service)
        : [...prev.serviceTypes, service];
      return { ...prev, serviceTypes: next };
    });
  };

  // Handle boolean toggles that may copy values
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => {
      const update = { ...prev, [name]: checked };
      if (name === 'sameAsRequestingProvider' && checked) {
        update.servicingProviderNameNPITaxId = prev.requestingProviderNameNPI;
        update.servicingProviderPhone = prev.requestingProviderPhone;
        update.servicingProviderFax = prev.requestingProviderFax;
      }
      if (name === 'sameAsRequestingProviderFacility' && checked) {
        update.servicingFacilityNameNPI = prev.requestingProviderNameNPI;
        update.servicingFacilityPhone = prev.requestingProviderPhone;
        update.servicingFacilityFax = prev.requestingProviderFax;
      }
      return update;
    });
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
      
      // Prepare data for Firestore (structured)
      const patientData = {
        personalInfo: {
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
          address: formData.address
        },
        contactInfo: {
          email: formData.email,
          phoneNumber: formData.phoneNumber
        },
        medicalHistory: formData.medicalHistory || '', // optional
        priorAuthorization: {
          insurance: {
            healthPlan: formData.healthPlan,
            healthPlanFax: formData.healthPlanFax,
          },
          serviceTypes: {
            selected: formData.serviceTypes,
            other: formData.otherServiceType,
          },
          providerInformation: {
            requestingProviderNameNPI: formData.requestingProviderNameNPI,
            requestingProviderPhone: formData.requestingProviderPhone,
            requestingProviderFax: formData.requestingProviderFax,
            servicingProviderNameNPITaxId: formData.servicingProviderNameNPITaxId,
            servicingProviderPhone: formData.servicingProviderPhone,
            servicingProviderFax: formData.servicingProviderFax,
            sameAsRequestingProvider: formData.sameAsRequestingProvider,
            servicingFacilityNameNPI: formData.servicingFacilityNameNPI,
            servicingFacilityPhone: formData.servicingFacilityPhone,
            servicingFacilityFax: formData.servicingFacilityFax,
            sameAsRequestingProviderFacility: formData.sameAsRequestingProviderFacility,
            contactPerson: formData.contactPerson,
          },
          memberInformation: {
            patientName: formData.name,
            gender: formData.gender,
            dob: formData.dob,
            healthInsuranceId: formData.healthInsuranceId,
            otherInsurance: formData.otherInsurance,
            patientAccountNumber: formData.patientAccountNumber,
            address: formData.memberAddress || formData.address,
          },
          diagnosisAndProcedure: {
            principalDiagnosisDescription: formData.principalDiagnosisDescription,
            principalDiagnosisICD10: formData.principalDiagnosisICD10,
            secondaryDiagnosisDescription: formData.secondaryDiagnosisDescription,
            secondaryDiagnosisICD10: formData.secondaryDiagnosisICD10,
            principalPlannedProcedureDescriptionCPT: formData.principalPlannedProcedureDescriptionCPT,
            principalUnits: {
              number: formData.principalUnitsNumber,
              type: formData.principalUnitsType,
            },
            secondaryPlannedProcedureDescriptionCPT: formData.secondaryPlannedProcedureDescriptionCPT,
            secondaryUnits: {
              number: formData.secondaryUnitsNumber,
              type: formData.secondaryUnitsType,
            },
            serviceStartDate: formData.serviceStartDate,
          },
        },
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

      // Debug log for navigation
      console.log('Navigating to confirmation page with patientId:', patientId);
      // Clear form fields after successful submission
      setFormData({
        name: '',
        age: '',
        gender: '',
        address: '',
        email: '',
        phoneNumber: '',
        medicalHistory: '',
        healthPlan: '',
        healthPlanFax: '',
        serviceTypes: [],
        otherServiceType: '',
        requestingProviderNameNPI: '',
        requestingProviderPhone: '',
        requestingProviderFax: '',
        servicingProviderNameNPITaxId: '',
        servicingProviderPhone: '',
        servicingProviderFax: '',
        sameAsRequestingProvider: false,
        servicingFacilityNameNPI: '',
        servicingFacilityPhone: '',
        servicingFacilityFax: '',
        sameAsRequestingProviderFacility: false,
        contactPerson: '',
        dob: '',
        healthInsuranceId: '',
        otherInsurance: '',
        patientAccountNumber: '',
        memberAddress: '',
        principalDiagnosisDescription: '',
        principalDiagnosisICD10: '',
        secondaryDiagnosisDescription: '',
        secondaryDiagnosisICD10: '',
        principalPlannedProcedureDescriptionCPT: '',
        principalUnitsNumber: '',
        principalUnitsType: '',
        secondaryPlannedProcedureDescriptionCPT: '',
        secondaryUnitsNumber: '',
        secondaryUnitsType: '',
        serviceStartDate: ''
      });
      setErrors({});
      // Robust navigation to confirmation page
      setTimeout(() => {
        navigate(`/confirmation/${patientId}`, {
          state: {
            patientId,
            email: formData.email,
            phoneNumber: formData.phoneNumber
          }
        });
      }, 100);

    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to submit form. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card w-full relative">
          {/* Hidden file input for PDF selection */}
          <input ref={pdfInputRef} type="file" accept="application/pdf" className="hidden" onChange={onPdfSelected} />
          {/* Header */}
          <div className="text-center mb-8">
            {/* Top-right Upload button (UI only) */}
            <div className="absolute right-4 top-4">
              <button
                type="button"
                onClick={openPdfPicker}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                title="Upload Prior Authorization PDF"
                aria-label="Upload Prior Authorization PDF"
              >
                <Upload className="h-4 w-4 text-medical-700" />
                Upload PDF
              </button>
            </div>
            <div className="bg-medical-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-medical-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Patient Registration Form</h2>
            <p className="text-gray-600 mt-2">Please fill out all required information</p>
          </div>

          {/* PDF selection status (UI only) */}
          {pdfName && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 flex items-center justify-between">
              <div>
                <strong className="font-semibold">PDF selected:</strong> {pdfName}
                <span className="ml-2 text-green-700">(Parsing will be performed later)</span>
              </div>
              <button type="button" onClick={clearPdf} className="inline-flex items-center gap-1 text-green-800 hover:text-green-900" aria-label="Clear selected PDF">
                <X className="h-4 w-4" />
                Clear
              </button>
            </div>
          )}

          {pdfError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {pdfError}
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8 lg:space-y-10">
            {/* Insurance Section (Prior Authorization) */}
            <div className="bg-gray-50 rounded-xl p-6 lg:p-8 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-medical-600" />
                Prior Authorization - Insurance
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                <div>
                  <label htmlFor="healthPlan" className="form-label">Health Plan</label>
                  <input id="healthPlan" name="healthPlan" type="text" value={formData.healthPlan} onChange={handleInputChange} className="form-input" placeholder="Plan name" />
                </div>
                <div>
                  <label htmlFor="healthPlanFax" className="form-label">Health Plan Fax #</label>
                  <input id="healthPlanFax" name="healthPlanFax" type="text" value={formData.healthPlanFax} onChange={handleInputChange} className="form-input" placeholder="(###) ###-####" />
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="bg-gray-50 rounded-xl p-6 lg:p-8 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-medical-600" />
                Personal Information
              </h3>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
                  <label htmlFor="dob" className="form-label">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input id="dob" name="dob" type="date" value={formData.dob} onChange={handleInputChange} className="form-input pl-10" />
                  </div>
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

            {/* Service Type Requiring Authorization */}
            <div className="bg-gray-50 rounded-xl p-6 lg:p-8 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-medical-600" />
                Service Type Requiring Authorization
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 text-sm">
                {[
                  'Ambulatory/Outpatient Service',
                  'Surgery/Procedure',
                  'Infusion or Chemotherapy',
                  'Diagnostic',
                  'Home Health',
                  'Infusion Therapy (Home)',
                  'Hospice Care',
                  'Respite Care',
                  'Transportation (Non-emergent)',
                  'Air Ambulance',
                  'Acupuncture',
                  'Chiropractic',
                  'Durable Medical Equipment',
                  'Non-Participating Specialist',
                  'Acute Medical/Surgical',
                  'Long Term Acute Care',
                  'Rehabilitation',
                  'Skilled Nursing Facility',
                  'Adjunctive Dental Services',
                  'Oral Surgery',
                  'Maxillofacial Prosthetics',
                  'Enteral Nutrition',
                  'Parenteral Nutrition',
                  'Total Parenteral Nutrition',
                  'Outpatient Therapy - Occupational',
                  'Outpatient Therapy - Physical',
                  'Outpatient Therapy - Cardio Pulmonary Rehab',
                  'Outpatient Therapy - Speech',
                ].map((s) => (
                  <label key={s} className="flex items-center space-x-2">
                    <input type="checkbox" className="form-checkbox" checked={formData.serviceTypes.includes(s)} onChange={() => toggleServiceType(s)} />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <label htmlFor="otherServiceType" className="form-label">Other — please specify</label>
                <input id="otherServiceType" name="otherServiceType" type="text" value={formData.otherServiceType} onChange={handleInputChange} className="form-input" placeholder="Other service type" />
              </div>
            </div>

            {/* Provider Information */}
            <div className="bg-gray-50 rounded-xl p-6 lg:p-8 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-medical-600" />
                Provider Information
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                <div>
                  <label htmlFor="requestingProviderNameNPI" className="form-label">Requesting Provider Name and NPI</label>
                  <input id="requestingProviderNameNPI" name="requestingProviderNameNPI" type="text" value={formData.requestingProviderNameNPI} onChange={handleInputChange} className="form-input" placeholder="Name, NPI" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="requestingProviderPhone" className="form-label">Phone</label>
                    <input id="requestingProviderPhone" name="requestingProviderPhone" type="tel" value={formData.requestingProviderPhone} onChange={handleInputChange} className="form-input" placeholder="(###) ###-####" />
                  </div>
                  <div>
                    <label htmlFor="requestingProviderFax" className="form-label">Fax</label>
                    <input id="requestingProviderFax" name="requestingProviderFax" type="text" value={formData.requestingProviderFax} onChange={handleInputChange} className="form-input" placeholder="(###) ###-####" />
                  </div>
                </div>

                <div>
                  <label htmlFor="servicingProviderNameNPITaxId" className="form-label">Servicing Provider Name and NPI (and Tax ID if required)</label>
                  <input id="servicingProviderNameNPITaxId" name="servicingProviderNameNPITaxId" type="text" value={formData.servicingProviderNameNPITaxId} onChange={handleInputChange} className="form-input" placeholder="Name, NPI, Tax ID" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="servicingProviderPhone" className="form-label">Phone</label>
                    <input id="servicingProviderPhone" name="servicingProviderPhone" type="tel" value={formData.servicingProviderPhone} onChange={handleInputChange} className="form-input" placeholder="(###) ###-####" />
                  </div>
                  <div>
                    <label htmlFor="servicingProviderFax" className="form-label">Fax</label>
                    <input id="servicingProviderFax" name="servicingProviderFax" type="text" value={formData.servicingProviderFax} onChange={handleInputChange} className="form-input" placeholder="(###) ###-####" />
                  </div>
                </div>

                <div className="md:col-span-2 lg:col-span-3 flex items-center space-x-3">
                  <input id="sameAsRequestingProvider" name="sameAsRequestingProvider" type="checkbox" className="form-checkbox" checked={formData.sameAsRequestingProvider} onChange={handleCheckboxChange} />
                  <label htmlFor="sameAsRequestingProvider" className="text-sm text-gray-700">Servicing Provider same as Requesting Provider</label>
                </div>

                <div>
                  <label htmlFor="servicingFacilityNameNPI" className="form-label">Servicing Facility Name and NPI</label>
                  <input id="servicingFacilityNameNPI" name="servicingFacilityNameNPI" type="text" value={formData.servicingFacilityNameNPI} onChange={handleInputChange} className="form-input" placeholder="Facility Name, NPI" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="servicingFacilityPhone" className="form-label">Phone</label>
                    <input id="servicingFacilityPhone" name="servicingFacilityPhone" type="tel" value={formData.servicingFacilityPhone} onChange={handleInputChange} className="form-input" placeholder="(###) ###-####" />
                  </div>
                  <div>
                    <label htmlFor="servicingFacilityFax" className="form-label">Fax</label>
                    <input id="servicingFacilityFax" name="servicingFacilityFax" type="text" value={formData.servicingFacilityFax} onChange={handleInputChange} className="form-input" placeholder="(###) ###-####" />
                  </div>
                </div>

                <div className="md:col-span-2 lg:col-span-3 flex items-center space-x-3">
                  <input id="sameAsRequestingProviderFacility" name="sameAsRequestingProviderFacility" type="checkbox" className="form-checkbox" checked={formData.sameAsRequestingProviderFacility} onChange={handleCheckboxChange} />
                  <label htmlFor="sameAsRequestingProviderFacility" className="text-sm text-gray-700">Servicing Facility same as Requesting Provider</label>
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <label htmlFor="contactPerson" className="form-label">Contact Person</label>
                  <input id="contactPerson" name="contactPerson" type="text" value={formData.contactPerson} onChange={handleInputChange} className="form-input" placeholder="Name of contact person" />
                </div>
              </div>
            </div>

            {/* Member Information (Prior Authorization) */}
            <div className="bg-gray-50 rounded-xl p-6 lg:p-8 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-medical-600" />
                Member Information (Prior Authorization)
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                <div>
                  <label htmlFor="healthInsuranceId" className="form-label">Health Insurance ID#</label>
                  <input id="healthInsuranceId" name="healthInsuranceId" type="text" value={formData.healthInsuranceId} onChange={handleInputChange} className="form-input" placeholder="ID number" />
                </div>
                <div>
                  <label htmlFor="patientAccountNumber" className="form-label">Patient Account/Control Number</label>
                  <input id="patientAccountNumber" name="patientAccountNumber" type="text" value={formData.patientAccountNumber} onChange={handleInputChange} className="form-input" placeholder="Account number" />
                </div>
                <div>
                  <label htmlFor="otherInsurance" className="form-label">If other insurance, please specify</label>
                  <input id="otherInsurance" name="otherInsurance" type="text" value={formData.otherInsurance} onChange={handleInputChange} className="form-input" placeholder="Other insurance provider" />
                </div>
                <div>
                  <label htmlFor="memberAddress" className="form-label">Member Address (defaults to Address)</label>
                  <input id="memberAddress" name="memberAddress" type="text" value={formData.memberAddress} onChange={handleInputChange} className="form-input" placeholder={formData.address || 'Address'} />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-gray-50 rounded-xl p-6 lg:p-8 border border-gray-100">
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
            <div className="bg-gray-50 rounded-xl p-6 lg:p-8 border border-gray-100">
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

            {/* Diagnosis/Planned Procedure Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-medical-600" />
                Diagnosis / Planned Procedure Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="principalDiagnosisDescription" className="form-label">Principal Diagnosis Description</label>
                  <input id="principalDiagnosisDescription" name="principalDiagnosisDescription" type="text" value={formData.principalDiagnosisDescription} onChange={handleInputChange} className="form-input" />
                </div>
                <div>
                  <label htmlFor="principalDiagnosisICD10" className="form-label">ICD-10 Codes</label>
                  <input id="principalDiagnosisICD10" name="principalDiagnosisICD10" type="text" value={formData.principalDiagnosisICD10} onChange={handleInputChange} className="form-input" placeholder="e.g., E11.9" />
                </div>
                <div>
                  <label htmlFor="secondaryDiagnosisDescription" className="form-label">Secondary Diagnosis Description</label>
                  <input id="secondaryDiagnosisDescription" name="secondaryDiagnosisDescription" type="text" value={formData.secondaryDiagnosisDescription} onChange={handleInputChange} className="form-input" />
                </div>
                <div>
                  <label htmlFor="secondaryDiagnosisICD10" className="form-label">ICD-10 Codes</label>
                  <input id="secondaryDiagnosisICD10" name="secondaryDiagnosisICD10" type="text" value={formData.secondaryDiagnosisICD10} onChange={handleInputChange} className="form-input" />
                </div>

                <div className="md:col-span-2 grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="principalPlannedProcedureDescriptionCPT" className="form-label">Principal Planned Procedure (Description and CPT/HCPCS Code)</label>
                    <input id="principalPlannedProcedureDescriptionCPT" name="principalPlannedProcedureDescriptionCPT" type="text" value={formData.principalPlannedProcedureDescriptionCPT} onChange={handleInputChange} className="form-input" placeholder="Description, CPT/HCPCS" />
                  </div>
                  <div>
                    <label className="form-label"># of Units Being Requested</label>
                    <div className="grid grid-cols-3 gap-3">
                      <input name="principalUnitsNumber" type="number" value={formData.principalUnitsNumber} onChange={handleInputChange} className="form-input" placeholder="#" />
                      <select name="principalUnitsType" value={formData.principalUnitsType} onChange={handleInputChange} className="form-input">
                        <option value="">Select</option>
                        <option value="Hours">Hours</option>
                        <option value="Days">Days</option>
                        <option value="Months">Months</option>
                        <option value="Visits">Visits</option>
                        <option value="Dosage">Dosage</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="secondaryPlannedProcedureDescriptionCPT" className="form-label">Secondary Planned Procedure (Description and CPT/HCPCS Code)</label>
                    <input id="secondaryPlannedProcedureDescriptionCPT" name="secondaryPlannedProcedureDescriptionCPT" type="text" value={formData.secondaryPlannedProcedureDescriptionCPT} onChange={handleInputChange} className="form-input" placeholder="Description, CPT/HCPCS" />
                  </div>
                  <div>
                    <label className="form-label"># of Units Being Requested</label>
                    <div className="grid grid-cols-3 gap-3">
                      <input name="secondaryUnitsNumber" type="number" value={formData.secondaryUnitsNumber} onChange={handleInputChange} className="form-input" placeholder="#" />
                      <select name="secondaryUnitsType" value={formData.secondaryUnitsType} onChange={handleInputChange} className="form-input">
                        <option value="">Select</option>
                        <option value="Hours">Hours</option>
                        <option value="Days">Days</option>
                        <option value="Months">Months</option>
                        <option value="Visits">Visits</option>
                        <option value="Dosage">Dosage</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="serviceStartDate" className="form-label">Service Start Date</label>
                  <div className="relative max-w-xs">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input id="serviceStartDate" name="serviceStartDate" type="date" value={formData.serviceStartDate} onChange={handleInputChange} className="form-input pl-10" />
                  </div>
                </div>
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