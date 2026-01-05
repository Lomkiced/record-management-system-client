import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// --- ICONS ---
const Icons = {
  Shield: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  UserCog: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  User: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Lock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
};

const ROLES = [
  {
    id: 'super',
    label: 'Super Admin',
    desc: 'Central Command',
    username: 'super', // Default for auto-fill
    color: 'from-purple-600 to-indigo-600',
    shadow: 'shadow-purple-500/30',
    ring: 'focus:ring-purple-500',
    icon: Icons.Shield
  },
  {
    id: 'admin',
    label: 'Regional Admin',
    desc: 'Region 1 Office',
    username: 'admin',
    color: 'from-blue-600 to-cyan-600',
    shadow: 'shadow-blue-500/30',
    ring: 'focus:ring-blue-500',
    icon: Icons.UserCog
  },
  {
    id: 'staff',
    label: 'Staff Member',
    desc: 'Encoder / Staff',
    username: 'staff',
    color: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-emerald-500/30',
    ring: 'focus:ring-emerald-500',
    icon: Icons.User
  }
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [credential, setCredential] = useState(ROLES[0].username); // Changed 'email' to 'credential'
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setCredential(role.username); // Auto-fill username instead of email
    setPassword('password123'); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // We send 'credential' which will be mapped to 'username' in AuthContext
    const success = await login(credential, password);
    
    if (success) {
      navigate('/dashboard');
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center relative overflow-hidden transition-opacity duration-700 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Backgrounds */}
      <div className={`absolute inset-0 bg-gradient-to-br transition-colors duration-1000 ${selectedRole.id === 'super' ? 'from-slate-900 via-purple-900 to-slate-900' : selectedRole.id === 'admin' ? 'from-slate-900 via-blue-900 to-slate-900' : 'from-slate-900 via-emerald-900 to-slate-900'}`}></div>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] transition-colors duration-1000 ${selectedRole.id === 'super' ? 'bg-purple-600/30' : selectedRole.id === 'admin' ? 'bg-blue-600/30' : 'bg-emerald-600/30'}`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] transition-colors duration-1000 ${selectedRole.id === 'super' ? 'bg-indigo-600/30' : selectedRole.id === 'admin' ? 'bg-cyan-600/30' : 'bg-teal-600/30'}`}></div>

      <div className="relative z-10 w-full max-w-5xl h-auto md:h-[600px] bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 flex flex-col md:flex-row overflow-hidden m-4">
        
        {/* Left Panel: Role Selector */}
        <div className="w-full md:w-5/12 bg-black/20 p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">DOST-RMS</h1>
            <p className="text-white/50 text-sm mt-2">Records Management System</p>
            <p className="text-white/30 text-xs uppercase tracking-widest mt-1">Version 2.5 • Build 2025</p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Select Access Level</p>
            {ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border group text-left relative overflow-hidden ${
                  selectedRole.id === role.id ? 'bg-white/10 border-white/20 shadow-lg scale-105' : 'bg-transparent border-transparent hover:bg-white/5 opacity-60 hover:opacity-100'
                }`}
              >
                {selectedRole.id === role.id && <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${role.color}`}></div>}
                <div className={`p-3 rounded-lg bg-gradient-to-br ${role.color} text-white shadow-lg`}><role.icon /></div>
                <div><h3 className="text-white font-bold text-sm">{role.label}</h3><p className="text-white/50 text-xs">{role.desc}</p></div>
                {selectedRole.id === role.id && <div className="ml-auto text-white/50"><Icons.ChevronRight /></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel: Login Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-white/95 relative">
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${selectedRole.color} opacity-10 rounded-bl-[100px] transition-all duration-500`}></div>

          <div className="max-w-sm mx-auto w-full relative z-10">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-800">Welcome Back</h2>
              <p className="text-slate-500 mt-2">Authenticating as <span className={`font-bold text-transparent bg-clip-text bg-gradient-to-r ${selectedRole.color}`}>{selectedRole.label}</span></p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Username or Email</label>
                <div className="relative">
                  {/* --- FIX: CHANGED TYPE="EMAIL" TO TYPE="TEXT" --- */}
                  <input 
                    type="text" 
                    required
                    className={`w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:bg-white transition-all ${selectedRole.ring}`}
                    placeholder="username or email@dost.gov.ph"
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.User /></div>
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <input 
                    type="password" 
                    required
                    className={`w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:bg-white transition-all ${selectedRole.ring}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><Icons.Lock /></div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-bold text-white text-sm uppercase tracking-widest shadow-lg transform active:scale-[0.98] transition-all duration-300 bg-gradient-to-r ${selectedRole.color} ${selectedRole.shadow} ${isLoading ? 'opacity-80 cursor-wait' : 'hover:shadow-xl hover:-translate-y-1'}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Verifying Credentials...
                  </div>
                ) : 'Access Secure Portal'}
              </button>
            </form>

            <div className="mt-8 text-center"><p className="text-xs text-slate-400">Protected by DOST Enterprise Security</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;