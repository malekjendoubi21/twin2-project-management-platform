import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import api from '../utils/Api';
import { toast } from 'react-hot-toast';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); 
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/api/auth/login', { email, password });
      const redirectPath = response.data.user.role === 'admin' 
      ? '/dashboard' 
      : '/acceuil';

      toast.loading('Logging in...', {
        style: {
          background: '#4CAF50',
          fontFamily: 'Poppins',
          color: '#fff',
          padding: '16px',
          borderRadius: '0px'
        }
      });

      setTimeout(() => {
        toast.dismiss();
        toast.success('Connexion réussie!', {
          style: {
            background: '#4CAF50',
            fontFamily: 'Poppins',
            color: '#fff',
            padding: '16px',
            borderRadius: '0px'
          }
        });
        navigate(redirectPath);
        
      }, 1000);

    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erreur de connexion';
      toast.error(errorMessage, {
        duration: 5000,
        style: {
          background: '#f44336',
          color: '#fff',
          padding: '16px',
          borderRadius: '0px'
        }
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  


  return (
    <div className="min-h-screen bg-base-200 font-poppins">
      <div className="hero min-h-screen">
        <div className="hero-content flex-col lg:flex-row-reverse lg:gap-16">
          

                <div className="text-center lg:text-left lg:w-1/2">
                <div className="hidden lg:block space-y-6">
                  <h1 className="text-5xl font-bold text-primary">ProjectFlow</h1>
                  <p className="py-6 text-xl text-base-content">
                  Enhance your productivity with our seamless project management tools.
                  </p>
                  <div className="mockup-window bg-base-300">
                  <div className="flex justify-center px-4 py-16 bg-base-200">
                    <div className="animate-pulse">🚀 Explore with us </div>
                  </div>
                  </div>
                </div>
                </div>

                {/* Right Side - Login Form */}
          <div className="card flex-shrink-0 w-full max-w-xl shadow-2xl bg-base-100">
            <div className="card-body p-8 lg:p-12">
              <h2 className="text-3xl font-bold text-center mb-8">Welcome Back</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-lg text-white">Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className="input input-bordered input-lg w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Password Input */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-lg text-white" >Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="input input-bordered input-lg w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`btn btn-primary btn-lg w-full mt-8 ${
                    isLoading ? 'loading' : ''
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <div className="divider my-8">OR</div>

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

              {/* Additional Links */}
              <div className="mt-8 text-center space-y-2">
                <Link to="/forgotPassword" className="link link-hover text-sm">
                  Forgot password?
                </Link>
                <div className="text-sm">
                  Don't have an account?{' '}
                  <Link to="/register" className="link link-primary">
                    Create account
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

export default Login;