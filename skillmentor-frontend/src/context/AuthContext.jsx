import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user and token from localStorage on initial render
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = JSON.parse(localStorage.getItem('user'));
        const savedToken = localStorage.getItem('token');
        
        if (savedUser && savedToken) {
          setUser(savedUser);
          setToken(savedToken);
          
          // Optionally fetch profile if not in localStorage
          if (!savedUser.profile) {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
            const profileRes = await fetch(`${apiBase}/api/user/profile`, {
              headers: { Authorization: `Bearer ${savedToken}` },
            });
            
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              setProfile(profileData);
              // Update user with profile data
              const updatedUser = { ...savedUser, profile: profileData };
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }
          } else {
            setProfile(savedUser.profile);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData, token) => {
    console.log('AuthContext - login - userData:', userData);
    
    // If profile data is provided, use it, otherwise keep the existing profile
    const profile = userData.profile || {};
    
    // Check if profile is complete based on required fields
    const isProfileComplete = !!(profile?.careerPath && profile?.currentLevel);
    
    // Create the user object with profile
    const userWithProfile = { 
      ...userData,
      profile: {
        ...profile,
        isComplete: isProfileComplete
      }
    };
    
    console.log('AuthContext - login - userWithProfile:', userWithProfile);
    
    // Update state
    setUser(userWithProfile);
    setToken(token);
    setProfile(userWithProfile.profile);
    
    // Update localStorage (without sensitive data)
    const { password: _, ...safeUserData } = userWithProfile;
    localStorage.setItem('user', JSON.stringify(safeUserData));
    localStorage.setItem('token', token);
    
    console.log('AuthContext - login - after state update, user:', userWithProfile);
  };

  const updateUserProfile = (profileData) => {
    if (!user) return;
    
    // Create a new user object with the updated profile
    const updatedUser = { 
      ...user, 
      profile: {
        ...user.profile, // Keep existing profile data
        ...profileData,  // Update with new profile data
        isComplete: true // Ensure isComplete is set
      } 
    };
    
    setUser(updatedUser);
    setProfile(updatedUser.profile);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setProfile(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      profile,
      login,
      logout,
      loading,
      setUser,
      updateUserProfile,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
