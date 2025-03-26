import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import api from '../utils/Api';
import { toast } from 'react-hot-toast';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
        
        // Check for redirect URL from invitation flow
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
        if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterLogin'); // Clear it after use
          navigate(redirectUrl); // Redirect to the invitation page
        } else {
          // Default navigation based on user role
          navigate(redirectPath);
        }
        
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

  // In your Login component:
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('verified') === 'true') {
    toast.success('Email verified! You can now log in.', {
      style: {
        background: '#4CAF50',
        color: '#fff',
        padding: '16px',
        borderRadius: '0px'
      }
    });
    // Clean up the URL
    navigate('/login', { replace: true });
  }
}, []);


  return (
    <div className="min-h-screen bg-base-200 font-poppins">
      <div className="hero min-h-screen">
        <div className="hero-content flex-col lg:flex-row-reverse lg:gap-16">
          

                <div className="text-center lg:text-left lg:w-1/2">
                <div className="hidden lg:block space-y-6">
                  <h1 className="text-5xl font-bold gradient-text">
PlaniFy</h1>
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
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="input input-bordered input-lg w-full pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      )}
                    </button>
                  </div>
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
      <style>{`
  .gradient-text {
    background: linear-gradient(
      to right,
      #4f46e5, /* Indigo */
      #8b5cf6, /* Violet */
      #ec4899, /* Pink */
      #3b82f6, /* Blue */
      #4f46e5  /* Back to indigo */
    );
    background-size: 200% auto;
    color: transparent;
    -webkit-background-clip: text;
    background-clip: text;
    animation: shine 8s linear infinite;
    transition: all 0.3s ease;
  }

  /* Animation keyframes */
  @keyframes shine {
    to {
      background-position: 200% center;
    }
  }

  /* Scroll interaction - changes animation speed when scrolling */
  .gradient-text:hover {
    animation-duration: 3s;
  }

  /* Add a subtle text shadow for depth */
  .gradient-text {
    text-shadow: 0 2px 10px rgba(79, 70, 229, 0.15);
  }
`}</style>

{/* Add this script to make text respond to scroll */}
<script>
{`
  document.addEventListener('DOMContentLoaded', function() {
    const gradientText = document.querySelector('.gradient-text');
    if (!gradientText) return;
    
    let scrolling = false;
    
    window.addEventListener('scroll', function() {
      scrolling = true;
      
      if (scrolling) {
        gradientText.style.animationDuration = '2s';
        scrolling = false;
        
        clearTimeout(window.scrollFinished);
        window.scrollFinished = setTimeout(function() {
          gradientText.style.animationDuration = '8s';
        }, 200);
      }
    });
  });
`}
</script>
    </div>
  );
};

export default Login;