import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// --- ICONS ---
const Icons = {
  User: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Lock: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Eye: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  EyeOff: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>,
  ArrowRight: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>,
  Logo: () => <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        
        // 1. Save Session
        login(data.token, data.user);

        // 2. SMART REDIRECT (The Fix)
        // Determines exactly where to go based on the role received from DB
        setTimeout(() => {
            const role = data.user.role;
            if (role === 'SUPER_ADMIN') {
                navigate('/super-admin');
            } else if (role === 'REGIONAL_ADMIN') {
                navigate('/admin');
            } else if (role === 'STAFF') {
                navigate('/staff');
            } else {
                // Fallback for unknown roles
                navigate('/');
            }
        }, 800); // Small delay for animation
        
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Login failed');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Unable to connect to server');
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-900 flex items-center justify-center font-sans selection:bg-purple-500/30">
      
      {/* ANIMATED BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* GLASS CARD */}
      <div className="relative z-10 w-full max-w-md p-6 perspective-1000">
        <div className={`bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl transition-all duration-700 ${status === 'success' ? 'opacity-0 scale-90 translate-y-10' : 'opacity-100 scale-100'}`}>
            
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25 mb-4">
                    <Icons.Logo />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tight mb-1">Welcome Back</h1>
                <p className="text-slate-400 text-sm font-medium">Enter your credentials to access the portal.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                
                <div className="space-y-1.5 group">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 group-focus-within:text-blue-400 transition-colors">Username</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors"><Icons.User /></div>
                        <input 
                            type="text" 
                            required 
                            className="w-full bg-slate-800/50 border border-slate-700 hover:border-slate-600 focus:border-blue-500 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 outline-none transition-all font-medium"
                            placeholder="username"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                        />
                    </div>
                </div>

                <div className="space-y-1.5 group">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 group-focus-within:text-purple-400 transition-colors">Password</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors"><Icons.Lock /></div>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            required 
                            className="w-full bg-slate-800/50 border border-slate-700 hover:border-slate-600 focus:border-purple-500 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-slate-600 outline-none transition-all font-medium tracking-wider"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                            {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                        </button>
                    </div>
                </div>

                {/* Status Message */}
                <div className={`h-6 flex items-center justify-center transition-all ${status === 'error' ? 'opacity-100' : 'opacity-0'}`}>
                    <p className="text-xs font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                        ⚠️ {errorMessage}
                    </p>
                </div>

                {/* Submit Button */}
                <button 
                    type="submit" 
                    disabled={status === 'loading' || status === 'success'}
                    className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-[1px] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div className="relative h-full w-full bg-slate-900 rounded-[11px] px-8 py-3.5 transition-all group-hover:bg-opacity-0">
                        <div className="flex items-center justify-center gap-2">
                            {status === 'loading' ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <span className="text-sm font-bold text-white">Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-sm font-bold text-white group-hover:tracking-wide transition-all">Sign In</span>
                                    <span className="text-white group-hover:translate-x-1 transition-transform"><Icons.ArrowRight /></span>
                                </>
                            )}
                        </div>
                    </div>
                </button>

            </form>
        </div>
        
        <div className="mt-8 text-center">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                Department of Science and Technology • Region 1
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;