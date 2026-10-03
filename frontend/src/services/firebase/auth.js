// Authentication is intentionally session-only. Reloading the page signs the user out.
const users = [];
let currentUser = null;

const saveUser = (user) => {
  if (!users.some(existingUser => existingUser.uid === user.uid)) {
    users.push(user);
  }
};

const setCurrentUser = (user) => {
  currentUser = user;
};


// 1. Sign Up
export const signUpUser = async (email, password, displayName) => {
  const response = await fetch(
    "http://localhost/savebite/backend/auth/register.php",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: displayName,
        email: email,
        password: password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    const error = new Error(data.message || "Registration failed.");

    if (data.message === "Email is already registered.") {
      error.code = "auth/email-already-in-use";
    }

    throw error;
  }

  const user = {
    uid: String(data.user.id),
    email: data.user.email,
    displayName: data.user.name,
    photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
      data.user.name
    )}`,
    role: data.user.email.toLowerCase().includes("admin")
      ? "admin"
      : "user",
    createdAt: new Date().toISOString(),
  };

  setCurrentUser(user);

  return { user };
};

// 2. Log In
export const loginUser = async (email, password) => {
  const response = await fetch(
    "http://localhost/savebite/backend/auth/login.php",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    const error = new Error(data.message || "Login failed.");

    if (data.message === "User not found.") {
      error.code = "auth/user-not-found";
    } else if (data.message === "Invalid email or password.") {
      error.code = "auth/invalid-credential";
    }

    throw error;
  }

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
  const response = await fetch(
    "http://localhost/savebite/backend/auth/logout.php",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Logout failed.");
  }

  setCurrentUser(null);

  return true;
};

// 5. Forgot Password
export const resetPassword = async (email) => {
  return Boolean(email);
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
