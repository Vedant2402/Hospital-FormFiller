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
    }
    localStorage.setItem('doctorUser', JSON.stringify({ email: user.email, name: user.name, loggedInAt: new Date().toISOString() }));
    navigate('/doctor');
  };

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
            <p className="text-gray-600 mb-6">Enter your credentials to access the Pre-Authorization dashboard.</p>
            {error && <div className="bg-red-50 text-red-700 rounded-md p-3 mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="input h-14 text-lg px-4"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@example.com"
                  required
                />
              </div>
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
    </div>
  );
};

export default DoctorLogin;
