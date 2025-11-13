import { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all"); // 'all' | 'events' | 'announcements' | 'notes'

  const value = { query, setQuery, scope, setScope };
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
}