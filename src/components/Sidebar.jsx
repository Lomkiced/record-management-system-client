import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- PROFESSIONAL ICON SYSTEM ---
const Icons = {
  Dashboard: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
  Globe: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12h19.5M12 2.25a15.75 15.75 0 010 19.5M12 2.25a15.75 15.75 0 000 19.5" /></svg>,
  Folder: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>,
  Users: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  Shield: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>,
  Palette: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.077-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.85 6.361a15.996 15.996 0 00-4.647 4.763m0 0c-.647.382-1.333.713-2.05 1.016" /></svg>,
  Home: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>,
  Search: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
  Book: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Map: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
  ChevronRight: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>,
  ChevronLeft: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>,
  Logout: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>,
};

// --- SUB-COMPONENTS ---
const NavItem = ({ item, isCollapsed, isActive }) => {
  return (
    <div className="relative group">
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_12px_rgba(59,130,246,0.6)] animate-pulse"></div>
      )}

      <div
        className={`relative flex items-center ${
          isCollapsed ? 'justify-center w-12 h-12 mx-auto' : 'px-4 py-3 mx-3'
        } rounded-xl transition-all duration-300 ${
          isActive
            ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-white'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        <span className={`transition-transform duration-300 ${isActive ? 'scale-110 text-blue-400' : 'group-hover:scale-105'}`}>
          <item.icon className="w-5 h-5" />
        </span>

        {!isCollapsed && (
          <span className="ml-3 text-sm font-medium tracking-wide truncate">{item.label}</span>
        )}
      </div>

      {isCollapsed && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-md shadow-xl border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {item.label}
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-b border-slate-700"></div>
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = useMemo(() => {
    if (!user) return [];
    
    // --- ADMIN MENU (Defined once, used for ADMIN and REGIONAL_ADMIN) ---
    const ADMIN_MENU = [
      { category: 'Regional Command', items: [
          { path: '/dashboard', label: 'Dashboard', icon: Icons.Dashboard }
      ]},
      { category: 'Governance', items: [
          { path: '/registry', label: 'Regional Registry', icon: Icons.Folder },
          { path: '/codex', label: 'Policy Codex', icon: Icons.Book }
      ]},
      { category: 'Workforce', items: [
          // This is the button you were missing
          { path: '/users', label: 'Unit Staff', icon: Icons.Users } 
      ]}
    ];

    const ROLE_MENUS = {
      // 1. GLOBAL OVERSEER
      'SUPER_ADMIN': [
        { category: 'Overview', items: [{ path: '/dashboard', label: 'Command Center', icon: Icons.Dashboard }, { path: '/global-map', label: 'Global Map', icon: Icons.Globe }] },
        { category: 'Governance', items: [{ path: '/regions', label: 'Regional Units', icon: Icons.Map }, { path: '/registry', label: 'Central Registry', icon: Icons.Folder }, { path: '/codex', label: 'Codex (Rules)', icon: Icons.Book }, { path: '/users', label: 'Personnel', icon: Icons.Users }] },
        { category: 'Security', items: [{ path: '/audit', label: 'Audit Logs', icon: Icons.Shield }, { path: '/branding', label: 'System Branding', icon: Icons.Palette }] }
      ],
      
      // 2. REGIONAL DIRECTOR (Admin) - HANDLES BOTH NAMING CONVENTIONS
      'ADMIN': ADMIN_MENU,
      'REGIONAL_ADMIN': ADMIN_MENU,

      // 3. OPERATIONAL STAFF
      'STAFF': [
        { category: 'Workspace', items: [{ path: '/dashboard', label: 'Dashboard', icon: Icons.Home }, { path: '/registry', label: 'File Search', icon: Icons.Search }, { path: '/codex', label: 'Reference Codex', icon: Icons.Book }] }
      ]
    };

    // Normalize: Handle spaces, underscores, and casing
    const roleKey = user.role ? user.role.toUpperCase().replace(' ', '_') : 'STAFF';
    
    return ROLE_MENUS[roleKey] || ROLE_MENUS['STAFF'];
  }, [user]);

  if (!user) return null;

  return (
    <aside 
      className={`
        ${isCollapsed ? 'w-[5rem]' : 'w-72'} 
        h-screen sticky top-0
        bg-[#0B1120] border-r border-slate-800 
        flex flex-col 
        transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]
        z-50 shadow-2xl shadow-black
      `}
    >
      {/* HEADER */}
      <div className="h-20 flex items-center justify-center relative border-b border-slate-800/50">
        <div className={`flex items-center gap-3 transition-all duration-300 ${isCollapsed ? 'opacity-0 scale-90 hidden' : 'opacity-100 scale-100'}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
             <span className="text-white font-extrabold text-sm">R</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight leading-none">DOST-RMS</h1>
            <p className="text-[9px] text-blue-400 font-bold uppercase tracking-[0.2em] mt-0.5">Enterprise</p>
          </div>
        </div>

        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${isCollapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
           <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center">
             <span className="text-blue-400 font-extrabold text-xl">R</span>
           </div>
        </div>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-900 border border-slate-700 text-slate-400 rounded-full flex items-center justify-center hover:text-white hover:border-blue-500 transition-colors shadow-lg z-50"
        >
          {isCollapsed ? <Icons.ChevronRight className="w-3 h-3" /> : <Icons.ChevronLeft className="w-3 h-3" />}
        </button>
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 space-y-8 custom-scrollbar">
        {menuItems.map((section, idx) => (
          <div key={idx}>
            {!isCollapsed && (
              <h3 className="px-7 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-fade-in">
                {section.category}
              </h3>
            )}
            
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink key={item.path} to={item.path}>
                  {({ isActive }) => (
                    <NavItem item={item} isCollapsed={isCollapsed} isActive={isActive} />
                  )}
                </NavLink>
              ))}
            </div>
            
            {isCollapsed && idx !== menuItems.length - 1 && (
              <div className="my-4 mx-auto w-8 h-px bg-slate-800"></div>
            )}
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-slate-800 bg-[#080C17]">
        <div className={`
           relative
           bg-slate-900/50 border border-slate-800 rounded-xl p-3 
           transition-all duration-300 hover:border-slate-600 hover:bg-slate-800
           group cursor-pointer
           ${isCollapsed ? 'justify-center' : ''} flex items-center gap-3
        `}>
           <div className={`relative shrink-0 transition-opacity duration-300 ${isCollapsed ? 'group-hover:opacity-0' : ''}`}>
             <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
               {user.name?.charAt(0) || 'U'}
             </div>
             <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
           </div>

           {!isCollapsed && (
             <div className="flex-1 min-w-0">
               <p className="text-sm font-bold text-white truncate">{user.name}</p>
               <p className="text-[10px] text-slate-400 truncate uppercase font-bold">{user.role.replace('_', ' ')}</p>
             </div>
           )}

           <button 
             onClick={logout} 
             title="Logout"
             className={`
               text-slate-400 hover:text-red-400 transition-all duration-300
               ${isCollapsed 
                  ? 'absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 z-10' 
                  : 'opacity-0 group-hover:opacity-100'
               }
             `}
           >
             <Icons.Logout className="w-5 h-5" />
           </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;