import { ChevronRight, Eye, EyeOff, Fingerprint, Lock, ScanFace, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';

const Login = () => {
  const { login } = useAuth();
  const { branding, refreshBranding } = useBranding(); // Get refresh function
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [scanProgress, setScanProgress] = useState(0);

  // FORCE REFRESH BRANDING ON MOUNT (Fixes Stale Data)
  useEffect(() => {
    refreshBranding();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        login(data.token, data.user);

        setTimeout(() => {
          const role = data.user.role;
          switch (role) {
            case 'SUPER_ADMIN': navigate('/super-admin'); break;
            case 'REGIONAL_ADMIN':
            case 'ADMIN': navigate('/admin'); break;
            case 'STAFF': navigate('/staff'); break;
            default: navigate('/login');
          }
        }, 2500);

      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Access Denied');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Secure Connection Failed');
    }
  };

  useEffect(() => {
    if (status === 'success') {
      const interval = setInterval(() => {
        setScanProgress((prev) => (prev < 100 ? prev + 4 : 100));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [status]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0a0f1c] font-sans overflow-hidden">

      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full blur-[150px] animate-pulse duration-[4000ms]"
          style={{ backgroundColor: `${branding.primaryColor}20` }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] animate-pulse delay-1000 duration-[5000ms]"
          style={{ backgroundColor: `${branding.secondaryColor}30` }}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-100" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[400px] perspective-1000">
        <div className={`relative overflow-hidden bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 rounded-3xl shadow-2xl shadow-black/50 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${status === 'success' ? 'h-[400px]' : 'min-h-[480px]'}`}>

          {/* LOGIN FORM */}
          <div className={`absolute inset-0 p-8 flex flex-col justify-center transition-all duration-500 ${status === 'success' ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>

            <div className="mb-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-4 ring-1 ring-white/20"
                style={{ background: `linear-gradient(to bottom right, ${branding.primaryColor}, ${branding.secondaryColor})` }}>
                {branding.logoUrl ? (
                  <img src={branding.logoUrl} className="w-10 h-10 object-contain" />
                ) : (
                  <ScanFace className="w-8 h-8 text-white" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{branding.systemName}</h1>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-2">{branding.welcomeMsg}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5 group">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1" style={{ color: status === 'loading' ? 'inherit' : branding.primaryColor }}>Username</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"> <User size={18} /> </div>
                  <input
                    type="text" required
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-700 outline-none transition-all font-medium focus:ring-2"
                    style={{ '--tw-ring-color': `${branding.primaryColor}33`, '--tw-border-opacity': '1', borderColor: 'rgba(30,41,59,0.5)' }}
                    placeholder="Enter ID"
                    value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1" style={{ color: status === 'loading' ? 'inherit' : branding.primaryColor }}>Passcode</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"> <Lock size={18} /> </div>
                  <input
                    type={showPassword ? "text" : "password"} required
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-12 pr-12 text-white placeholder-slate-700 outline-none transition-all font-medium focus:ring-2 tracking-widest"
                    style={{ '--tw-ring-color': `${branding.primaryColor}33` }}
                    placeholder="••••••••"
                    value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {status === 'error' && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                  <p className="text-xs font-bold text-red-400">{errorMessage}</p>
                </div>
              )}

              <button type="submit" disabled={status === 'loading'} className="w-full relative group overflow-hidden rounded-xl bg-slate-800 p-[1px] transition-all active:scale-[0.98]">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, ${branding.primaryColor}, ${branding.secondaryColor})` }} />
                <div className="relative h-full w-full bg-slate-900 group-hover:bg-opacity-0 rounded-[11px] px-8 py-4 transition-all">
                  <div className="flex items-center justify-center gap-2">
                    {status === 'loading' ? (
                      <span className="text-sm font-bold text-slate-400 animate-pulse">Authenticating...</span>
                    ) : (
                      <>
                        <span className="text-sm font-bold text-white group-hover:tracking-wide transition-all">Initialize Session</span>
                        <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </div>
              </button>
            </form>
          </div>

          {/* BIOMETRIC ANIMATION */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-20 transition-all duration-700 ${status === 'success' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="relative mb-8">
              <div className="relative z-10" style={{ color: branding.primaryColor, filter: `drop-shadow(0 0 15px ${branding.primaryColor}80)` }}>
                <Fingerprint size={80} strokeWidth={1} />
              </div>
              <div className="absolute top-0 left-0 w-full h-[2px] shadow-[0_0_20px_currentColor] animate-scan z-20" style={{ backgroundColor: branding.primaryColor, color: branding.primaryColor }}></div>
              <div className="absolute inset-0 rounded-full border animate-ping opacity-20" style={{ borderColor: branding.primaryColor }}></div>
            </div>

            <div className="space-y-2 text-center w-64">
              <h3 className="text-lg font-bold text-white tracking-tight">Identity Verified</h3>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="h-full transition-all duration-300 ease-out" style={{ width: `${scanProgress}%`, background: `linear-gradient(to right, ${branding.secondaryColor}, ${branding.primaryColor})` }} />
              </div>
              <p className="text-[10px] font-mono mt-1 animate-pulse" style={{ color: branding.primaryColor }}>
                {scanProgress < 100 ? 'DECRYPTING ACCESS KEYS...' : 'ACCESS GRANTED'}
              </p>
            </div>
          </div>

        </div>
        <p className="text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-8">{branding.orgName}</p>
      </div>

      <style>{`
        @keyframes scan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .animate-scan { animation: scan 1.5s linear infinite; }
      `}</style>
    </div>
  );
};

export default Login;