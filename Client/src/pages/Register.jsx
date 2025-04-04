import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/Api';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';

// Toast style configuration
const toastStyle = {
  success: {
    style: {
      background: '#4CAF50',
      fontFamily: 'Poppins',
      color: '#fff',
      padding: '16px',
      borderRadius: '0px'
    }
  },
  error: {
    style: {
      background: '#f44336',
      fontFamily: 'Poppins',
      color: '#fff',
      padding: '16px',
      borderRadius: '0px'
    }
  },
  loading: {
    style: {
      background: '#3498db',
      fontFamily: 'Poppins',
      color: '#fff',
      padding: '16px',
      borderRadius: '0px'
    }
  }
};

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Client-side validation that matches server-side Joi validation
  const validateForm = () => {
    // Check empty fields
    if (!name) {
      toast.error('Name is required', toastStyle.error);
      return false;
    }
    if (!email) {
      toast.error('Email is required', toastStyle.error);
      return false;
    }
    if (!password) {
      toast.error('Password is required', toastStyle.error);
      return false;
    }
    if (!confirmPassword) {
      toast.error('Please confirm your password', toastStyle.error);
      return false;
    }

    // Validate name length (2-50 characters)
    if (name.trim().length < 2) {
      toast.error('Name must be at least 2 characters long', toastStyle.error);
      return false;
    }
    if (name.trim().length > 50) {
      toast.error('Name cannot exceed 50 characters', toastStyle.error);
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Invalid email format', toastStyle.error);
      return false;
    }

    // Validate password strength (matching server pattern)
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long', toastStyle.error);
      return false;
    }
    
    // Check for at least one number and one special character
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error('Password must contain at least one number and one special character', toastStyle.error);
      return false;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match', toastStyle.error);
      return false;
    }

    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Run the validation
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    const loadingToast = toast.loading('Creating account...', toastStyle.loading);
    
    try {
      const response = await api.post('/api/auth/register', {
        name,
        email,
        password
      });
      
      // Extract userId from the response
      const { userId } = response.data;
      
      if (!userId) {
        throw new Error('Registration failed: No user ID returned');
      }
      
      // Set the cookie with the userId
      Cookies.set('userId', userId, { expires: 1 });
      
      toast.dismiss(loadingToast);
      toast.success('Account created! Please verify your email.', toastStyle.success);
      
      // Navigate to verification page
      setTimeout(() => {
        navigate('/verify-email');
      }, 1000);
      
    } catch (error) {
      toast.dismiss(loadingToast);
      
      if (error.response?.data?.error) {
        // Use the server's error message directly
        toast.error(error.response.data.error, toastStyle.error);
      } else if (error.response?.data?.details) {
        // Handle Joi validation errors from the server
        const joiErrors = error.response.data.details;
        if (Array.isArray(joiErrors) && joiErrors.length > 0) {
          // Display the first validation error
          toast.error(joiErrors[0].message, toastStyle.error);
        } else {
          toast.error('Invalid input. Please check your information.', toastStyle.error);
        }
      } else if (error.response?.status === 409) {
        toast.error('This email is already registered. Please use a different email.', toastStyle.error);
      } else {
        toast.error('Registration failed. Please try again later.', toastStyle.error);
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 font-poppins">
      <div className="hero min-h-screen">
        <div className="hero-content flex-col lg:flex-row-reverse lg:gap-12">
          
          {/* Left Side - Branding */}
          <div className="text-center lg:text-left lg:w-1/2">
            <div className="hidden lg:block space-y-4">
              <h1 className="text-4xl font-bold text-primary">PlaniFy</h1>
              <p className="py-4 text-lg text-base-content">
                Streamline your team's workflow with our intuitive project management platform.
              </p>
              <div className="mockup-window bg-base-300">
                <div className="flex justify-center px-4 py-12 bg-base-200">
                  <div className="animate-pulse">🚀 Explore with us </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Compact Registration Form */}
          <div className="card flex-shrink-0 w-full max-w-lg shadow-xl bg-base-100">
            <div className="card-body p-6 lg:p-8">
              <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Input */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-white font-medium">Full Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="input input-bordered input-md w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                </div>

                {/* Email Input */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-white font-medium">Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className="input input-bordered input-md w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                </div>

                {/* Password Input */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-white font-medium">Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="input input-bordered input-md w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                </div>

                {/* Confirm Password Input */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-white font-medium">Confirm Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="input input-bordered input-md w-full"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />

                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`btn btn-primary btn-md w-full mt-6 ${
                    isLoading ? 'loading' : ''
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Register'}
                </button>
              </form>

              <div className="divider my-6">OR</div>

              {/* Social Login */}
              <div className="flex flex-col space-y-3">
                <a href="http://localhost:3000/api/auth/google">
                  <button className="btn btn-outline btn-md gap-2 w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-10.06l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    Continue with Google
                  </button>
                </a>
              </div>

              {/* Existing Account Link */}
              <div className="mt-6 text-center space-y-2">
                <div className="text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="link link-primary">
                    Login here
                  </Link>
                </div>
              </div>
              
              {/* Password Requirements */}
              <div className="mt-6 p-4 bg-base-200 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Password Requirements:</h3>
                <ul className="list-disc pl-5 text-xs space-y-1">
                  <li>At least 8 characters long</li>
                  <li>Must contain at least one number (0-9)</li>
                  <li>Must contain at least one special character (!@#$%^&*)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;