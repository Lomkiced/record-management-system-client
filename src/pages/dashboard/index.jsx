import { useAuth } from '../../context/AuthContext';

// Import Views
import AdminDashboard from './AdminDashboard';
import StaffDashboard from './StaffDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  // 1. NORMALIZE ROLE STRING
  // DB sends "SUPER_ADMIN", Frontend wants "Super Admin" logic
  // We can just check the raw DB string directly for precision.
  const role = user.role.toUpperCase(); // Ensure case-insensitive safety

  // 2. ROUTING LOGIC
  switch (role) {
    case 'SUPER_ADMIN':
      return <SuperAdminDashboard />;
      
    case 'ADMIN': // Regional Admin
    case 'REGIONAL_ADMIN': // Just in case DB uses this variant
      return <AdminDashboard />;
      
    case 'STAFF':
      return <StaffDashboard />;
      
    default:
      // Fallback for unknown roles (Safety Net)
      return <StaffDashboard />;
  }
};

export default Dashboard;