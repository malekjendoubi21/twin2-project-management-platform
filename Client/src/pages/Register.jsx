import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/Api';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie'; // Add this import

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation checks
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill all required fields');
      return;
    }
  
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
  
    setIsLoading(true);
    const loadingToast = toast.loading('Creating account...');
  
    try {
      console.log('Registering with:', { name, email });
      
      const response = await api.post('/api/auth/register', {
        name,
        email,
        password
      });
  
      console.log('Registration response:', response.data);
      
      // Extract userId from the response
      const { userId } = response.data;
      
      if (!userId) {
        console.error('No userId returned from server');
        throw new Error('Registration failed: No user ID returned');
      }
      
      // Set the cookie with the userId
      Cookies.set('userId', userId, { expires: 1 });
      console.log('userId cookie set:', userId);
  
      toast.dismiss(loadingToast);
      toast.success('Account created! Please verify your email.');
      
      // Important: Wait a moment before navigating
      setTimeout(() => {
        console.log('Navigating to verify-email');
        navigate('/verify-email');
      }, 1000);
  
    } catch (error) {
      console.error('Registration error:', error);
      toast.dismiss(loadingToast);
      
      // Error handling logic
      toast.error(error.response?.data?.error || 'Registration failed. Please try again.');
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
              <h1 className="text-4xl font-bold text-primary">
PlaniFy</h1>
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
                    <span className="label-text text-white">Full Name</span>
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
                    <span className="label-text text-white">Email</span>
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
                    <span className="label-text text-white">Password</span>
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
                    <span className="label-text text-white">Confirm Password</span>
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
              <a href="http://localhost:3000/api/auth/google" >
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;