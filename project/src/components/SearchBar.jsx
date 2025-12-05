import React, { useRef } from "react";
import { useSearch } from "../context/SearchContext";
import { useNavigate } from "react-router-dom";

export default function SearchBar({ placeholder = "Search…", showScope = true }) {
  const { query, setQuery, scope, setScope } = useSearch();
  const inputRef = useRef();
  const navigate = useNavigate();

  // const onClear = () => {
  //   setQuery("");
  //   inputRef.current?.focus();
  // };

  return (
    <div
      role="search"
      aria-label="Global search"
      className="searchbar"
      style={{
        display: "flex",
        gap: "8px",
        alignItems: "center",
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "6px 10px",
      }}
    >
      <span aria-hidden="true" style={{ opacity: 0.7 }}>
        🔎
      </span>
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        style={{ flex: 1, border: "none", outline: "none", fontSize: "0.95rem" }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            // navigate to search results page
            const q = (query || "").trim();
            const params = new URLSearchParams({ q, scope });
            navigate(`/search?${params.toString()}`);
          }
        }}
      />
      {showScope && (
        <select
          aria-label="Search scope"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          style={{
            border: "none",
            background: "#f6f6f6",
            borderRadius: "6px",
            padding: "4px 6px",
          }}
        >
          <option value="all">All</option>
          <option value="events">Events</option>
          <option value="announcements">Announcements</option>
          <option value="notes">Notes</option>
        </select>
      )}
    </div>
  );
}
