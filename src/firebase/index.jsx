// AuthProvider.js
import React, { useEffect, useState } from "react";
import { auth } from "./FireBase"; // Assuming you have the Firebase config in this file
import { onAuthStateChanged } from "firebase/auth";

export const AuthContext = React.createContext(AuthProvider);
// console.log("index.jsx");
export function AuthProvider({ children }) {
  // console.log("AuthProvider is connnected");

  const [currentUser, setCurrentUser] = useState(null);
  const [userLoginIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(intiializeUser);
    return unsubscribe;
  }, []);

  async function intiializeUser(user) {
    if (user) {
      setCurrentUser({ ...user });
      setUserLoggedIn(true);
    } else {
      setCurrentUser(null);
      setUserLoggedIn(false);
    }
    setLoading(false);
  }

  const value = {
    currentUser,
    userLoginIn,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
