import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { InputOTP } from '../components/ui/input-otp';
import AuthService from '../services/authService';

function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  // Try to get email from state, or from localStorage
  const initialEmail = location.state?.email || localStorage.getItem('lastVerifyEmail') || '';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resent, setResent] = useState(false);
  const [resentError, setResentError] = useState(null);

  // Save email to localStorage for convenience
  useEffect(() => {
    if (email) {
      localStorage.setItem('lastVerifyEmail', email);
    }
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    // Debug log for payload and types
    console.log('[VERIFY EMAIL] Payload:', { email, otp, typeofOtp: typeof otp });
    // Validate OTP: must be a string of 6 digits
    if (!/^[0-9]{6}$/.test(otp)) {
      setError('OTP must be a 6-digit code');
      setIsLoading(false);
      return;
    }
    try {
      await AuthService.verifyEmail({ email, otp: String(otp) });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { state: { message: 'Email verified! You can now log in.' } });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResentError(null);
    setResent(false);
    try {
      await AuthService.resendVerification(email);
      setResent(true);
    } catch (err) {
      setResentError(err.response?.data?.detail || 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Verify your email</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please enter the verification code sent to your email.
          </p>
        </div>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-green-700">Email verified! Redirecting to login...</p>
              </div>
            </div>
          </div>
        )}
        {resent && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
            <div className="ml-3">
              <p className="text-sm text-green-700">Verification code resent!</p>
            </div>
          </div>
        )}
        {resentError && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="ml-3">
              <p className="text-sm text-red-700">{resentError}</p>
            </div>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm mb-4"
              placeholder="Email address"
              disabled={!!initialEmail}
            />
          </div>
          <div className="flex flex-col items-center">
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              maxLength={6}
              pattern="[0-9]*"
              inputMode="numeric"
              autoFocus
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-center tracking-widest mb-4"
              placeholder="Enter 6-digit code"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !email || otp.length !== 6}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={isLoading || !email}
            className="w-full mt-2 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Resend Code
          </button>
        </form>
      </div>
    </div>
  );
}

export default VerifyEmailPage; 