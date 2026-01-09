import { motion } from 'framer-motion';
import { Briefcase, Check, ChevronRight, Loader2, Lock, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// --- CONFIGURATION ---
const ROLES = [
  {
    id: 'super',
    label: 'Super Admin',
    desc: 'Central Command',
    username: 'super',
    color: 'bg-violet-600',
    gradient: 'from-violet-600 to-indigo-600',
    icon: Shield
  },
  {
    id: 'admin',
    label: 'Regional Admin',
    desc: 'Region 1 Office',
    username: 'admin',
    color: 'bg-blue-600',
    gradient: 'from-blue-600 to-cyan-600',
    icon: Briefcase
  },
  {
    id: 'staff',
    label: 'Staff Member',
    desc: 'Encoder / Staff',
    username: 'staff',
    color: 'bg-emerald-500',
    gradient: 'from-emerald-500 to-teal-500',
    icon: User
  }
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [credential, setCredential] = useState(ROLES[0].username);
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  // Update form when role changes
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setCredential(role.username);
    setPassword('password123');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay for animation effect
    await new Promise(r => setTimeout(r, 800));
    
    const success = await login(credential, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 overflow-hidden">
      
      {/* LEFT PANEL: ANIMATED HERO (Reference Style) */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        {/* Animated Background Mesh */}
        <div className={`absolute inset-0 bg-gradient-to-br ${selectedRole.gradient} opacity-20 transition-all duration-1000`} />
        
        {/* Animated Orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={`absolute -top-20 -left-20 w-96 h-96 rounded-full blur-[100px] ${selectedRole.color} opacity-40`} 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            x: [0, 100, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] bg-indigo-500/20" 
        />

        {/* Content */}
        <div className="relative z-10 p-12 text-white max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-8"
          >
            <span className="text-3xl font-bold">R</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold tracking-tight mb-6"
          >
            DOST-RMS <br/>
            <span className="text-white/60 text-4xl">Enterprise</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-white/60 leading-relaxed"
          >
            Secure, efficient, and centralized records management system. 
            Streamlining governance for Region 1.
          </motion.p>

          {/* Floating Pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm font-medium text-white/80">System Operational</span>
          </motion.div>
        </div>
      </div>

      {/* RIGHT PANEL: INTERACTIVE FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative bg-white">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-slate-500 mt-2">Please select your access level to continue.</p>
          </div>

          {/* Role Selector (Replaces Social Login) */}
          <div className="grid gap-3">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole.id === role.id;
              
              return (
                <motion.button
                  key={role.id}
                  onClick={() => handleRoleSelect(role)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`relative flex items-center gap-4 p-3 rounded-xl border transition-all duration-200 text-left group ${
                    isSelected 
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600' 
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm'}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{role.label}</p>
                    <p className="text-xs text-slate-500">{role.desc}</p>
                  </div>
                  {isSelected && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-indigo-600">
                      <Check size={18} strokeWidth={3} />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-medium">Authentication</span></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all pl-11"
                    placeholder="Enter your username"
                  />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all pl-11"
                    placeholder="••••••••"
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                </div>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 ${
                isLoading ? 'bg-indigo-400 cursor-wait' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-xl hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Verifying...
                </>
              ) : (
                <>
                  Sign In <ChevronRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-8">
            Protected by DOST Enterprise Security • v2.5
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;