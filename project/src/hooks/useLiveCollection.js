// src/hooks/useLiveCollection.js
import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";

export default function useLiveCollection(path, orderField = "createdAt", direction = "desc") {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const q = query(collection(db, path), orderBy(orderField, direction));
    const unsub = onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [path, orderField, direction]);
  return items;
}