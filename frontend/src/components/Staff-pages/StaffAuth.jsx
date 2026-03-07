import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { ShieldCheck, Mail, KeyRound, Loader2, ArrowLeft } from 'lucide-react';

const StaffAuth = () => {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await api.post('staff/request-otp/', { email });
      if (response.status === 200) {
        setSuccessMsg(response.data.message);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('staff/verify-otp/', { email, otp });

      if (response.status === 200) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        localStorage.setItem('user_role', response.data.user.role);
        navigate('/staff/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-zinc-100 relative overflow-hidden">
        
        <div className="text-center mb-8 relative z-10">
          <div className="bg-black w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-black/20">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900">Staff Portal</h2>
          <p className="text-zinc-500 text-sm mt-1">Secure OTP Authentication</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}
        
        {successMsg && step === 2 && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
            <p className="text-sm text-emerald-600 font-medium">{successMsg}</p>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Staff Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-zinc-400 w-5 h-5" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all" placeholder="office@lawsuite.com" required />
              </div>
            </div>
            <button type="submit" disabled={loading || !email} className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 disabled:opacity-70">
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Send Login Code"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-5 animate-in fade-in slide-in-from-right-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Enter 6-Digit Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3.5 text-zinc-400 w-5 h-5" />
                <input type="text" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all text-lg tracking-widest font-bold" placeholder="000000" required />
              </div>
              <p className="text-xs text-zinc-500 mt-2 text-center">Sent to <span className="font-semibold text-zinc-900">{email}</span></p>
            </div>
            <button type="submit" disabled={loading || otp.length !== 6} className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 disabled:opacity-70">
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Verify & Login"}
            </button>
            <button type="button" onClick={() => { setStep(1); setOtp(''); setError(''); setSuccessMsg(''); }} className="w-full text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors flex items-center justify-center gap-1 mt-4">
              <ArrowLeft className="w-3 h-3" /> Change Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default StaffAuth;