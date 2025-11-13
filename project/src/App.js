import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { SearchProvider } from "./context/SearchContext";

import AppLayout from "./components/AppLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";

import AdminDashboard from "./pages/AdminDashboard";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import AdminEvents from "./pages/AdminEvents";

import Timetable from "./components/Timetable";
import Events from "./components/Events";
import NotesUpload from "./components/NotesUpload";
import CampusMap from "./components/CampusMap";
import Announcements from "./components/Announcements";
import Profile from "./pages/Profile";
import Forbidden from "./pages/Forbidden";

function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <Router>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/403" element={<Forbidden />} />

            {/* Protected area wrapped by AppLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Home */}
              <Route index element={<Home />} />

              {/* User features */}
              <Route path="timetable" element={<Timetable />} />
              <Route path="events" element={<Events />} />
              <Route path="notes" element={<NotesUpload />} />
              <Route path="map" element={<CampusMap />} />
              <Route path="announcements" element={<Announcements />} />
              <Route path="profile" element={<Profile />} />

              {/* Admin pages */}
              <Route
                path="admindashboard"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="adminannouncements"
                element={
                  <AdminRoute>
                    <AdminAnnouncements />
                  </AdminRoute>
                }
              />
              <Route
                path="adminevents"
                element={
                  <AdminRoute>
                    <AdminEvents />
                  </AdminRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SearchProvider>
    </AuthProvider>
  );
}
export default App;