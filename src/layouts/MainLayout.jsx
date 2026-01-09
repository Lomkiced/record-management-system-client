import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
  return (
    // UPDATED BACKGROUND: Subtle dark gradient for glass effect to shine
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden font-inter">
      
      {/* Sidebar sits on top */}
      <Sidebar />

      {/* Main Content Area - Made slightly translucent so background shows through a bit */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/90 backdrop-blur-sm transition-all">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;