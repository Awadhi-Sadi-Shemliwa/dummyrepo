// Local database for authorized users and permissions
const DB_KEYS = {
  AUTHORIZED_USERS: 'arc-authorized-users',
  PERMISSIONS: 'arc-permissions',
  CEO_CREDENTIALS: 'arc-ceo-credentials',
};

// Default CEO credentials (should be changed in production)
const DEFAULT_CEO = {
  email: 'ceo@arc.com',
  password: 'ceo123', // In production, this should be hashed
  name: 'CEO',
  role: 'ceo',
};

// Initialize database
const initDatabase = () => {
  // Set default CEO if not exists
  const existingCEO = localStorage.getItem(DB_KEYS.CEO_CREDENTIALS);
  if (!existingCEO) {
    localStorage.setItem(DB_KEYS.CEO_CREDENTIALS, JSON.stringify(DEFAULT_CEO));
  }

  // Initialize authorized users if not exists
  const existingUsers = localStorage.getItem(DB_KEYS.AUTHORIZED_USERS);
  if (!existingUsers) {
    localStorage.setItem(DB_KEYS.AUTHORIZED_USERS, JSON.stringify([]));
  }

  // Initialize permissions if not exists
  const existingPermissions = localStorage.getItem(DB_KEYS.PERMISSIONS);
  if (!existingPermissions) {
    localStorage.setItem(DB_KEYS.PERMISSIONS, JSON.stringify({}));
  }
};

// Get authorized users
export const getAuthorizedUsers = () => {
  try {
    const users = localStorage.getItem(DB_KEYS.AUTHORIZED_USERS);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Error reading authorized users:', error);
    return [];
  }
};

// Add authorized user (only CEO can do this)
export const addAuthorizedUser = (userData) => {
  const users = getAuthorizedUsers();
  const newUser = {
    id: crypto.randomUUID(),
    email: userData.email,
    name: userData.name,
    role: userData.role, // 'finance' or 'operations'
    createdAt: new Date().toISOString(),
    authorizedBy: userData.authorizedBy, // CEO email
  };
  users.push(newUser);
  localStorage.setItem(DB_KEYS.AUTHORIZED_USERS, JSON.stringify(users));
  return newUser;
};

// Remove authorized user
export const removeAuthorizedUser = (userId) => {
  const users = getAuthorizedUsers();
  const filtered = users.filter((u) => u.id !== userId);
  localStorage.setItem(DB_KEYS.AUTHORIZED_USERS, JSON.stringify(filtered));
};

// Check if user is authorized
export const isUserAuthorized = (email, role) => {
  const users = getAuthorizedUsers();
  return users.some(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.role === role
  );
};

// Get user by email and role
export const getUserByEmailAndRole = (email, role) => {
  const users = getAuthorizedUsers();
  return users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.role === role
  );
};

// Verify CEO credentials
export const verifyCEOCredentials = (email, password) => {
  try {
    const ceo = JSON.parse(localStorage.getItem(DB_KEYS.CEO_CREDENTIALS) || '{}');
    return (
      ceo.email.toLowerCase() === email.toLowerCase() &&
      ceo.password === password
    );
  } catch (error) {
    console.error('Error verifying CEO credentials:', error);
    return false;
  }
};

// Update CEO credentials
export const updateCEOCredentials = (email, password, name) => {
  const ceo = {
    email,
    password, // In production, hash this
    name: name || 'CEO',
    role: 'ceo',
  };
  localStorage.setItem(DB_KEYS.CEO_CREDENTIALS, JSON.stringify(ceo));
  return ceo;
};

// Get CEO info
export const getCEOInfo = () => {
  try {
    return JSON.parse(localStorage.getItem(DB_KEYS.CEO_CREDENTIALS) || '{}');
  } catch (error) {
    return null;
  }
};

// Initialize on import
initDatabase();
