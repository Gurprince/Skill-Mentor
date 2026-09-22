import { Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import PrivateRoute from './PrivateRoute';
import LandingPage from '../pages/LandingPage';
// Lazy load components for better performance
const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/RegisterPage'));
const ProfileSetupPage = lazy(() => import('../features/profile/ProfileSetupPage'));
const Dashboard = lazy(() => import('../features/dashboard/DashboardPage'));
const Roadmap = lazy(() => import('../features/roadmap/Roadmap'));

// Loading component for Suspense fallback  
const Loading = () => <div>Loading...</div>;

export const AppRoutes = () => (
  <Suspense fallback={<Loading />}>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route
        path="/profile-setup"
        element={
          <PrivateRoute>
            <ProfileSetupPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/roadmap"
        element={
          <PrivateRoute>
            <Roadmap />
          </PrivateRoute>
        }
      />    


      {/* Optional: Add a catch-all route for 404 pages */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  </Suspense>
);
