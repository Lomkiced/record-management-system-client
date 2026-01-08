import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// --- ICONS ---
const Icons = {
  Shield: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  UserCog: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  User: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Lock: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Check: ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>,
};

// --- CONFIGURATION ---
const ROLES = [
  {
    id: 'super',
    label: 'Super Admin',
    username: 'super', // Auto-fill
    theme: {
        bg: 'from-violet-600 to-indigo-600',
        text: 'text-violet-600',
        ring: 'focus:ring-violet-500',
        light: 'bg-violet-50',
        border: 'border-violet-200'
    },
    icon: Icons.Shield
  },
  {
    id: 'admin',
    label: 'Regional Admin',
    username: 'admin',
    theme: {
        bg: 'from-blue-600 to-cyan-600',
        text: 'text-blue-600',
        ring: 'focus:ring-blue-500',
        light: 'bg-blue-50',
        border: 'border-blue-200'
    },
    icon: Icons.UserCog
  },
  {
    id: 'staff',
    label: 'Staff Member',
    username: 'staff',
    theme: {
        bg: 'from-emerald-500 to-teal-500',
        text: 'text-emerald-600',
        ring: 'focus:ring-emerald-500',
        light: 'bg-emerald-50',
        border: 'border-emerald-200'
    },
    icon: Icons.User
  }
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [credential, setCredential] = useState(ROLES[0].username);
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setCredential(role.username);
    setPassword('password123');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(credential, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-950 transition-opacity duration-1000 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* 1. DYNAMIC LIVING BACKGROUND */}
      <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-1000 ease-in-out opacity-20 ${selectedRole.id === 'super' ? 'from-violet-900/40 via-slate-900 to-indigo-900/40' : selectedRole.id === 'admin' ? 'from-blue-900/40 via-slate-900 to-cyan-900/40' : 'from-emerald-900/40 via-slate-900 to-teal-900/40'}`}></div>
      
      {/* Ambient Orbs */}
      <div className={`absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full blur-[180px] opacity-30 transition-colors duration-1000 ${selectedRole.id === 'super' ? 'bg-violet-600' : selectedRole.id === 'admin' ? 'bg-blue-600' : 'bg-emerald-600'}`}></div>
      <div className={`absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 transition-colors duration-1000 ${selectedRole.id === 'super' ? 'bg-indigo-500' : selectedRole.id === 'admin' ? 'bg-cyan-500' : 'bg-teal-500'}`}></div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

      {/* 2. GLASS CARD CONTAINER */}
      <div className="relative z-10 w-full max-w-md p-8 mx-4">
        
        {/* Header */}
        <div className="text-center mb-10">
            <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr ${selectedRole.theme.bg} p-[1px] shadow-2xl shadow-black/50 mb-6 transition-all duration-500 rotate-3 hover:rotate-6`}>
                <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center border border-white/10">
                    <span className="text-2xl font-bold text-white tracking-tighter">R</span>
                </div>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">DOST-RMS</h1>
            <p className="text-slate-400 text-sm font-medium tracking-wide uppercase opacity-70">Secure Enterprise Access</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-2 shadow-2xl ring-1 ring-white/5">
            
            {/* Role Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 mb-6 p-1.5 bg-black/20 rounded-2xl border border-white/5">
                {ROLES.map((role) => (
                    <button
                        key={role.id}
                        onClick={() => handleRoleSelect(role)}
                        className={`relative flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-300 group ${selectedRole.id === role.id ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                    >
                        <role.icon className={`w-6 h-6 mb-1 transition-transform duration-300 ${selectedRole.id === role.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                        {selectedRole.id === role.id && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        )}
                    </button>
                ))}
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                {/* Accent Top Bar */}
                <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${selectedRole.theme.bg}`}></div>

                <div className="mb-6 text-center">
                    <h2 className="text-xl font-bold text-slate-800">Welcome Back</h2>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-bold">Logging in as <span className={selectedRole.theme.text}>{selectedRole.label}</span></p>
                </div>

                <div className="space-y-5">
                    <div className="relative group">
                        <input 
                            type="text" 
                            required 
                            className={`peer w-full px-4 pt-6 pb-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none transition-all ${selectedRole.theme.ring} focus:ring-2 focus:bg-white focus:border-transparent placeholder-transparent`}
                            placeholder="Username"
                            value={credential}
                            onChange={(e) => setCredential(e.target.value)}
                            id="username"
                        />
                        <label 
                            htmlFor="username" 
                            className="absolute left-4 top-4 text-xs font-bold text-slate-400 uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-slate-500"
                        >
                            Username
                        </label>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 peer-focus:text-slate-500 transition-colors"><Icons.User className="w-5 h-5"/></div>
                    </div>

                    <div className="relative group">
                        <input 
                            type="password" 
                            required 
                            className={`peer w-full px-4 pt-6 pb-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none transition-all ${selectedRole.theme.ring} focus:ring-2 focus:bg-white focus:border-transparent placeholder-transparent`}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            id="password"
                        />
                        <label 
                            htmlFor="password" 
                            className="absolute left-4 top-4 text-xs font-bold text-slate-400 uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-slate-500"
                        >
                            Password
                        </label>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 peer-focus:text-slate-500 transition-colors"><Icons.Lock className="w-5 h-5"/></div>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className={`mt-8 w-full py-4 rounded-xl font-bold text-white text-sm uppercase tracking-widest shadow-lg transform active:scale-[0.98] transition-all duration-300 bg-gradient-to-r ${selectedRole.theme.bg} ${isLoading ? 'opacity-70 cursor-wait' : 'hover:shadow-xl hover:-translate-y-1'}`}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Authenticating...
                        </div>
                    ) : 'Access Portal'}
                </button>
            </form>
        </div>

        <div className="mt-8 text-center opacity-40 hover:opacity-100 transition-opacity">
            <p className="text-[10px] text-white font-bold tracking-widest uppercase">Department of Science and Technology</p>
            <p className="text-[10px] text-white">Region 1 Records Management System</p>
        </div>

      </div>
    </div>
  );
};

export default Login;