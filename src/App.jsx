import React, { Suspense } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// 1. IMPORT CONTEXTS
import { AuthProvider, useAuth } from './context/AuthContext';
import { CodexProvider } from './context/CodexContext';
import { RegionProvider } from './context/RegionContext';
import { RegistryProvider } from './context/RegistryContext';
import { UserProvider } from './context/UserContext';

import MainLayout from './layouts/MainLayout';

// Lazy Imports
const Dashboard = React.lazy(() => import('./pages/dashboard/index'));
// --- FIX: CHANGED 'RegistryList' TO 'Registry' ---
const Registry = React.lazy(() => import('./pages/registry/Registry')); 
const Codex = React.lazy(() => import('./pages/registry/Codex'));
const RegionManager = React.lazy(() => import('./pages/super-admin/RegionManager'));
const UserList = React.lazy(() => import('./pages/super-admin/UserList'));
const AuditTrails = React.lazy(() => import('./pages/super-admin/AuditTrails'));
const GlobalMap = React.lazy(() => import('./pages/super-admin/GlobalMap'));
const Login = React.lazy(() => import('./pages/auth/Login'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// --- PROTECTED ROUTE ---
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth(); 
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <RegionProvider>
        <CodexProvider>
          <RegistryProvider>
            <UserProvider>
            <Router>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  
                  <Route path="/" element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    
                    {/* The Registry Route will now load the correct file */}
                    <Route path="registry" element={<Registry />} />
                    <Route path="codex" element={<Codex />} />
                    
                    <Route path="regions" element={<RegionManager />} />
                    <Route path="global-map" element={<GlobalMap />} />
                    <Route path="users" element={<UserList />} />
                    <Route path="audit" element={<AuditTrails />} />
                    
                    <Route path="*" element={<div className="p-10">404 - Page Not Found</div>} />
                  </Route>
                </Routes>
              </Suspense>
            </Router>
            </UserProvider>
          </RegistryProvider>
        </CodexProvider>
      </RegionProvider>
    </AuthProvider>
  );
}

export default App;