import { useState } from 'react';
import RecordModal from '../../components/registry/RecordModal'; // Import your modal
import { useAuth } from '../../context/AuthContext';

// --- ICONS ---
const Icons = {
  Plus: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
  Document: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  Clock: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Check: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

const StaffDashboard = () => {
  const { user } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // --- 1. SAFE NAME LOGIC (Fixes the Crash) ---
  const getDisplayName = () => {
    if (!user) return 'Staff Member';
    // Prioritize Name -> Username -> Fallback
    const rawName = user.name || user.full_name || user.username || 'Colleague';
    return rawName.split(' ')[0]; // Safe split
  };

  // --- 2. TIME-BASED GREETING ---
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50/50 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                {getGreeting()}, <span className="text-indigo-600">{getDisplayName()}</span>! 👋
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
                Region: <span className="font-bold text-slate-700">{user?.region || 'Unassigned'}</span> • 
                Office: <span className="font-bold text-slate-700 ml-1">{user?.office || 'General Staff'}</span>
            </p>
        </div>
        <button 
            onClick={() => setIsUploadModalOpen(true)} 
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center gap-2"
        >
            <Icons.Plus /> Upload Document
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ACTIONS & RECENT */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Action Banner */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-white/20 transition-all duration-700"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">Ready to contribute?</h2>
              <p className="text-indigo-100 mb-6 max-w-md text-sm leading-relaxed">
                Ensure all documents are classified according to the 2025 General Disposition Schedule before uploading.
              </p>
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-50 transition-colors"
              >
                Start Upload
              </button>
            </div>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-700">My Recent Submissions</h3>
                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View All</button>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                    <th className="px-6 py-3">Document Title</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {/* Placeholder Data - You can wire this to api.getRecords() later */}
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700 flex items-center gap-3">
                    <div className="p-2 bg-red-50 text-red-500 rounded-lg"><Icons.Document /></div>
                    Q1_Financial_Report.pdf
                  </td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Encoded</span></td>
                  <td className="px-6 py-4 text-right text-slate-500">Today, 10:23 AM</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700 flex items-center gap-3">
                    <div className="p-2 bg-red-50 text-red-500 rounded-lg"><Icons.Document /></div>
                    Travel_Order_Dec.pdf
                  </td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Pending</span></td>
                  <td className="px-6 py-4 text-right text-slate-500">Yesterday</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: STATS */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Performance Overview</h3>
            
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                        <Icons.Check />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">142</p>
                        <p className="text-xs font-bold text-slate-400 uppercase">Documents Encoded</p>
                    </div>
                </div>

                <div className="w-full h-px bg-slate-100"></div>

                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                        <Icons.Clock />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">3</p>
                        <p className="text-xs font-bold text-slate-400 uppercase">Pending Review</p>
                    </div>
                </div>
            </div>
          </div>

          <div className="bg-indigo-900 rounded-2xl p-6 text-white text-center">
            <p className="text-indigo-200 text-xs font-bold uppercase mb-2">System Status</p>
            <div className="inline-flex items-center gap-2 bg-indigo-800 px-4 py-2 rounded-full border border-indigo-700">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="font-bold text-sm">Online & Secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CONNECTION */}
      <RecordModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
            setIsUploadModalOpen(false);
            // Optionally trigger a refresh here if you wire up the table data
            alert("Record uploaded successfully!"); 
        }}
      />

    </div>
  );
};

export default StaffDashboard;