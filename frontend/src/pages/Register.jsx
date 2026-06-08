import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, role);
      navigate('/marketplace');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200">
      {/* Ambient Radial Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 bg-white/[0.02] backdrop-blur-md p-10 rounded-2xl shadow-2xl border border-white/[0.08] relative z-10">
        <div>
          <h2 className="mt-2 text-center text-3xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={submitHandler}>
          {error && <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-500/20 p-3 rounded-lg backdrop-blur-sm">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                required
                className="appearance-none block w-full px-4 py-3 border border-white/[0.08] text-white bg-white/[0.03] rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-500 transition-all duration-200"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="password">Password</label>
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
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="role">Role</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-white/[0.08] text-white bg-[#0f172a] rounded-lg focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-500 transition-all duration-200"
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 focus:ring-offset-slate-950 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-blue-900/20"
            >
              Register
            </button>
          </div>
          <div className="text-sm text-center mt-6">
            <Link to="/login" className="font-medium text-slate-400 hover:text-white transition-colors duration-200">
              Already have an account? <span className="text-blue-400 hover:text-blue-300">Sign in</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
