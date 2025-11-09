// Deprecated: DoctorLogin removed in patient-only flow. Placeholder export.
export default function DoctorLogin() { return null; }
const _deprecated_doctor_login = String.raw`
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
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
    </div>
  );
};

`;