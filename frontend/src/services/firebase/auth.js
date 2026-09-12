// Authentication is intentionally session-only. Reloading the page signs the user out.
const users = [];
let currentUser = null;
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

const saveUser = (user) => {
  if (!users.some(existingUser => existingUser.uid === user.uid)) {
    users.push(user);
  }
};

const setCurrentUser = (user) => {
  currentUser = user;
  notifyAuthChange(user);
};

// 1. Sign Up
export const signUpUser = async (email, _password, displayName) => {
  if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('auth/email-already-in-use');
  }
  const user = {
    uid: 'user_' + Math.random().toString(36).slice(2, 11),
    email,
    displayName: displayName || email.split('@')[0],
    photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName || email)}`,
    role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
    createdAt: new Date().toISOString()
  };
  saveUser(user);
  setCurrentUser(user);
  return { user };
};

// 2. Log In
export const loginUser = async (email, _password) => {
  const user = users.find(candidate => candidate.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    throw new Error('auth/user-not-found');
  }
  setCurrentUser(user);
  return { user };
};

// 3. Google Login
export const loginWithGoogle = async () => {
  const user = {
    uid: 'user_google_' + Math.random().toString(36).slice(2, 11),
    email: 'eco.champion@gmail.com',
    displayName: 'Eco Champion',
    photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=eco-champion',
    role: 'user',
    createdAt: new Date().toISOString()
  };
  saveUser(user);
  setCurrentUser(user);
  return { user };
};

// 4. Log Out
export const logoutUser = async () => {
  setCurrentUser(null);
  return true;
};

// 5. Forgot Password
export const resetPassword = async (email) => {
  return Boolean(email);
};

// 6. Observe Auth Changes
export const onAuthStateChangedListener = (callback) => {
  authCallbacks.push(callback);
  callback(currentUser);
  return () => {
    authCallbacks = authCallbacks.filter(cb => cb !== callback);
  };
};

export const getUsers = () => [...users];

export const deleteUser = (uid) => {
  const index = users.findIndex(user => user.uid === uid);
  if (index >= 0) users.splice(index, 1);
};

export const updateUser = (uid, updates) => {
  const user = users.find(candidate => candidate.uid === uid);
  if (!user) return null;
  Object.assign(user, updates);
  if (currentUser?.uid === uid) setCurrentUser(user);
  return user;
};
