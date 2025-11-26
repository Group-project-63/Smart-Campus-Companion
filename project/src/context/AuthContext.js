import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read current session once on mount
    let mounted = true;
    let initialLoadDone = false;

    async function loadInitialSession() {
      try {
        console.log("🔄 Loading initial session...");
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("❌ Error getting session:", error);
          if (mounted) {
            setCurrentUser(null);
            setIsAdmin(false);
          }
        } else {
          const user = data?.session?.user ?? null;
          console.log("👤 Session user:", user ? user.email : "null");
          if (mounted) {
            setCurrentUser(user);
            setLoading(false); // UI loads instantly after session
            initialLoadDone = true;
            // Fetch admin role in background
            if (user) {
              supabase
                .from("users")
                .select("role")
                .eq("id", user.id)
                .limit(1)
                .single()
                .then(({ data: roleData, error: roleError }) => {
                  if (!roleError && mounted) {
                    setIsAdmin(roleData?.role === "admin");
                    console.log("✅ Admin status:", roleData?.role === "admin");
                  } else if (mounted) {
                    setIsAdmin(false);
                  }
                })
                .catch((e) => {
                  console.error("Error fetching user role:", e);
                  if (mounted) setIsAdmin(false);
                });
            } else {
              setIsAdmin(false);
            }
          }
        }
      } catch (e) {
        console.error("❌ Failed loading initial session:", e);
        if (mounted) {
          setCurrentUser(null);
          setIsAdmin(false);
          setLoading(false);
          initialLoadDone = true;
        }
      }
    }

    // Always complete initial load within 5 seconds
    const initialLoadTimeout = setTimeout(() => {
      if (!initialLoadDone && mounted) {
        console.warn("⏱️ Initial session load timed out");
        setLoading(false);
        initialLoadDone = true;
      }
    }, 5000);

    loadInitialSession();

    // Set up auth state listener for changes AFTER initial load
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔔 Auth state changed:", event);
      const user = session?.user ?? null;
      
      if (mounted) {
        setCurrentUser(user);
        setLoading(false); // UI loads instantly after auth change
        // Fetch admin role in background
        if (user) {
          supabase
            .from("users")
            .select("role")
            .eq("id", user.id)
            .limit(1)
            .single()
            .then(({ data: roleData, error: roleError }) => {
              if (!roleError && mounted) {
                setIsAdmin(roleData?.role === "admin");
              } else if (mounted) {
                setIsAdmin(false);
              }
            })
            .catch((e) => {
              console.error("Error fetching user role on auth change:", e);
              if (mounted) setIsAdmin(false);
            });
        } else {
          setIsAdmin(false);
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(initialLoadTimeout);
      authListener?.unsubscribe?.();
    };
  }, []);

  const logout = async () => {
    try {
      console.log("🔓 Calling supabase.auth.signOut()...");
      await supabase.auth.signOut();
      console.log("✅ Supabase signOut successful");
    } catch (e) {
      console.error("❌ Error during signOut:", e);
    }
    
    // Always clear local state immediately
    console.log("Clearing local auth state...");
    setCurrentUser(null);
    setIsAdmin(false);
  };

  const value = { currentUser, user: currentUser, isAdmin, loading, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);