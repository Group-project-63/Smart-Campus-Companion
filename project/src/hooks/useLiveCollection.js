// src/hooks/useLiveCollection.js
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function useLiveCollection(path, orderField = "createdAt", direction = "desc") {
  const [items, setItems] = useState([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from(path)
          .select("*")
          .order(orderField, { ascending: direction === "asc" });
        if (error) throw error;
        if (mounted) setItems(data || []);
      } catch (err) {
        console.error("useLiveCollection fetch failed:", err);
      }
    })();
    return () => { mounted = false; };
  }, [path, orderField, direction]);
  return items;
}