import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrandingProvider } from './context/BrandingContext';
import { Toaster } from 'sonner';
import { CodexProvider } from './context/CodexContext';
import { OfficeProvider } from './context/OfficeContext';
import { RegionProvider } from './context/RegionContext';
import { RegistryProvider } from './context/RegistryContext';
import { UserProvider } from './context/UserContext';
import { ConfirmationProvider } from './context/ConfirmationContext';
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
import SystemBranding from './pages/super-admin/SystemBranding'; // <--- NEW IMPORT
import UserList from './pages/super-admin/UserList';
import OfficeManager from './pages/super-admin/OfficeManager';
import Archive from './pages/archive/Archive';

// --- SECURITY COMPONENT ---
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-cyan-500 font-bold">Initializing...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn(`[ACCESS DENIED] User: ${user.role} -> Target: ${location.pathname}`);
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
      <Toaster richColors position="top-right" duration={3000} />
      <BrandingProvider> {/* Wrap everything in Branding */}
        <AuthProvider>
          <RegistryProvider>
            <RegionProvider>
              <OfficeProvider>
                <CodexProvider>
                  <UserProvider>
                    <ConfirmationProvider>
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
                              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'REGIONAL_ADMIN', 'ADMIN']}>
                                <UserList />
                              </ProtectedRoute>
                            } />
                            <Route path="regions" element={
                              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                                <RegionManager />
                              </ProtectedRoute>
                            } />
                            <Route path="audit" element={
                              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'REGIONAL_ADMIN', 'ADMIN']}>
                                <AuditTrails />
                              </ProtectedRoute>
                            } />

                            {/* --- NEW BRANDING ROUTE --- */}
                            <Route path="branding" element={
                              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                                <SystemBranding />
                              </ProtectedRoute>
                            } />

                            {/* --- OFFICE MANAGEMENT ROUTE --- */}
                            <Route path="offices" element={
                              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'REGIONAL_ADMIN', 'ADMIN']}>
                                <OfficeManager />
                              </ProtectedRoute>
                            } />

                            {/* 2. REGIONAL ADMIN ROUTES */}
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

                            {/* 4. SHARED ROUTES */}
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
                            <Route path="archive" element={
                              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'REGIONAL_ADMIN', 'ADMIN', 'STAFF']}>
                                <Archive />
                              </ProtectedRoute>
                            } />

                            {/* Default Fallback */}
                            <Route index element={<Navigate to="/login" replace />} />
                          </Route>

                          {/* Catch All */}
                          <Route path="*" element={<Navigate to="/login" replace />} />
                        </Routes>
                      </Router>
                    </ConfirmationProvider>
                  </UserProvider>
                </CodexProvider>
              </OfficeProvider>
            </RegionProvider>
          </RegistryProvider>
        </AuthProvider>
      </BrandingProvider>
    </ErrorBoundary>
  );
}

export default App;