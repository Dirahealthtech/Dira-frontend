import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Mail, Loader } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth, authAPI } from './AuthContext';


const VerifyEmail = () => {
  const [verificationStatus, setVerificationStatus] = useState('loading'); // loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const data = await authAPI.verifyEmail(token);
        
        setVerificationStatus('success');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        setVerificationStatus('error');
        setErrorMessage(error.message || 'Verification failed. The link may be invalid or expired.');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  const handleResendVerification = async () => {
    // This would typically open a modal or redirect to a page where user can enter their email
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white py-12 px-10 shadow-lg rounded-lg text-center">
          {verificationStatus === 'loading' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <Loader className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying your email...
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {verificationStatus === 'success' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Email verified successfully!
              </h2>
              <p className="text-gray-600 mb-8">
                Your email has been verified. You will be redirected to the login page in a few seconds.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 font-medium transition-colors"
              >
                Continue to Login
              </Link>
            </>
          )}

          {verificationStatus === 'error' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verification failed
              </h2>
              <p className="text-gray-600 mb-8">
                {errorMessage}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleResendVerification}
                  className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 font-medium transition-colors"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Request New Verification Email
                </button>
                <Link
                  to="/login"
                  className="w-full inline-flex justify-center items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>

        {verificationStatus === 'success' && (
          <div className="mt-8 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> You can now log in with your email and password to access all features.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;