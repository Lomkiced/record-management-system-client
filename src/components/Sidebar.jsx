import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';

// ... (KEEP YOUR ICONS OBJECT EXACTLY AS IT IS) ...
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
  Building: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>,
  Archive: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>,
};

// --- NAV ITEM ---
const NavItem = ({ item, isCollapsed, isActive, branding }) => (
  <div className="relative group my-1">
    <div
      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-r-lg transition-all duration-300 ${isActive ? 'opacity-100 scale-y-100' : 'bg-transparent opacity-0 scale-y-50'}`}
      style={{ backgroundColor: isActive ? branding.primaryColor : 'transparent', boxShadow: isActive ? `0 0 15px ${branding.primaryColor}` : 'none' }}
    />
    <div
      className={`relative flex items-center ${isCollapsed ? 'justify-center w-12 h-12 mx-auto' : 'px-4 py-3.5 mx-3'} rounded-xl transition-all duration-300 cursor-pointer overflow-hidden ${isActive ? 'text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5 hover:translate-x-1'}`}
      style={isActive ? { background: `linear-gradient(to right, ${branding.primaryColor}33, ${branding.secondaryColor}1a)`, borderColor: `${branding.primaryColor}33` } : {}}
    >
      {!isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}
      <span className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} style={{ color: isActive ? branding.primaryColor : 'inherit' }}>
        <item.icon className="w-5 h-5" />
      </span>
      {!isCollapsed && <span className="relative z-10 ml-3 text-sm font-medium tracking-wide truncate transition-colors duration-300">{item.label}</span>}
    </div>
    {isCollapsed && (
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-slate-800/90 backdrop-blur-md text-white text-xs font-bold rounded-lg shadow-xl border border-slate-700 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-[100]">
        {item.label}
        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-700"></div>
      </div>
    )}
  </div>
);

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { branding } = useBranding();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = useMemo(() => {
    if (!user) return [];

    // Define Menu Structure
    const ADMIN_MENU = [
      { category: "Overview", items: [{ path: "/admin", label: "Dashboard", icon: Icons.Dashboard }] },
      { category: "Governance", items: [{ path: "/registry", label: "Registry", icon: Icons.Folder }, { path: "/archive", label: "Archive", icon: Icons.Archive }, { path: "/codex", label: "Classification", icon: Icons.Book }, { path: "/users", label: "Personnel", icon: Icons.Users }] },
      { category: "Security", items: [{ path: "/audit", label: "Audit Logs", icon: Icons.Shield }] },
    ];

    const ROLE_MENUS = {
      'SUPER_ADMIN': [
        { category: 'Overview', items: [{ path: '/super-admin', label: 'Command Center', icon: Icons.Dashboard }] },
        { category: 'Governance', items: [{ path: '/regions', label: 'Regional Units', icon: Icons.Map }, { path: '/offices', label: 'Offices', icon: Icons.Building }, { path: '/registry', label: 'Registry', icon: Icons.Folder }, { path: '/archive', label: 'Archive', icon: Icons.Archive }, { path: '/codex', label: "Classification", icon: Icons.Book }, { path: '/users', label: 'Personnel', icon: Icons.Users }] },
        { category: 'Security', items: [{ path: '/audit', label: 'Audit Logs', icon: Icons.Shield }, { path: '/branding', label: 'System Branding', icon: Icons.Palette }] }
      ],
      'ADMIN': ADMIN_MENU,
      'REGIONAL_ADMIN': ADMIN_MENU,
      'STAFF': [
        { category: 'Workspace', items: [{ path: '/staff', label: 'My Dashboard', icon: Icons.Home }, { path: '/registry', label: 'Records', icon: Icons.Search }, { path: '/codex', label: 'Classifications', icon: Icons.Book }] }
      ]
    };

    const roleKey = user.role ? user.role.toUpperCase().replace(' ', '_') : 'STAFF';
    return ROLE_MENUS[roleKey] || ROLE_MENUS['STAFF'];
  }, [user]);

  if (!user) return null;

  return (
    <aside className={`${isCollapsed ? 'w-[5.5rem]' : 'w-72'} h-screen sticky top-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#0B1120] to-black border-r border-slate-800/50 backdrop-blur-xl flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] z-50 shadow-2xl shadow-black ring-1 ring-white/5`}>
      {/* HEADER */}
      <div className="h-24 flex items-center justify-center relative border-b border-slate-800/50 bg-gradient-to-b from-white/5 to-transparent">
        <div className={`flex items-center gap-3 transition-all duration-500 ${isCollapsed ? 'opacity-0 scale-90 hidden' : 'opacity-100 scale-100'}`}>
          <div className="relative group">
            <div className="absolute -inset-1 rounded-lg blur opacity-40 group-hover:opacity-75 transition duration-200" style={{ background: `linear-gradient(to right, ${branding.primaryColor}, ${branding.secondaryColor})` }}></div>
            <div className="relative w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center ring-1 ring-white/10 overflow-hidden">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <span className="text-transparent bg-clip-text font-black text-xl" style={{ backgroundImage: `linear-gradient(to right, ${branding.primaryColor}, #fff)` }}>R</span>
              )}
            </div>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight leading-none font-sans truncate w-32">{branding.systemName}</h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.25em] mt-1 pl-0.5 truncate w-32">Enterprise</p>
          </div>
        </div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${isCollapsed ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700/50 flex items-center justify-center shadow-lg shadow-blue-500/10 overflow-hidden">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
            ) : (
              <span className="font-black text-2xl" style={{ color: branding.primaryColor }}>R</span>
            )}
          </div>
        </div>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-slate-900 border border-slate-700 text-slate-400 rounded-full flex items-center justify-center hover:text-white transition-all z-50 group" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          {isCollapsed ? <Icons.ChevronRight className="w-4 h-4 group-hover:scale-110 transition-transform" /> : <Icons.ChevronLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />}
        </button>
      </div>

      {/* NAVIGATION */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 space-y-8 custom-scrollbar scroll-smooth">
        {menuItems.map((section, idx) => (
          <div key={idx} className="group/section">
            {!isCollapsed && <h3 className="px-7 mb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-fade-in transition-colors">{section.category}</h3>}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink key={item.path} to={item.path}>
                  {({ isActive }) => <NavItem item={item} isCollapsed={isCollapsed} isActive={isActive} branding={branding} />}
                </NavLink>
              ))}
            </div>
            {isCollapsed && idx !== menuItems.length - 1 && <div className="my-4 mx-auto w-8 h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>}
          </div>
        ))}
      </div>

      {/* USER DOCK */}
      <div className="p-4 border-t border-slate-800/50 bg-[#05080F]/50 backdrop-blur-sm">
        <div className={`relative bg-slate-900/40 border border-white/5 rounded-2xl p-3 transition-all duration-300 hover:border-slate-600 hover:bg-slate-800/80 hover:shadow-lg group cursor-pointer overflow-hidden ${isCollapsed ? 'justify-center' : ''} flex items-center gap-3`}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(to right, ${branding.primaryColor}1a, transparent)` }} />
          <div className={`relative shrink-0 transition-all duration-300 ${isCollapsed ? 'group-hover:opacity-0' : ''}`}>
            <div className="w-10 h-10 rounded-full p-[2px] shadow-lg" style={{ background: `linear-gradient(to bottom right, ${branding.primaryColor}, ${branding.secondaryColor})` }}>
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white">{user.username?.charAt(0).toUpperCase() || 'U'}</div>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></span>
          </div>
          {!isCollapsed && <div className="flex-1 min-w-0 relative z-10"><p className="text-sm font-bold text-white truncate group-hover:text-blue-200 transition-colors">{user.username}</p><p className="text-[10px] text-slate-400 truncate uppercase font-bold tracking-wider">{user.role === 'ADMIN' ? 'Regional Admin' : user.role.replace('_', ' ')}</p></div>}
          <button onClick={logout} title="Logout" className={`text-slate-400 hover:text-red-400 transition-all duration-300 z-20 ${isCollapsed ? 'absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-900/90 backdrop-blur-sm rounded-2xl' : 'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0'}`}><Icons.Logout className="w-5 h-5 hover:scale-110 transition-transform" /></button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;