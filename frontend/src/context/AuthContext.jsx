import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  signUpUser, 
  loginUser, 
  loginWithGoogle, 
  logoutUser, 
  resetPassword,
  updateUser
} from '../services/firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const checkSession = async () => {
    try {
      const response = await fetch(
        "http://localhost/savebite/backend/auth/session.php",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success && data.loggedIn) {
        const user = {
          uid: String(data.user.id),
          email: data.user.email,
          displayName: data.user.name,
          role: data.user.role,
          photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
            data.user.name
          )}`,
        };

        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Session check failed:", error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  checkSession();
}, []);

const signUp = async (email, password, displayName) => {
  const result = await signUpUser(email, password, displayName);

  setCurrentUser(result.user);

  return result;
};

  const login = async (email, password) => {
  const result = await loginUser(email, password);

  setCurrentUser(result.user);

  return result;
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
    signUp,
    login,
    loginWithGoogle: signInGoogle,
    logout,
    resetPassword: sendPasswordReset,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
