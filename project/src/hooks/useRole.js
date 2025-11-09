// src/hooks/useRole.js
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

export default function useRole() {
  const { user } = useAuth();
  const [role, setRole] = useState("student");
  useEffect(() => {
    let active = true;
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then(snap => {
      if (!active) return;
      setRole(snap.data()?.role || "student");
    });
    return () => { active = false; };
  }, [user]);
  return role;
}