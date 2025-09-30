import React from 'react';
// navigation handled via Link inside GlassCard
import { Stethoscope, UserPlus, FileText } from 'lucide-react';
import GlassCard from './GlassCard';

const LandingPage = () => {
  // no local navigation needed

  return (
  <div className="min-h-dvh bg-gradient-to-br from-white via-primary-50 to-medical-50">
      {/* Glass Header - fixed */}
      <header className="glass-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-lg shadow-sm">
                <Stethoscope className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">HealthCare Portal</h1>
                <p className="hidden md:block text-xs text-gray-600">Minimal, secure, and professional</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
  <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 ar-tight-py ar-loose-py" style={{ minHeight: 'calc(100dvh - 4rem)' }}>
        {/* Hero */}
        <section className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Welcome to <span className="text-primary-600">HealthCare Portal</span>
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Choose an option to continue. Designed for clarity and speed in a clinical environment.
          </p>
        </section>

        {/* Two Options */}
  <section className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto ar-card-grid ar-wide-grid">
          <GlassCard
            href="/doctor-login"
            icon={<Stethoscope className="h-12 w-12 text-primary-600" />}
            title="Doctor Portal"
            description="Access patient records and manage data securely."
            buttonText="Login as Doctor"
          />
          <GlassCard
            href="/patient-form"
            icon={<FileText className="h-12 w-12 text-medical-700" />}
            title="Patient Form"
            description="Submit your medical information securely through our online form."
            buttonText="Fill Out Form"
          />
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          © 2025 HealthCare Portal
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;