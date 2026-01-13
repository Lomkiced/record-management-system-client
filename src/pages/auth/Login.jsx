import { ChevronRight, Eye, EyeOff, Fingerprint, Lock, ScanFace, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [scanProgress, setScanProgress] = useState(0);

  // --- LOGIC (Unchanged, just timing adjusted for animation) ---
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
        setStatus('success'); // Triggers Biometric Animation
        login(data.token, data.user);

        // DELAY REDIRECT to let the animation play (Professional touch)
        setTimeout(() => {
            const role = data.user.role;
            switch(role) {
                case 'SUPER_ADMIN': navigate('/super-admin'); break;
                case 'REGIONAL_ADMIN': 
                case 'ADMIN': navigate('/admin'); break;
                case 'STAFF': navigate('/staff'); break;
                default: navigate('/login');
            }
        }, 2500); // 2.5s for the full "Scan" effect

      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Access Denied');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Secure Connection Failed');
    }
  };

  // Simulate scanning progress when success
  useEffect(() => {
    if (status === 'success') {
      const interval = setInterval(() => {
        setScanProgress((prev) => (prev < 100 ? prev + 4 : 100));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [status]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0a0f1c] font-sans overflow-hidden selection:bg-cyan-500/30">
      
      {/* --- 1. AMBIENT BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse duration-[4000ms]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse delay-1000 duration-[5000ms]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-100" />
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* --- 2. MAIN CARD --- */}
      <div className="relative z-10 w-full max-w-[400px] perspective-1000">
        <div className={`
            relative overflow-hidden
            bg-slate-900/60 backdrop-blur-2xl 
            border border-slate-700/50 
            rounded-3xl shadow-2xl shadow-black/50
            transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
            ${status === 'success' ? 'h-[400px]' : 'min-h-[480px]'}
        `}>
            
            {/* STATE 1: LOGIN FORM */}
            <div className={`absolute inset-0 p-8 flex flex-col justify-center transition-all duration-500 ${status === 'success' ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
                
                {/* Header */}
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/30 mb-4 ring-1 ring-white/20">
                        <ScanFace className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Secure Access</h1>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-2">Identity Verification</p>
                </div>

                {/* Inputs */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5 group">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-cyan-400 transition-colors">Username ID</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                <User size={18} />
                            </div>
                            <input 
                                type="text" 
                                required 
                                className="w-full bg-slate-950/50 border border-slate-800 focus:border-cyan-500/50 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-700 outline-none transition-all font-medium focus:ring-2 focus:ring-cyan-500/10 focus:shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                                placeholder="Enter system ID"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5 group">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-cyan-400 transition-colors">Passcode</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                required 
                                className="w-full bg-slate-950/50 border border-slate-800 focus:border-cyan-500/50 rounded-xl py-4 pl-12 pr-12 text-white placeholder-slate-700 outline-none transition-all font-medium focus:ring-2 focus:ring-cyan-500/10 focus:shadow-[0_0_20px_rgba(6,182,212,0.1)] tracking-widest"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)} 
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-cyan-400 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Error Banner */}
                    <div className={`overflow-hidden transition-all duration-300 ${status === 'error' ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center flex items-center justify-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                            <p className="text-xs font-bold text-red-400">{errorMessage}</p>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button 
                        type="submit" 
                        disabled={status === 'loading'}
                        className="w-full relative group overflow-hidden rounded-xl bg-slate-800 p-[1px] transition-all active:scale-[0.98]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative h-full w-full bg-slate-900 group-hover:bg-opacity-0 rounded-[11px] px-8 py-4 transition-all">
                            <div className="flex items-center justify-center gap-2">
                                {status === 'loading' ? (
                                    <span className="text-sm font-bold text-slate-400 animate-pulse">Authenticating...</span>
                                ) : (
                                    <>
                                        <span className="text-sm font-bold text-white group-hover:tracking-wide transition-all">Initialize Session</span>
                                        <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </div>
                        </div>
                    </button>
                </form>
            </div>

            {/* STATE 2: BIOMETRIC ANIMATION OVERLAY */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-20 transition-all duration-700 ${status === 'success' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                
                <div className="relative mb-8">
                    {/* Glowing Fingerprint */}
                    <div className="relative z-10 text-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                        <Fingerprint size={80} strokeWidth={1} />
                    </div>
                    
                    {/* Scanning Line */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,1)] animate-scan z-20"></div>
                    
                    {/* Ripple Effect */}
                    <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping opacity-20"></div>
                </div>

                <div className="space-y-2 text-center w-64">
                    <h3 className="text-lg font-bold text-white tracking-tight">Identity Verified</h3>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 ease-out" 
                            style={{ width: `${scanProgress}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-cyan-400 font-mono mt-1 animate-pulse">
                        {scanProgress < 100 ? 'DECRYPTING ACCESS KEYS...' : 'ACCESS GRANTED'}
                    </p>
                </div>

            </div>

        </div>
        
        <p className="text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-8">
            Restricted Area • DOST Region 1
        </p>
      </div>

      {/* --- 3. CUSTOM ANIMATIONS STYLE --- */}
      <style>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
            animation: scan 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;