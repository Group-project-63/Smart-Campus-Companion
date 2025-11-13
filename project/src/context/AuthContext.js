import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user || null);

      if (user) {
        try {
          // Make sure the path matches your Firestore (users vs Users)
          const userRef = doc(db, "users", user.uid);
          const snap = await getDoc(userRef);
          const data = snap.exists() ? snap.data() : null;

          // Expect role field to be exactly "admin"
          setIsAdmin(data?.role === "admin");
        } catch (e) {
          console.error("Failed reading user role from Firestore:", e);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  const logout = async () => {
    const { signOut } = await import("firebase/auth");
    await signOut(auth);
    setCurrentUser(null);
    setIsAdmin(false);
  };

  // We expose `user` alias so your components using `user` keep working
  const value = { currentUser, user: currentUser, isAdmin, loading, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);