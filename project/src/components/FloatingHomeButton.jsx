import { Link, useLocation } from "react-router-dom";

export default function FloatingHomeButton() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  if (isHome) return null; // hide on home

  return (
    <Link to="/" style={styles.fab} aria-label="Go to Home">
      🏠
    </Link>
  );
}

const styles = {
  fab: {
    position: "fixed",
    right: 16,
    bottom: 16,
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "#111827",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    fontSize: 22,
    textDecoration: "none",
    boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
    zIndex: 60,
  },
};