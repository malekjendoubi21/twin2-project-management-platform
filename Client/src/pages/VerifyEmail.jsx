import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/Api';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';

const VerifyEmail = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [hasCheckedCookie, setHasCheckedCookie] = useState(false);
  const navigate = useNavigate();
  
  // Get userId from cookies
  const userId = Cookies.get('userId');
  
  useEffect(() => {
    // Give the cookie time to be set before checking
    const timer = setTimeout(() => {
      const userId = Cookies.get('userId');
      console.log('Delayed cookie check:', userId);
      
      if (!userId && !redirectAttempted.current) {
        // Only redirect once
        redirectAttempted.current = true;
        console.log('No userId found, redirecting to register');
        navigate('/register');
        toast.error('Please register first', {
          style: {
            background: '#f44336',
            color: '#fff',
            padding: '16px',
            borderRadius: '0px'
          },
          id: 'register-first', // Add an ID to prevent duplicate toasts
        });
      }
      
      setHasCheckedCookie(true);
    }, 800); // Wait longer to ensure cookie is properly set
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  const handleResendCode = async () => {
    if (!userId) {
      toast.error('Missing user information. Please register again.');
      navigate('/register');
      return;
    }
    
    setResendLoading(true);
    try {
      await api.post('/api/auth/resend-verification', { userId });
      
      toast.success('Verification code resent successfully!', {
        style: {
          background: '#4CAF50',
          color: '#fff',
          padding: '16px',
          borderRadius: '0px'
        }
      });
      
      // Set 60 seconds countdown before allowing another resend
      setCountdown(60);
      
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to resend code', {
        style: {
          background: '#f44336',
          color: '#fff',
          padding: '16px',
          borderRadius: '0px'
        }
      });
    } finally {
      setResendLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error('Missing user information. Please register again.');
      navigate('/register');
      return;
    }
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit verification code', {
        style: {
          background: '#f44336',
          color: '#fff',
          padding: '16px',
          borderRadius: '0px'
        }
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await api.post('/api/auth/verify-email', {
        userId,
        verificationToken: verificationCode
      });
      
      // Clear userId from cookies - not localStorage
      Cookies.remove('userId');
      
      toast.success('Email verified successfully!', {
        style: {
          background: '#4CAF50',
          color: '#fff',
          padding: '16px',
          borderRadius: '0px'
        }
      });
      
      // Wait for toast to be visible
      setTimeout(() => {
        navigate('/acceuil');
      }, 1500);
      
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid verification code', {
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

  // Show loading state if userId is undefined (not found)
  if (!userId) {  // Changed from userId === null
    return (
      <div className="min-h-screen bg-base-200 font-poppins flex items-center justify-center">
        <div className="card flex-shrink-0 w-full max-w-md shadow-xl bg-base-100">
          <div className="card-body p-6 lg:p-8 text-center">
            <h2 className="text-2xl font-bold mb-6">Redirecting...</h2>
            <p className="mb-6">Please wait or <button onClick={() => navigate('/register')} className="link link-primary">return to registration</button></p>
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        </div>
      </div>
    );
  }  
  if (!hasCheckedCookie) {
    return (
      <div className="min-h-screen bg-base-200 font-poppins flex items-center justify-center">
        <div className="card flex-shrink-0 w-full max-w-md shadow-xl bg-base-100">
          <div className="card-body p-6 lg:p-8 text-center">
            <h2 className="text-2xl font-bold mb-6">Loading...</h2>
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-base-200 font-poppins flex items-center justify-center">
      <div className="card flex-shrink-0 w-full max-w-md shadow-xl bg-base-100">
        <div className="card-body p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Verify Your Email</h2>
          <p className="text-center text-base-content/80 mb-6">
            We've sent a verification code to your email address. Please enter it below to verify your account.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white">Verification Code</span>
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                className="input input-bordered input-md w-full text-center text-xl tracking-widest"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                maxLength="6"
              />
            </div>
            
            <button
              type="submit"
              className={`btn btn-primary btn-md w-full ${
                isLoading ? 'loading' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
          
          <div className="text-center mt-6">
            <p className="text-sm mb-2">Didn't receive a code?</p>
            <button
              onClick={handleResendCode}
              className="btn btn-outline btn-sm"
              disabled={resendLoading || countdown > 0}
            >
              {countdown > 0 
                ? `Resend code (${countdown}s)` 
                : resendLoading 
                  ? 'Sending...' 
                  : 'Resend Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;