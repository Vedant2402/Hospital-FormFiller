<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Stethoscope, LogOut, FileSearch, ArrowRight, Download, BarChart3, CalendarClock, ShieldCheck, Home } from 'lucide-react';

const DoctorDashboard = () => {
=======
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, orderBy, limit, startAfter } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { validatePatientId } from '../utils/patientId';
import { Search, LogOut, User, CreditCard as Edit3, Save, X, ChevronLeft, ChevronRight, Stethoscope, Mail, Phone, MapPin, Calendar, FileText, Users } from 'lucide-react';

const DoctorDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  // pagination states handled via lastDoc/hasMore
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
>>>>>>> parent of bb5032e (Added authentication api, added cors route in vite)
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, last24h: 0, byService: [] });

  useEffect(() => {
<<<<<<< HEAD
    const docUser = JSON.parse(localStorage.getItem('doctorUser') || 'null');
    if (!docUser) {
      navigate('/doctor-login');
      return;
    }
    setDoctor(docUser);
    const all = JSON.parse(localStorage.getItem('patients') || '[]');
    setPatients(all);
    // compute stats
    const now = Date.now();
    const lastDay = all.filter(p => {
      const ts = new Date(p.submittedAt || p.createdAt).getTime();
      return now - ts < 24 * 60 * 60 * 1000;
    }).length;
    const serviceCounts = {};
    all.forEach(p => {
      (p.serviceTypes || []).forEach(s => {
        serviceCounts[s] = (serviceCounts[s] || 0) + 1;
=======
    // initial load
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPatients = async (isNextPage = false) => {
    setLoading(true);
    try {
      let q = query(
        collection(db, 'patients'),
        orderBy('createdAt', 'desc'),
        limit(PATIENTS_PER_PAGE)
      );

      if (isNextPage && lastDoc) {
        q = query(
          collection(db, 'patients'),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(PATIENTS_PER_PAGE)
        );
      }

      const querySnapshot = await getDocs(q);
      const patients = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          patientId: data.patientId,
          name: data.personalInfo?.name || '',
          age: data.personalInfo?.age || '',
          gender: data.personalInfo?.gender || '',
          address: data.personalInfo?.address || '',
          email: data.contactInfo?.email || '',
          phoneNumber: data.contactInfo?.phoneNumber || '',
          medicalHistory: data.medicalHistory || '',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
      });

      if (isNextPage) {
        setAllPatients(prev => [...prev, ...patients]);
      } else {
        setAllPatients(patients);
      }

      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === PATIENTS_PER_PAGE);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const patientsRef = collection(db, 'patients');
      let queries = [];

      // Search by Patient ID
      if (validatePatientId(searchTerm)) {
        queries.push(query(patientsRef, where('patientId', '==', searchTerm)));
      }

      // Search by email
      if (searchTerm.includes('@')) {
        queries.push(query(patientsRef, where('email', '==', searchTerm.toLowerCase())));
      }

      // Search by phone number (exact match)
      queries.push(query(patientsRef, where('phoneNumber', '==', searchTerm)));

      // Search by name (case-insensitive partial match would require additional setup)
      queries.push(query(patientsRef, where('name', '>=', searchTerm)));
      queries.push(query(patientsRef, where('name', '<=', searchTerm + '\uf8ff')));

      const results = [];
      for (const q of queries) {
        const querySnapshot = await getDocs(q);
        querySnapshot.docs.forEach(doc => {
          const patientData = { id: doc.id, ...doc.data() };
          if (!results.find(p => p.id === patientData.id)) {
            results.push(patientData);
          }
        });
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPatient = (patient) => {
    setEditingPatient(patient.id);
    setEditFormData({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      address: patient.address,
      email: patient.email,
      phoneNumber: patient.phoneNumber,
      medicalHistory: patient.medicalHistory || ''
    });
  };

  const handleSaveEdit = async () => {
    try {
      const patientRef = doc(db, 'patients', editingPatient);
      await updateDoc(patientRef, {
        ...editFormData,
        updatedAt: new Date()
>>>>>>> parent of bb5032e (Added authentication api, added cors route in vite)
      });
    });
    const byServiceArr = Object.entries(serviceCounts)
      .sort((a,b) => b[1]-a[1])
      .slice(0, 4)
      .map(([name,count]) => ({ name, count }));
    setStats({ total: all.length, last24h: lastDay, byService: byServiceArr });
  }, [navigate]);

<<<<<<< HEAD
  const logout = () => {
    localStorage.removeItem('doctorUser');
    navigate('/doctor-login');
  };

  const filtered = patients.filter(p => {
    const text = JSON.stringify(p).toLowerCase();
    return text.includes(query.toLowerCase());
  });

  const downloadRecord = (rec) => {
    const blob = new Blob([JSON.stringify(rec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Patient_${rec.patientId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

=======
      // Update local state
      const updatePatientInList = (patients) =>
        patients.map(p => 
          p.id === editingPatient 
            ? { ...p, ...editFormData, updatedAt: new Date() }
            : p
        );

      setAllPatients(updatePatientInList);
      setSearchResults(updatePatientInList);
      setEditingPatient(null);
      setEditFormData({});
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const PatientCard = ({ patient, isEditing = false }) => (
    <div className="card mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="bg-primary-100 p-3 rounded-full mr-4">
            <User className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditing ? (
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input text-lg font-semibold"
                />
              ) : (
                patient.name
              )}
            </h3>
            <p className="text-sm text-gray-600">Patient ID: {patient.patientId}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveEdit}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
              >
                <Save className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  setEditingPatient(null);
                  setEditFormData({});
                }}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => handleEditPatient(patient)}
              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
            >
              <Edit3 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Age:</span>
            {isEditing ? (
              <input
                type="number"
                value={editFormData.age}
                onChange={(e) => setEditFormData(prev => ({ ...prev, age: e.target.value }))}
                className="form-input ml-2 text-sm w-20"
              />
            ) : (
              <span className="ml-2 text-sm font-medium">{patient.age}</span>
            )}
          </div>

          <div className="flex items-center">
            <Users className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Gender:</span>
            {isEditing ? (
              <select
                value={editFormData.gender}
                onChange={(e) => setEditFormData(prev => ({ ...prev, gender: e.target.value }))}
                className="form-input ml-2 text-sm"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            ) : (
              <span className="ml-2 text-sm font-medium capitalize">{patient.gender}</span>
            )}
          </div>

          <div className="flex items-start">
            <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
            <div className="flex-1">
              <span className="text-sm text-gray-600">Address:</span>
              {isEditing ? (
                <textarea
                  value={editFormData.address}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="form-input ml-2 text-sm w-full mt-1"
                  rows="2"
                />
              ) : (
                <p className="ml-2 text-sm font-medium">{patient.address}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            <Mail className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Email:</span>
            {isEditing ? (
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                className="form-input ml-2 text-sm flex-1"
              />
            ) : (
              <span className="ml-2 text-sm font-medium">{patient.email}</span>
            )}
          </div>

          <div className="flex items-center">
            <Phone className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Phone:</span>
            {isEditing ? (
              <input
                type="tel"
                value={editFormData.phoneNumber}
                onChange={(e) => setEditFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="form-input ml-2 text-sm flex-1"
              />
            ) : (
              <span className="ml-2 text-sm font-medium">{patient.phoneNumber}</span>
            )}
          </div>

          <div className="flex items-start">
            <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
            <div className="flex-1">
              <span className="text-sm text-gray-600">Medical History:</span>
              {isEditing ? (
                <textarea
                  value={editFormData.medicalHistory}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, medicalHistory: e.target.value }))}
                  className="form-input ml-2 text-sm w-full mt-1"
                  rows="3"
                  placeholder="Enter medical history..."
                />
              ) : (
                <p className="ml-2 text-sm font-medium">
                  {patient.medicalHistory || 'No medical history provided'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Created: {new Date(patient.createdAt?.toDate()).toLocaleDateString()}</span>
          {patient.updatedAt && (
            <span>Updated: {new Date(patient.updatedAt?.toDate()).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </div>
  );

>>>>>>> parent of bb5032e (Added authentication api, added cors route in vite)
  return (
    <div className="min-h-screen animated-gradient p-4 pt-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="glass-card flex items-center justify-between mb-6 anim-fade-in">
          <div className="flex items-center">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-primary-100 mr-3 shadow-inner">
              <Stethoscope className="h-7 w-7 text-primary-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
              {doctor && <p className="text-gray-600 text-sm">Welcome, {doctor.name} ({doctor.email})</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="glass-button px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg inline-flex items-center gap-2">
              <Home className="h-5 w-5" /> Home
            </Link>
            <button onClick={logout} className="glass-button px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg inline-flex items-center gap-2">
              <LogOut className="h-5 w-5" /> Log Out
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4 anim-fade-up">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-primary-600" />
              <div>
<<<<<<< HEAD
                <p className="text-sm text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
=======
                <h1 className="text-xl font-bold text-gray-900">Doctor Dashboard</h1>
                <p className="text-sm text-gray-600">Patient Management System</p>
>>>>>>> parent of bb5032e (Added authentication api, added cors route in vite)
              </div>
            </div>
          </div>
<<<<<<< HEAD
          <div className="glass-card p-4 anim-fade-up anim-delay-1">
            <div className="flex items-center gap-3">
              <CalendarClock className="h-6 w-6 text-primary-600" />
              <div>
                <p className="text-sm text-gray-600">Last 24 Hours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.last24h}</p>
              </div>
            </div>
          </div>
          <div className="glass-card p-4 anim-fade-up anim-delay-2 lg:col-span-2">
            <p className="text-sm text-gray-600 mb-2">Top Service Types</p>
            <div className="flex flex-wrap gap-2">
              {stats.byService.length === 0 ? (
                <span className="text-gray-500 text-sm">No data</span>
              ) : stats.byService.map(s => (
                <span key={s.name} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 ring-1 ring-primary-200">
                  <ShieldCheck className="h-4 w-4" /> {s.name} <span className="text-xs text-primary-800">{s.count}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="glass-card mb-6 anim-fade-in">
          <div className="flex items-center gap-3">
            <FileSearch className="h-5 w-5 text-gray-600" />
            <input
              className="input w-full"
              placeholder="Search by patient ID, name, diagnosis, insurance..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
=======
        </div>
      </header>

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ minHeight: 'calc(100dvh - 4rem)' }}>
        {/* Search Section */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Patients</h2>
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="form-input pl-10"
                placeholder="Search by Patient ID, Email, Phone, or Name..."
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Search Tips:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Enter a 9-digit Patient ID for exact match</li>
              <li>Use complete email address for email search</li>
              <li>Enter phone number as provided by patient</li>
              <li>Search by patient name (case-sensitive)</li>
            </ul>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Search Results ({searchResults.length})
            </h3>
            {searchResults.map(patient => (
              <PatientCard
                key={patient.id}
                patient={patient}
                isEditing={editingPatient === patient.id}
              />
            ))}
>>>>>>> parent of bb5032e (Added authentication api, added cors route in vite)
          </div>
        </div>

<<<<<<< HEAD
        {/* Patients List */}
        <div className="glass-card anim-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Patient Submissions ({filtered.length})</h2>
            <Link to="/patient-form" className="btn-secondary">New Pre-Auth</Link>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600">No patients found.</p>
              <Link to="/patient-form" className="btn-primary mt-4 inline-flex items-center gap-2">Create your first Pre-Auth <ArrowRight className="h-4 w-4" /></Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2 pr-4">Patient ID</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Insurance</th>
                    <th className="py-2 pr-4">Diagnosis</th>
                    <th className="py-2 pr-4">Submitted</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.patientId} className="border-b">
                      <td className="py-2 pr-4 font-medium">{p.patientId}</td>
                      <td className="py-2 pr-4">{p.personalInfo?.name || '—'}</td>
                      <td className="py-2 pr-4"><span className="px-2 py-1 rounded-md bg-gray-100 text-gray-800">{p.healthPlan || '—'}</span></td>
                      <td className="py-2 pr-4"><span className="px-2 py-1 rounded-md bg-medical-50 text-medical-800">{p.principalDiagnosisDescription || '—'}</span></td>
                      <td className="py-2 pr-4">{p.submittedAt || '—'}</td>
                      <td className="py-2 pr-4">
                        <div className="flex gap-2">
                          <Link to={`/confirmation/${p.patientId}`} className="btn-primary inline-flex items-center gap-1">
                            Review <ArrowRight className="h-4 w-4" />
                          </Link>
                          <button onClick={() => downloadRecord(p)} className="btn-secondary inline-flex items-center gap-1">
                            <Download className="h-4 w-4" /> JSON
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
=======
        {/* All Patients List */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              All Patients ({allPatients.length})
            </h3>
            {hasMore && (
              <button
                onClick={() => loadPatients(true)}
                disabled={loading}
                className="btn-secondary disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            )}
          </div>

          {allPatients.length === 0 ? (
            <div className="card text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Patients Found</h4>
              <p className="text-gray-600">No patient records are available in the system yet.</p>
            </div>
          ) : (
            <div>
              {allPatients.map(patient => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  isEditing={editingPatient === patient.id}
                />
              ))}
>>>>>>> parent of bb5032e (Added authentication api, added cors route in vite)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;