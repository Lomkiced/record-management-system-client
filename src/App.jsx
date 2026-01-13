import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CodexProvider } from './context/CodexContext';
import { RegionProvider } from './context/RegionContext';
import { RegistryProvider } from './context/RegistryContext';
import { UserProvider } from './context/UserContext';
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/auth/Login';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import StaffDashboard from './pages/dashboard/StaffDashboard';
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard';
import Codex from './pages/registry/Codex';
import Registry from './pages/registry/Registry';
import AuditTrails from './pages/super-admin/AuditTrails';
import GlobalMap from './pages/super-admin/GlobalMap';
import RegionManager from './pages/super-admin/RegionManager';
import UserList from './pages/super-admin/UserList';

// --- SECURITY COMPONENT ---
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-slate-50 text-slate-400">Loading Access...</div>;

  // 1. Not Logged In? -> Go to Login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role Not Allowed? -> Redirect to appropriate dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn(`Access Denied. User Role: ${user.role} | Allowed: ${allowedRoles}`);
    if (user.role === 'SUPER_ADMIN') return <Navigate to="/super-admin" replace />;
    if (user.role === 'REGIONAL_ADMIN' || user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'STAFF') return <Navigate to="/staff" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RegistryProvider>
          <RegionProvider>
            <CodexProvider>
              <UserProvider>
                <Router>
                  <Routes>
                    {/* Public Route */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected Application Routes */}
                    <Route path="/" element={<MainLayout />}>
                      
                      {/* 1. SUPER ADMIN ROUTES */}
                      <Route path="super-admin" element={
                        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                          <SuperAdminDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="global-map" element={
                        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                          <GlobalMap />
                        </ProtectedRoute>
                      } />
                      <Route path="users" element={
                        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                          <UserList />
                        </ProtectedRoute>
                      } />
                      <Route path="regions" element={
                        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                          <RegionManager />
                        </ProtectedRoute>
                      } />
                      <Route path="audit" element={
                        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                          <AuditTrails />
                        </ProtectedRoute>
                      } />

                      {/* 2. REGIONAL ADMIN ROUTES (FIXED: Added 'ADMIN') */}
                      <Route path="admin" element={
                        <ProtectedRoute allowedRoles={['REGIONAL_ADMIN', 'ADMIN', 'SUPER_ADMIN']}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      } />

                      {/* 3. STAFF ROUTES */}
                      <Route path="staff" element={
                        <ProtectedRoute allowedRoles={['STAFF', 'REGIONAL_ADMIN', 'ADMIN', 'SUPER_ADMIN']}>
                          <StaffDashboard />
                        </ProtectedRoute>
                      } />

                      {/* 4. SHARED ROUTES (FIXED: Added 'ADMIN') */}
                      <Route path="registry" element={
                        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'REGIONAL_ADMIN', 'ADMIN', 'STAFF']}>
                          <Registry />
                        </ProtectedRoute>
                      } />
                      <Route path="codex" element={
                        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'REGIONAL_ADMIN', 'ADMIN', 'STAFF']}>
                          <Codex />
                        </ProtectedRoute>
                      } />

                      {/* Default Fallback */}
                      <Route index element={<Navigate to="/login" replace />} />
                    </Route>

                    {/* Catch All */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                  </Routes>
                </Router>
              </UserProvider>
            </CodexProvider>
          </RegionProvider>
        </RegistryProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;