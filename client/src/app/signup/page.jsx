'use client';
import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Validation functions
  const validateName = (name) => {
    return name.trim().length >= 2;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    let feedback = [];
    
    if (password.length >= 8) strength++;
    else feedback.push('8+ characters');
    
    if (/[a-z]/.test(password)) strength++;
    else feedback.push('lowercase');
    
    if (/[A-Z]/.test(password)) strength++;
    else feedback.push('uppercase');
    
    if (/\d/.test(password)) strength++;
    else feedback.push('number');
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    else feedback.push('special character');

    const strengthLevels = [
      { text: 'Very Weak', color: 'text-red-600' },
      { text: 'Weak', color: 'text-orange-600' },
      { text: 'Fair', color: 'text-yellow-600' },
      { text: 'Good', color: 'text-blue-600' },
      { text: 'Strong', color: 'text-green-600' }
    ];

    return {
      strength: Math.min(strength, 4),
      text: strengthLevels[strength]?.text || 'Very Weak',
      color: strengthLevels[strength]?.color || 'text-red-600',
      feedback: feedback.length > 0 ? `Missing: ${feedback.join(', ')}` : 'Strong password!'
    };
  };

  // Handle input changes with validation
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    setError('');
    
    if (value && !validateName(value)) {
      setNameError('Name must be at least 2 characters');
    } else {
      setNameError('');
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setError('');
    
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setError('');
    
    if (value && !validatePassword(value)) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError('');
    }

    // Check confirm password match
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else if (confirmPassword) {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setError('');
    
    if (value && value !== password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleManualSignup = async () => {
    // Clear previous messages
    setError('');
    setSuccess('');
    
    // Validate inputs
    let hasErrors = false;
    
    if (!name) {
      setNameError('Name is required');
      hasErrors = true;
    } else if (!validateName(name)) {
      setNameError('Name must be at least 2 characters');
      hasErrors = true;
    }
    
    if (!email) {
      setEmailError('Email is required');
      hasErrors = true;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      hasErrors = true;
    }
    
    if (!password) {
      setPasswordError('Password is required');
      hasErrors = true;
    } else if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters');
      hasErrors = true;
    }
    
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      hasErrors = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasErrors = true;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      hasErrors = true;
    }
    
    if (hasErrors) return;
    
    setIsLoading(true);
    
    try {
      const res = await axios.post('/api/auth/signup-manual', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password
      });
      
      setSuccess('Account created successfully! Redirecting to login...');
      
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err?.response?.data?.message || 'Signup failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleSuccess = async (res) => {
    setIsGoogleLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const idToken = res.credential;
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/google`,
        { idToken },
        { withCredentials: true }
      );
      
      setSuccess('Account created successfully! Redirecting...');
      
      setTimeout(() => {
        window.location.href = '/chat';
      }, 1500);
      
    } catch (err) {
      const errorMessage = err?.response?.data?.error || 'Google signup failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const onGoogleError = () => {
    setError('Google signup failed. Please try again.');
    setIsGoogleLoading(false);
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Sign up to get started with your account</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Status Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          {/* Manual Signup Form */}
          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={handleNameChange}
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    nameError 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {nameError && (
                <p className="mt-1 text-sm text-red-600">{nameError}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    emailError 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={handlePasswordChange}
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    passwordError 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Password Strength</span>
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.strength === 0 ? 'bg-red-500' :
                        passwordStrength.strength === 1 ? 'bg-orange-500' :
                        passwordStrength.strength === 2 ? 'bg-yellow-500' :
                        passwordStrength.strength === 3 ? 'bg-blue-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.strength + 1) * 20}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{passwordStrength.feedback}</p>
                </div>
              )}
              
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    confirmPasswordError 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="mt-1 text-sm text-red-600">{confirmPasswordError}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1"
              />
              <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Sign Up Button */}
            <button
              type="button"
              onClick={handleManualSignup}
              disabled={isLoading || nameError || emailError || passwordError || confirmPasswordError}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500 bg-white">or sign up with</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Signup */}
          <div className="relative">
            {isGoogleLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-sm text-gray-600">Creating account with Google...</span>
                </div>
              </div>
            )}
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={onGoogleError}
              theme="outline"
              size="large"
              width="100%"
              text="signup_with"
            />
          </div>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-500">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}