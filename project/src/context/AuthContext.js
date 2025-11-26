import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read current session once on mount so we don't hang on `loading`
    let mounted = true;

    async function loadInitialSession() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.data?.session?.user ?? null;
        if (!mounted) return;
        setCurrentUser(user);

        if (user) {
          try {
            const { data, error } = await supabase
              .from("users")
              .select("role")
              .eq("id", user.id)
              .limit(1)
              .single();
            if (error) {
              console.error("Failed reading user role from Supabase:", error);
              setIsAdmin(false);
            } else {
              setIsAdmin(data?.role === "admin");
            }
          } catch (e) {
            console.error("Failed reading user role from Supabase:", e);
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
      } catch (e) {
        console.error("Failed getting initial session from Supabase:", e);
        setCurrentUser(null);
        setIsAdmin(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadInitialSession();

    // Supabase auth state change listener - keeps context in sync after mount
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);

      if (user) {
        try {
          // read user profile from `users` table (expects a table named `users` with id = auth user id)
          const { data, error } = await supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .limit(1)
            .single();
          if (error) {
            console.error("Failed reading user role from Supabase:", error);
            setIsAdmin(false);
          } else {
            setIsAdmin(data?.role === "admin");
          }
        } catch (e) {
          console.error("Failed reading user role from Supabase:", e);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }

      // ensure the loading flag is turned off after real auth changes too
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener?.unsubscribe && listener.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsAdmin(false);
  };

  // We expose `user` alias so your components using `user` keep working
  const value = { currentUser, user: currentUser, isAdmin, loading, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);