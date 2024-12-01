import { createContext, useContext, useState, useEffect } from 'react';
import { auth, authMethods } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function signup(email, password) {
    return authMethods.createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return authMethods.signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return authMethods.signOut(auth);
  }

  function resetPassword(email) {
    return authMethods.sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    const unsubscribe = authMethods.onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    signup,
    login,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
