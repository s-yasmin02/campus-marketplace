import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStep, setResetStep] = useState(1);
  const [resetError, setResetError] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/marketplace');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setResetError('');
    try {
      await axios.post('http://localhost:5000/api/auth/check-email', { email: resetEmail });
      setResetStep(2);
    } catch (err) {
      setResetError(err.response?.data?.message || 'User not found');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', { email: resetEmail, password: newPassword });
      setSuccessMsg('Password reset successfully. You can now log in.');
      setShowForgot(false);
      setResetStep(1);
      setResetEmail('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setResetError(err.response?.data?.message || 'Password reset failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200">
      {/* Ambient Radial Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-md w-full space-y-8 bg-white/[0.02] backdrop-blur-md p-10 rounded-2xl shadow-2xl border border-white/[0.08] relative z-10">
        <div>
          <h2 className="mt-2 text-center text-3xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            {showForgot ? 'Reset Password' : 'Sign in to your account'}
          </h2>
        </div>
        
        {successMsg && <div className="text-emerald-400 text-sm text-center bg-emerald-900/20 border border-emerald-500/20 p-3 rounded-lg backdrop-blur-sm">{successMsg}</div>}
        
        {showForgot ? (
          <form className="mt-8 space-y-6" onSubmit={resetStep === 1 ? handleCheckEmail : handleResetPassword}>
            {resetError && <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-500/20 p-3 rounded-lg backdrop-blur-sm">{resetError}</div>}
            
            {resetStep === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="reset-email">Email Address</label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    className="appearance-none block w-full px-4 py-3 border border-white/[0.08] text-white bg-white/[0.03] rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-500 transition-all duration-200"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 focus:ring-offset-slate-950 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-900/20"
                >
                  Next
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="new-password">New Password</label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    className="appearance-none block w-full px-4 py-3 border border-white/[0.08] text-white bg-white/[0.03] rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-500 transition-all duration-200"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="confirm-password">Confirm Password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    className="appearance-none block w-full px-4 py-3 border border-white/[0.08] text-white bg-white/[0.03] rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-500 transition-all duration-200"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 focus:ring-offset-slate-950 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-900/20"
                >
                  Reset Password
                </button>
              </div>
            )}
            <div className="text-sm text-center mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowForgot(false);
                  setResetStep(1);
                  setResetError('');
                }}
                className="font-medium text-slate-400 hover:text-white transition-colors duration-200"
              >
                Back to login
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={submitHandler}>
            {error && <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-500/20 p-3 rounded-lg backdrop-blur-sm">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-white/[0.08] text-white bg-white/[0.03] rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-500 transition-all duration-200"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium text-slate-300" htmlFor="password">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(true);
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors duration-200"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-white/[0.08] text-white bg-white/[0.03] rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-500 transition-all duration-200"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 focus:ring-offset-slate-950 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-900/20"
              >
                Sign in
              </button>
            </div>
            <div className="text-sm text-center mt-6">
              <Link to="/register" className="font-medium text-slate-400 hover:text-white transition-colors duration-200">
                Don't have an account? <span className="text-blue-400 hover:text-blue-300">Register</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
