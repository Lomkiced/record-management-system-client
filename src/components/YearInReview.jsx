import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
    ArrowRight,
    Binary,
    Database,
    Globe,
    Server,
    ShieldCheck
} from 'lucide-react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBranding } from '../context/BrandingContext';

// --- DOST ENTERPRISE DATA ---
const FLOATING_CARDS = [
  { 
    id: 1, 
    type: 'image', 
    src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop', 
    rotation: -6, 
    z: 1, 
    scale: 1.1, 
    position: 'top-[10%] left-[5%] md:top-[15%] md:left-[8%]',
    label: 'Region 1 Digitization' 
  },
  { 
    id: 2, 
    type: 'icon', 
    icon: ShieldCheck, 
    color: 'bg-indigo-600', 
    rotation: 12, 
    z: 0, 
    scale: 0.9, 
    position: 'top-[5%] right-[10%] md:top-[12%] md:right-[15%]' 
  },
  { 
    id: 3, 
    type: 'image', 
    src: 'https://images.unsplash.com/photo-1558494949-ef526b0042a0?q=80&w=1000&auto=format&fit=crop', 
    rotation: -8, 
    z: 0, 
    scale: 0.95, 
    position: 'bottom-[20%] left-[8%] md:bottom-[20%] md:left-[12%]',
    label: 'Secure Cloud Archiving'
  },
  { 
    id: 4, 
    type: 'widget', 
    title: 'Records Secured', 
    text: '12,450+', 
    icon: Database, 
    rotation: 6, 
    z: 2, 
    scale: 1.05, 
    position: 'bottom-[15%] right-[5%] md:bottom-[25%] md:right-[10%]' 
  },
  { 
    id: 5, 
    type: 'icon', 
    icon: Binary, 
    color: 'bg-cyan-600', 
    rotation: 4, 
    z: 0, 
    scale: 0.8, 
    position: 'top-[45%] left-[-2%] md:top-[50%] md:left-[4%]' 
  },
  { 
    id: 6, 
    type: 'icon', 
    icon: Globe, 
    color: 'bg-blue-600', 
    rotation: -10, 
    z: 0, 
    scale: 0.9, 
    position: 'top-[40%] right-[-2%] md:top-[45%] md:right-[5%]' 
  },
];

