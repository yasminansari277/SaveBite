import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  signUpUser, 
  loginUser, 
  loginWithGoogle, 
  logoutUser, 
  resetPassword, 
  onAuthStateChangedListener 
} from '../services/firebase/auth';
import { isSimulationMode } from '../services/firebase/config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener((user) => {
      if (user) {
        // Double check roles: admin vs standard user
        const isAdmin = user.email && (
          user.email.toLowerCase() === 'admin@savebite.com' || 
          user.email.toLowerCase().includes('admin')
        );
        setCurrentUser({
          ...user,
          role: isAdmin ? 'admin' : 'user'
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email, password, displayName) => {
    return await signUpUser(email, password, displayName);
  };

  const login = async (email, password) => {
    return await loginUser(email, password);
  };

  const signInGoogle = async () => {
    return await loginWithGoogle();
  };

  const logout = async () => {
    return await logoutUser();
  };

  const sendPasswordReset = async (email) => {
    return await resetPassword(email);
  };

  const value = {
    currentUser,
    loading,
    isSimulationMode,
    signUp,
    login,
    loginWithGoogle: signInGoogle,
    logout,
    resetPassword: sendPasswordReset
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
