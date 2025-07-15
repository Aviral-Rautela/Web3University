import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { web3University_backend } from 'declarations/web3University_backend';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/Login';
import ProfileSetup from './components/ProfileSetup';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import Loader from './components/Loader';

function App() {
  const [authClient, setAuthClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      const client = await AuthClient.create();
      setAuthClient(client);
      
      const isAuthenticated = await client.isAuthenticated();
      setIsAuthenticated(isAuthenticated);
      
      if (isAuthenticated) {
        await loadUser();
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUser = async () => {
    try {
      const userData = await web3University_backend.get_user();
      setUser(userData[0] || null);
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const success = await authClient.login({
        identityProvider: process.env.DFX_NETWORK === 'ic' 
          ? 'https://identity.ic0.app' 
          : `http://localhost:4943?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}`,
        onSuccess: async () => {
          setIsAuthenticated(true);
          await loadUser();
        },
      });
      return success;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      await authClient.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleProfileCreated = async (userData) => {
    setUser(userData);
    await loadUser();
  };

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Loader />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {!isAuthenticated ? (
          <Login onLogin={handleLogin} />
        ) : !user ? (
          <ProfileSetup onProfileCreated={handleProfileCreated} />
        ) : user.role === 'Student' ? (
          <StudentDashboard user={user} onLogout={handleLogout} />
        ) : (
          <TeacherDashboard user={user} onLogout={handleLogout} />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;