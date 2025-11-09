// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";

import AdminEvents from "./pages/AdminEvents";
import EventsList from "./components/EventsList";



import AdminRoute from "./components/AdminRoute";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import Announcements from "./components/Announcements";
import Profile from "./pages/Profile";


// Feature components
import Timetable from "./components/Timetable";
import Events from "./components/Events";
import NotesUpload from "./components/NotesUpload";
import CampusMap from "./components/CampusMap";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/Verify-email" element={<VerifyEmail />} />

          {/* Protected area */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timetable"
            element={
              <ProtectedRoute>
                <Timetable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <NotesUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <CampusMap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Adminannouncements"
            element={
              <ProtectedRoute>            
                <AdminRoute>
                  <AdminAnnouncements />
                </AdminRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/Announcements"
            element={
            <ProtectedRoute>
              <AdminRoute>
                <Announcements />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <Profile />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <EventsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="AdminEvents"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminEvents />
              </AdminRoute>
            </ProtectedRoute>
          }
        />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;