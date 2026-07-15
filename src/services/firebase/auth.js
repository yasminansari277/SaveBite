import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, isSimulationMode } from './config';

// ----------------- SIMULATION MODE EVENTS & SESSION STATE -----------------
let authCallbacks = [];

const notifyAuthChange = (user) => {
  authCallbacks.forEach(cb => {
    try {
      cb(user);
    } catch (err) {
      console.error('Error running auth observer:', err);
    }
  });
};

const getSimulatedUsers = () => {
  const users = localStorage.getItem('savebite_users');
  return users ? JSON.parse(users) : [];
};

const saveSimulatedUser = (user) => {
  const users = getSimulatedUsers();
  if (!users.some(u => u.uid === user.uid)) {
    users.push(user);
    localStorage.setItem('savebite_users', JSON.stringify(users));
  }
};

// 1. Sign Up
export const signUpUser = async (email, password, displayName) => {
  if (isSimulationMode) {
    const users = getSimulatedUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('auth/email-already-in-use');
    }
    
    const newUser = {
      uid: 'sim_' + Math.random().toString(36).substr(2, 9),
      email: email,
      displayName: displayName || email.split('@')[0],
      photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName || email)}`,
      role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
      createdAt: new Date().toISOString()
    };
    
    saveSimulatedUser(newUser);
    localStorage.setItem('savebite_current_user', JSON.stringify(newUser));
    notifyAuthChange(newUser);
    return { user: newUser };
  } else {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, {
      displayName: displayName,
      photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName || email)}`
    });
    return userCredential;
  }
};

// 2. Log In
export const loginUser = async (email, password) => {
  if (isSimulationMode) {
    // For testing, let's create a default admin if signing in with admin@savebite.com
    if (email.toLowerCase() === 'admin@savebite.com' && password === 'admin123') {
      const adminUser = {
        uid: 'sim_admin_id',
        email: 'admin@savebite.com',
        displayName: 'SaveBite Admin',
        photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=admin',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      saveSimulatedUser(adminUser);
      localStorage.setItem('savebite_current_user', JSON.stringify(adminUser));
      notifyAuthChange(adminUser);
      return { user: adminUser };
    }

    const users = getSimulatedUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('auth/user-not-found');
    }
    
    localStorage.setItem('savebite_current_user', JSON.stringify(user));
    notifyAuthChange(user);
    return { user };
  } else {
    return await signInWithEmailAndPassword(auth, email, password);
  }
};

// 3. Google Login
export const loginWithGoogle = async () => {
  if (isSimulationMode) {
    const mockGoogleUser = {
      uid: 'sim_google_' + Math.random().toString(36).substr(2, 9),
      email: 'eco.champion@gmail.com',
      displayName: 'Eco Champion',
      photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=eco-champion',
      role: 'user',
      createdAt: new Date().toISOString()
    };
    saveSimulatedUser(mockGoogleUser);
    localStorage.setItem('savebite_current_user', JSON.stringify(mockGoogleUser));
    notifyAuthChange(mockGoogleUser);
    return { user: mockGoogleUser };
  } else {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  }
};

// 4. Log Out
export const logoutUser = async () => {
  if (isSimulationMode) {
    localStorage.removeItem('savebite_current_user');
    notifyAuthChange(null);
    return true;
  } else {
    await signOut(auth);
  }
};

// 5. Forgot Password
export const resetPassword = async (email) => {
  if (isSimulationMode) {
    console.log(`Simulation: Password reset email sent to ${email}`);
    return true;
  } else {
    await sendPasswordResetEmail(auth, email);
  }
};

// 6. Observe Auth Changes
export const onAuthStateChangedListener = (callback) => {
  if (isSimulationMode) {
    authCallbacks.push(callback);
    
    // Send current state immediately
    const userStr = localStorage.getItem('savebite_current_user');
    const user = userStr ? JSON.parse(userStr) : null;
    callback(user);
    
    // Support multi-tab syncing via storage event
    const handleStorageChange = (e) => {
      if (e.key === 'savebite_current_user') {
        const u = e.newValue ? JSON.parse(e.newValue) : null;
        callback(u);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Return unsubscribe function
    return () => {
      authCallbacks = authCallbacks.filter(cb => cb !== callback);
      window.removeEventListener('storage', handleStorageChange);
    };
  } else {
    return onAuthStateChanged(auth, callback);
  }
};
