import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      {/* Regional Header */}
      <div className="bg-blue-600 text-white rounded-2xl p-8 mb-6 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold">{user.region} Dashboard</h1>
          <p className="text-blue-100 mt-2">Regional Operational Overview</p>
        </div>
        <div className="absolute right-10 top-5 opacity-20 text-8xl">📍</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-bold uppercase">Pending Approvals</h3>
          <p className="text-4xl font-bold text-amber-500 mt-2">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-bold uppercase">Active Projects</h3>
          <p className="text-4xl font-bold text-blue-600 mt-2">8</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-xs font-bold uppercase">Staff Online</h3>
          <p className="text-4xl font-bold text-emerald-500 mt-2">24</p>
        </div>
      </div>

      {/* Recent Regional Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 mb-4">Recent Regional Submissions</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">S{i}</div>
                <div>
                  <p className="text-sm font-bold text-gray-700">Project Alpha Report</p>
                  <p className="text-xs text-gray-500">Submitted by Staff Member</p>
                </div>
              </div>
              <span className="text-xs bg-white border px-2 py-1 rounded text-gray-600">Review</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;