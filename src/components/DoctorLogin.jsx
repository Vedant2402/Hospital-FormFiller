<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Home, Stethoscope } from 'lucide-react';

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const existing = localStorage.getItem('doctorUser');
    if (existing) {
      navigate('/doctor');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const demoUsers = [
      { email: 'doctor@example.com', password: 'password123', name: 'Dr. Demo' },
    ];
    const user = demoUsers.find(u => u.email === email && u.password === password);
    if (!user) {
      setError('Invalid credentials. Try doctor@example.com / password123');
      return;
=======
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Stethoscope, Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const DoctorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // Temporary registration function for doctor demo account
  // eslint-disable-next-line no-unused-vars
  const handleRegisterDoctor = async () => {
    setLoading(true);
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, 'doctor@demo.com', 'demo123');
      setError('Doctor account registered! You can now log in.');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Doctor account already exists. You can log in.');
      } else {
        setError('Registration failed: ' + error.message);
      }
    } finally {
      setLoading(false);
>>>>>>> parent of bb5032e (Added authentication api, added cors route in vite)
    }
    localStorage.setItem('doctorUser', JSON.stringify({ email: user.email, name: user.name, loggedInAt: new Date().toISOString() }));
    navigate('/doctor');
  };

<<<<<<< HEAD
  return (
    <div className="min-h-dvh animated-gradient">
      {/* Header */}
      <header className="glass-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-lg shadow-sm">
                <Stethoscope className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Doctor Portal</h1>
                <p className="hidden md:block text-xs text-gray-600">Secure access to pre-authorization dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href="/" className="glass-button px-3 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg inline-flex items-center gap-2">
                <Home className="h-5 w-5" /> Home
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Centered Login Card */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20" style={{ minHeight: 'calc(100dvh - 8rem)' }}>
        {/* Back button above the sign-in card, left aligned */}
        <div className="flex justify-start mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="glass-button px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg inline-flex items-center gap-2"
            aria-label="Go back"
=======
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/doctor-dashboard');
    } catch (error) {
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return 'Login failed. Please check your credentials and try again.';
    }
  };

  return (
  <div className="min-h-dvh bg-gradient-to-br from-primary-50 via-white to-medical-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors duration-200"
>>>>>>> parent of bb5032e (Added authentication api, added cors route in vite)
          >
            <span className="font-semibold">&larr;</span>
            <span>Back</span>
          </button>
        </div>

        <section className="flex items-center justify-center">
          <div className="glass-card animated-card w-full max-w-md anim-fade-in">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary-100 mr-3">
                <ShieldCheck className="h-6 w-6 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
            </div>
<<<<<<< HEAD
            <p className="text-gray-600 mb-6">Enter your credentials to access the Pre-Authorization dashboard.</p>
            {error && <div className="bg-red-50 text-red-700 rounded-md p-3 mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
=======
            <h2 className="text-3xl font-bold text-gray-900">Doctor Login</h2>
            <p className="text-gray-600 mt-2">Access your medical dashboard</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
>>>>>>> parent of bb5032e (Added authentication api, added cors route in vite)
                <input
                  type="email"
                  className="input h-14 text-lg px-4"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
<<<<<<< HEAD
                  placeholder="doctor@example.com"
=======
                  className="form-input pl-10"
                  placeholder="doctor@hospital.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
>>>>>>> parent of bb5032e (Added authentication api, added cors route in vite)
                  required
                />
              </div>
<<<<<<< HEAD
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input h-14 text-lg pr-12 px-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                  <button type="button" className="absolute right-3 top-3 text-gray-500" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full h-12 text-base">Sign In</button>
              <p className="text-xs text-gray-500 mt-2">Demo login: doctor@example.com / password123</p>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          © 2025 HealthCare Portal
        </div>
      </footer>
=======
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials & Register Button */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Demo Credentials:</h4>
            <p className="text-sm text-gray-600">
              Email: <code className="bg-white px-2 py-1 rounded">doctor@demo.com</code>
            </p>
            <p className="text-sm text-gray-600">
              Password: <code className="bg-white px-2 py-1 rounded">demo123</code>
            </p>
            {/* <button
              type="button"
              onClick={handleRegisterDoctor}
              className="btn-primary w-full mt-4"
              disabled={loading}
            >
              {/* {loading ? 'Registering...' : 'Register Doctor Demo Account'} */}
            {/* </button> */}
            <p className="text-xs text-gray-500 mt-2">
              Note: Click to create this account in Firebase Authentication for testing. Remove after registration.
            </p> 
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Having trouble accessing your account?{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
              Contact IT Support
            </a>
          </p>
        </div>
      </div>
>>>>>>> parent of bb5032e (Added authentication api, added cors route in vite)
    </div>
  );
};

export default DoctorLogin;