const FloatingCard = ({ data, mouseX, mouseY }) => {
  const x = useTransform(mouseX, [0, 1], [25, -25]);
  const y = useTransform(mouseY, [0, 1], [25, -25]);
  const duration = 4 + Math.random() * 3; 

  return (
    <motion.div
      style={{ x, y }} 
      className={`absolute hidden md:flex items-center justify-center rounded-3xl shadow-2xl overflow-hidden border border-white/10 ${data.position}`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: data.scale, 
        y: [0, -15, 0], 
        rotate: data.rotation 
      }}
      transition={{ 
        opacity: { duration: 1 }, 
        scale: { duration: 1 }, 
        y: { duration: duration, repeat: Infinity, ease: "easeInOut" } 
      }}
    >
      {data.type === 'image' && (
        <div className="w-32 h-32 md:w-52 md:h-52 relative group">
          <img src={data.src} className="w-full h-full object-cover" alt="System Asset" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent flex items-end p-4">
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                <span className="text-white text-[10px] font-bold uppercase tracking-widest">{data.label}</span>
             </div>
          </div>
          <div className="absolute inset-0 border-2 border-white/10 rounded-3xl" />
        </div>
      )}

      {data.type === 'icon' && (
        <div className={`w-20 h-20 md:w-28 md:h-28 flex items-center justify-center ${data.color} bg-opacity-90 backdrop-blur-xl shadow-lg border border-white/20`}>
          <data.icon className="text-white w-10 h-10 md:w-12 md:h-12 drop-shadow-md" strokeWidth={1.5} />
        </div>
      )}

      {data.type === 'widget' && (
        <div className="w-40 h-24 md:w-64 md:h-40 bg-slate-900/95 backdrop-blur-xl p-5 flex flex-col justify-between text-white border border-white/10">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 text-cyan-400">
                <data.icon size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{data.title}</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          </div>
          
          <div className="space-y-2">
             <p className="text-3xl font-bold tracking-tight">{data.text}</p>
             <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                   className="h-full bg-gradient-to-r from-cyan-500 to-blue-600" 
                   initial={{ width: 0 }} 
                   animate={{ width: '75%' }} 
                   transition={{ delay: 0.5, duration: 1.5, ease: "circOut" }} 
                />
             </div>
             <p className="text-[10px] text-slate-400 text-right">Updated 2m ago</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const YearInReview = () => {
  const containerRef = useRef(null);
  const navigate = useNavigate(); 
  
  const { branding } = useBranding(); 
  
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);
  const smoothMouseX = useSpring(rawMouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(rawMouseY, { stiffness: 50, damping: 20 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    rawMouseX.set(clientX / innerWidth);
    rawMouseY.set(clientY / innerHeight);
  };

  // --- NAME SPLITTING LOGIC ---
  // This ensures "AMIANAN" is white and "ARCHIVA" is Blue/Cyan
  const fullSystemName = branding.systemName || 'AMIANAN ARCHIVA';
  const nameParts = fullSystemName.split(' ');
  const firstName = nameParts[0]; // "AMIANAN"
  const restName = nameParts.slice(1).join(' '); // "ARCHIVA" (or anything else)

  return (
    <div 
      ref={containerRef} 
      onMouseMove={handleMouseMove} 
      className="relative min-h-screen w-full bg-slate-950 overflow-hidden font-sans selection:bg-cyan-500/30"
    >
      
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
           className="absolute inset-0 opacity-[0.03]" 
           style={{ 
             backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.3) 1px, transparent 1px)`, 
             backgroundSize: '40px 40px' 
           }}
        ></div>
        <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-blue-950/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-indigo-950/40 rounded-full blur-[120px]" />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-cyan-900/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center p-6 md:p-12">
        
        {FLOATING_CARDS.map((card) => (
           <FloatingCard 
              key={card.id} 
              data={card} 
              mouseX={smoothMouseX} 
              mouseY={smoothMouseY} 
           />
        ))}

        {/* HERO CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
          className="relative z-20 max-w-3xl w-full text-center"
        >
          <div className="relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 md:p-16 shadow-2xl overflow-hidden group">
            
            {/* Spotlight */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            
            {/* Logo Badge */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500 overflow-hidden relative">
                <div className="absolute inset-0 bg-cyan-500/10 blur-lg rounded-full"></div>
                {branding.logoUrl ? (
                  <img 
                    src={branding.logoUrl} 
                    alt="System Logo" 
                    className="w-14 h-14 object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" 
                  />
                ) : (
                  <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-blue-500">
                    {branding.systemName ? branding.systemName.charAt(0) : 'S'}
                  </span>
                )}
              </div>
            </div>

            {/* DYNAMIC TITLE LOGIC: Split Name into White / Theme Color */}
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight leading-tight mb-6 drop-shadow-2xl">
              <span className="text-white">{firstName}</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                {restName}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-xl mx-auto font-light">
              The centralized enterprise registry for <span className="text-white font-medium">{branding.orgName || 'Your Organization'}</span>.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <motion.button
                 onClick={() => navigate('/login')}
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.98 }}
                 className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-950 rounded-full font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(34,211,238,0.3)] hover:shadow-[0_0_60px_-15px_rgba(34,211,238,0.5)]"
               >
                 Access System
                 <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
               </motion.button>
               
               <div className="hidden sm:flex items-center gap-2 px-6 py-4 text-slate-400 text-sm font-mono border border-white/5 rounded-full">
                 <Server size={14} className="text-emerald-500 animate-pulse" />
                 <span>System Operational</span>
               </div>
            </div>

            {/* Bottom Credit */}
            <div className="mt-12 pt-6 border-t border-white/5 flex justify-center items-center gap-3 opacity-60">
               <span className="text-[10px] uppercase tracking-[0.2em] text-slate-300">Official Government System</span>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default YearInReview;