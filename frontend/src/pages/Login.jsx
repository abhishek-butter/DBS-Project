import React, { useState } from 'react';
import axios from 'axios';
import { Database, ShieldCheck, KeyRound, UserCheck, AlertCircle, ArrowRight } from 'lucide-react';

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token);
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Please verify credentials or run seed script.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
      <div className="max-w-md w-full">
        {/* Course / Project Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
            <Database size={14} /> BCSE302P Database Systems Lab Project
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Attendance<span className="text-blue-500">DB</span></h1>
          <p className="text-sm text-slate-400 mt-1">Student Attendance Management System</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/50 text-white">
          <h2 className="text-xl font-bold mb-1">Sign In to Dashboard</h2>
          <p className="text-xs text-slate-400 mb-6">Enter your registered institution credentials to continue</p>

          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-xs text-red-300">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <input
                className="w-full bg-slate-950/60 border border-slate-800 text-white px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <input
                className="w-full bg-slate-950/60 border border-slate-800 text-white px-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 mt-2"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Credentials Box for Evaluator */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
              One-Click Evaluator Credentials
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@example.com', 'password123')}
                className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs text-left border border-slate-700/50 transition"
              >
                <div className="font-bold text-blue-400">Admin Account</div>
                <div className="text-[10px] text-slate-400">Full Permissions</div>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('faculty@example.com', 'password123')}
                className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs text-left border border-slate-700/50 transition"
              >
                <div className="font-bold text-emerald-400">Faculty Account</div>
                <div className="text-[10px] text-slate-400">Class Roll-call</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-500 space-y-1">
          <p>Ayush Naugariya (24BDS0076) &bull; Abhishek VS (24BCE0404)</p>
          <p>Slot D2 &bull; Database Systems Lab</p>
        </div>
      </div>
    </div>
  );
};

export default Login;