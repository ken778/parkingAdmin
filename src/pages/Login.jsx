import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ParkingSquare, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff,
  Shield,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl">
        {/* Left side - Branding and Illustration */}
        <div className="w-full md:w-2/5 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 md:p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center mb-8">
              <div className="">
                    <img
              src="../logo.png"
              alt="fndParking Logo"
              className="logo-image"
              width="60"
              height="60"
              borderRadius="200"
              aria-hidden="true"
            />
              </div>
              <div>
                <h1 className="text-2xl font-bold">FndParking</h1>
                <p className="text-blue-200 text-sm">Administration</p>
              </div>
            </div>
            
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-4">Parking Management System</h2>
              <p className="text-blue-200">
                Secure access to manage parking spots, users, and monitor system analytics.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center text-blue-200 text-sm">
              <Shield size={16} className="mr-2" />
              <span>Enterprise-grade security & encryption</span>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full md:w-3/5 bg-white p-8 md:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="relative">
                  <div className=""></div>
                  <div className="">
                      <img
              src="../logo.png"
              alt="fndParking Logo"
              className="logo-image"
              width="100"
              height="100"
              borderRadius="200"
              aria-hidden="true"
            />
                  </div>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to your administrator dashboard</p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                <div className="flex items-center">
                  <AlertCircle size={20} className="text-red-500 mr-3" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="admin@parking.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  {/* Forgot password link - optional */}
                  {/* <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
                    Forgot password?
                  </a> */}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    Sign In
                    <ArrowRight size={18} className="ml-2" />
                  </span>
                )}
              </button>

              {/* Demo Credentials */}
              <div className="pt-6 border-t border-gray-100">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-sm font-medium text-gray-900 mb-1">Demo Credentials</p>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span className="font-mono">admin@parking.com</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span className="font-mono">admin123</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Use these credentials to access the demo dashboard
                  </p>
                </div>
              </div>
            </form>

            {/* Features Grid - Optional */}
            <div className="mt-10 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs font-medium text-gray-900">Real-time Data</div>
                <div className="text-xs text-gray-500">Live updates</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs font-medium text-gray-900">Secure Access</div>
                <div className="text-xs text-gray-500">Encrypted</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs font-medium text-gray-900">Full Control</div>
                <div className="text-xs text-gray-500">Admin tools</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;