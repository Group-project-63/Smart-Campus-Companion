// src/hooks/useRole.js
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/AuthContext";

export default function useRole() {
  const { user } = useAuth();
  const [role, setRole] = useState("student");
  useEffect(() => {
    let active = true;
    if (!user) return;
    (async () => {
      try {
        const { data, error } = await supabase.from("users").select("role").eq("id", user.id).limit(1).single();
        if (error) throw error;
        if (!active) return;
        setRole(data?.role || "student");
      } catch (err) {
        console.error("useRole failed:", err);
      }
    })();
    return () => { active = false; };
  }, [user]);
  return role;
}