import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const { user, token, profile } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // If we have a token and user, we can proceed
    // The auth context will handle fetching the profile if needed
    if (token && user) {
      setLoading(false);
    } else if (!token) {
      // If no token, we're not logged in
      setLoading(false);
    }
  }, [token, user]);

  // If we're still loading, show a loading indicator
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // If no token or no user, redirect to login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if the current route is the profile setup page
  const isProfileSetupRoute = location.pathname === '/profile-setup';
  
  // Debug: Log the user and profile data
  console.log('PrivateRoute - User:', user);
  console.log('PrivateRoute - Profile:', profile);
  
  // Check if profile is complete
  // First check the auth context's profile, then fall back to user.profile
  const userProfile = profile || user?.profile || {};
  console.log('PrivateRoute - userProfile:', userProfile);
  
  // Use isComplete flag if it exists, otherwise check required fields for backward compatibility
  const isProfileComplete = userProfile?.isComplete !== undefined 
    ? userProfile.isComplete 
    : (userProfile?.careerPath && userProfile?.currentLevel);
    
  console.log('PrivateRoute - isProfileComplete:', isProfileComplete);

  // If profile is not complete and we're not on the profile setup page, redirect to profile setup
  if (!isProfileComplete && !isProfileSetupRoute) {
    return <Navigate to="/profile-setup" state={{ from: location }} replace />;
  }

  // If profile is complete and we're on the profile setup page, redirect to dashboard
  if (isProfileComplete && isProfileSetupRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, render the protected route
  return children;
};

export default PrivateRoute;
