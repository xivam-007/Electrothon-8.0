'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { connectToBackendServices } from '@/services/connectToBackend';

type PhoneStatus = 'idle' | 'checking' | 'not-found' | 'found';

const LoginPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneStatus, setPhoneStatus] = useState<PhoneStatus>('idle');

  const router = useRouter();
  const authContext = useAuth();

  useEffect(() => {
    if (authContext?.isAuthenticated) router.push('/dashboard');
  }, [authContext?.isAuthenticated, router]);

  // Debounced phone check
  useEffect(() => {
    if (phoneNumber.length !== 10) {
      setPhoneStatus('idle');
      return;
    }

    setPhoneStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const response = await connectToBackendServices.checkPhone(phoneNumber);
        setPhoneStatus(response.exists ? 'found' : 'not-found');
      } catch {
        setPhoneStatus('idle');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [phoneNumber]);

  const handleRequestOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!/^\d{10}$/.test(phoneNumber)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (phoneStatus === 'not-found') {
      setError('This number is not registered. Please sign up first.');
      return;
    }

    setLoading(true);
    try {
      const response = await connectToBackendServices.otpRequest({ flow: 'login', phoneNumber });
      if (response?.success) {
        setStep(2);
      } else {
        setError(response?.message || 'Failed to send OTP. Please try again.');
      }
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const response = await connectToBackendServices.verifyOTPLogin({ phoneNumber, otp });
      if (response?.success && response?.token) {
        authContext?.login(response.token);
      } else {
        setError(response?.message || 'Invalid OTP. Please try again.');
      }
    } catch {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const phoneBorderClass =
    phoneStatus === 'not-found' ? 'border-red-400 focus:ring-red-400' :
    phoneStatus === 'found'     ? 'border-green-400 focus:ring-green-400' :
    'border-slate-300 focus:ring-blue-500';

  if (authContext?.isAuthenticated) return null;

  return (
    <div className="font-semibold text-black min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col justify-center px-6 py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md">
            KP
          </div>
        </div>
        <h2 className="text-center text-4xl font-bold text-slate-900">
          {step === 1 ? 'Log in to your account' : 'Enter verification code'}
        </h2>
        <p className="mt-3 text-center text-base text-slate-600">
          Don't have an account?{' '}
          <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700 transition">
            Create one
          </Link>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-12 px-8 sm:px-12 rounded-2xl shadow-lg border border-slate-200 transition-all duration-300 hover:shadow-xl">

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {step === 1 ? (
            <form className="space-y-8" onSubmit={handleRequestOTP}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className={`block w-full pl-14 pr-28 py-4 border rounded-xl shadow-sm text-base placeholder-slate-400 focus:outline-none focus:ring-2 ${phoneBorderClass}`}
                    placeholder="Enter your number"
                  />
                  {/* Status badge inside input */}
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium">
                    {phoneStatus === 'checking'  && <span className="text-slate-400">Checking...</span>}
                    {phoneStatus === 'not-found' && <span className="text-red-500">✗ Not registered</span>}
                    {phoneStatus === 'found'     && <span className="text-green-500">✓ Registered</span>}
                  </span>
                </div>
                {/* Hint below input */}
                {phoneStatus === 'not-found' && (
                  <p className="mt-2 text-sm text-red-600">
                    This number is not registered.{' '}
                    <Link href="/signup" className="font-semibold underline">Sign up instead?</Link>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || phoneNumber.length !== 10 || phoneStatus === 'not-found' || phoneStatus === 'checking'}
                className="w-full flex justify-center py-4 px-4 rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending OTP...' : 'Get OTP'}
              </button>
            </form>

          ) : (
            <form className="space-y-8" onSubmit={handleVerifyOTP}>
              <div className="text-base text-slate-600 text-center">
                We've sent a code to <span className="font-semibold">+91 {phoneNumber}</span>
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(''); setError(''); }}
                  className="ml-2 text-blue-600 hover:underline"
                >
                  Edit
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Enter OTP</label>
                <input
                  type="text"
                  minLength={6}
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="block w-full px-4 py-4 border border-slate-300 rounded-xl text-center text-2xl tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="• • • • • •"
                />
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex justify-center py-4 px-4 rounded-xl text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Sign In'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;