import { CheckCircle2, ChevronRight, Eye, EyeOff, Lock, Sparkles, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';

const Login = () => {
  const { login } = useAuth();
  const { branding, refreshBranding } = useBranding();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);

  // FORCE REFRESH BRANDING ON MOUNT (Fixes Stale Data)
  useEffect(() => {
    refreshBranding();
  }, []);

  // Particle animation effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const createParticle = () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.2
    });

    const init = () => {
      resize();
      particles = Array.from({ length: 50 }, createParticle);
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.offsetWidth) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.offsetHeight) p.speedY *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - dist / 100)})`;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    init();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
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
    <div className="min-h-screen w-full flex bg-slate-950 font-sans overflow-hidden">

      {/* LEFT HERO PANEL */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Particle Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Gradient Background */}
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse at 30% 50%, ${branding.primaryColor}15, transparent 60%), 
                       radial-gradient(ellipse at 70% 80%, ${branding.secondaryColor}20, transparent 50%)`
        }} />

        {/* 3D Animated Orb */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-80 h-80">
            {/* Outer glow rings */}
            <div className="absolute inset-0 rounded-full animate-ping opacity-10"
              style={{ background: `radial-gradient(circle, ${branding.primaryColor}, transparent 70%)`, animationDuration: '3s' }} />
            <div className="absolute -inset-8 rounded-full animate-pulse opacity-20"
              style={{ background: `radial-gradient(circle, ${branding.secondaryColor}, transparent 60%)`, animationDuration: '4s' }} />

            {/* Main Orb */}
            <div className="absolute inset-4 rounded-full shadow-2xl animate-float"
              style={{
                background: `
                  radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.4), transparent 50%),
                  radial-gradient(ellipse at 70% 70%, ${branding.secondaryColor}80, transparent 60%),
                  linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})
                `,
                boxShadow: `
                  0 0 80px ${branding.primaryColor}40,
                  inset 0 0 60px rgba(255,255,255,0.1),
                  0 20px 60px rgba(0,0,0,0.5)
                `
              }}>
              {/* Highlight */}
              <div className="absolute top-8 left-10 w-16 h-8 bg-white/30 rounded-full blur-xl transform -rotate-45" />
            </div>

            {/* Orbiting ring */}
            <div className="absolute inset-0 animate-spin-slow">
              <div className="absolute top-1/2 left-0 w-3 h-3 -translate-y-1/2 -translate-x-1/2 rounded-full"
                style={{ background: branding.primaryColor, boxShadow: `0 0 20px ${branding.primaryColor}` }} />
            </div>
          </div>
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-12 z-10">
          {/* Top - Branding */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl p-0.5 shadow-xl"
              style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})` }}>
              <div className="w-full h-full rounded-[14px] bg-slate-950/50 backdrop-blur flex items-center justify-center">
                {branding.logoUrl ? (
                  <img src={branding.logoUrl} className="w-8 h-8 object-contain" alt="Logo" />
                ) : (
                  <Sparkles className="w-5 h-5 text-white" />
                )}
              </div>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg tracking-tight">{branding.systemName}</h2>
              <p className="text-slate-500 text-xs font-medium">{branding.orgName}</p>
            </div>
          </div>

          {/* Center - Welcome Text */}
          <div className="max-w-md">
            <h1 className="text-5xl font-black text-white leading-tight mb-4">
              Welcome
              <span className="block text-transparent bg-clip-text"
                style={{ backgroundImage: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})` }}>
                Back
              </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">{branding.welcomeMsg}</p>
          </div>

          {/* Bottom - Features */}
          <div className="flex gap-6">
            {[
              { label: 'Secure', desc: '256-bit encryption' },
              { label: 'Fast', desc: 'Instant access' },
              { label: 'Reliable', desc: '99.9% uptime' }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4">
                <p className="text-white font-bold text-sm">{item.label}</p>
                <p className="text-slate-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT LOGIN PANEL */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Mobile background gradient */}
        <div className="lg:hidden absolute inset-0" style={{
          background: `radial-gradient(ellipse at 50% 0%, ${branding.primaryColor}15, transparent 60%)`
        }} />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-xl mb-4"
              style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})` }}>
              {branding.logoUrl ? (
                <img src={branding.logoUrl} className="w-10 h-10 object-contain" alt="Logo" />
              ) : (
                <Sparkles className="w-7 h-7 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-white">{branding.systemName}</h1>
            <p className="text-slate-500 text-sm mt-1">{branding.welcomeMsg}</p>
          </div>

          {/* Login Card */}
          <div className={`bg-slate-900/50 backdrop-blur-2xl border border-slate-800/50 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden transition-all duration-700 ${status === 'success' ? 'scale-95' : 'scale-100'}`}>

            {/* Form Container */}
            <div className={`p-8 lg:p-10 transition-all duration-500 ${status === 'success' ? 'opacity-0 scale-95' : 'opacity-100'}`}>
              <div className="hidden lg:block mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
                <p className="text-slate-500 text-sm">Enter your credentials to access the system</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div className="relative">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${focusedField === 'username' || formData.username ? 'scale-110' : ''}`}
                    style={{ color: focusedField === 'username' ? branding.primaryColor : '#64748b' }}>
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-slate-950/50 border-2 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 outline-none transition-all duration-300 font-medium"
                    style={{
                      borderColor: focusedField === 'username' ? branding.primaryColor : 'rgba(51, 65, 85, 0.5)',
                      boxShadow: focusedField === 'username' ? `0 0 20px ${branding.primaryColor}20` : 'none'
                    }}
                  />
                </div>

                {/* Password Field */}
                <div className="relative">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${focusedField === 'password' || formData.password ? 'scale-110' : ''}`}
                    style={{ color: focusedField === 'password' ? branding.primaryColor : '#64748b' }}>
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-slate-950/50 border-2 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-slate-600 outline-none transition-all duration-300 font-medium tracking-widest"
                    style={{
                      borderColor: focusedField === 'password' ? branding.primaryColor : 'rgba(51, 65, 85, 0.5)',
                      boxShadow: focusedField === 'password' ? `0 0 20px ${branding.primaryColor}20` : 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Error Message */}
                {status === 'error' && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 animate-shake">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <p className="text-sm font-medium text-red-400">{errorMessage}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full relative group overflow-hidden rounded-2xl p-[2px] transition-all duration-300 active:scale-[0.98] disabled:opacity-70"
                  style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})` }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(135deg, ${branding.secondaryColor}, ${branding.primaryColor})` }} />
                  <div className="relative bg-slate-900 group-hover:bg-transparent rounded-[14px] px-8 py-4 transition-all duration-300">
                    {status === 'loading' ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                          ))}
                        </div>
                        <span className="text-white font-semibold">Authenticating</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-white font-semibold group-hover:tracking-wider transition-all">Continue</span>
                        <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </div>
                </button>
              </form>
            </div>

            {/* Success State */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-700 ${status === 'success' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {/* Success Icon */}
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full flex items-center justify-center animate-scale-in"
                  style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})` }}>
                  <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
                </div>
                <div className="absolute inset-0 rounded-full animate-ping opacity-30"
                  style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.secondaryColor})` }} />
              </div>

              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold text-white">Access Granted</h3>
                <div className="w-48 bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                    style={{
                      width: `${scanProgress}%`,
                      background: `linear-gradient(90deg, ${branding.primaryColor}, ${branding.secondaryColor})`
                    }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
                <p className="text-slate-500 text-sm font-medium">
                  {scanProgress < 100 ? 'Preparing your session...' : 'Redirecting...'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-600 text-xs font-medium mt-8 lg:hidden">{branding.orgName}</p>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-scale-in { animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-shimmer { animation: shimmer 1.5s infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
};

export default Login;