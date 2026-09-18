import { Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import StudentDashboard from "./pages/student/Dashboard";

import IssuerDashboard from "./pages/issuer/Dashboard";
import IssueCertificate from "./pages/issuer/IssueCertificate";

import VerifyCertificate from "./pages/VerifyCertificate";

import { useAuth } from "./context/AuthContext";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import ActivityLogs from "./pages/admin/ActivityLogs";
import AISecurity from "./pages/admin/AISecurity";

/*
|--------------------------------------------------------------------------
| Protected Route
|--------------------------------------------------------------------------
*/

function ProtectedRoute({
  children,
  allowedRoles,
}) {
  const { user, loading } = useAuth();

  /*
  |--------------------------------------------------------------------------
  | Wait for authentication state
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-blue-500" />

          <p className="mt-4 text-sm text-slate-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Not logged in
  |--------------------------------------------------------------------------
  */

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Role protection
  |--------------------------------------------------------------------------
  */

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    if (user.role === "issuer") {
      return (
        <Navigate
          to="/issuer/dashboard"
          replace
        />
      );
    }

    if (user.role === "student") {
      return (
        <Navigate
          to="/student/dashboard"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
*/

function App() {
  return (
    <Routes>

      {/* ================================================================
          PUBLIC ROUTES
      ================================================================= */}

      <Route
        path="/"
        element={<Home />}
      />

<Route
  path="/admin/dashboard"
  element={<AdminDashboard />}
/>

<Route
  path="/admin/users"
  element={<UserManagement />}
/>

<Route
  path="/admin/activity-logs"
  element={<ActivityLogs />}
/>

<Route
  path="/admin/ai-security"
  element={<AISecurity />}
/>

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* ================================================================
          CERTIFICATE VERIFICATION
      ================================================================= */}

      {/* Open verification page */}
      <Route
        path="/verify"
        element={<VerifyCertificate />}
      />

      {/* Direct certificate verification */}
      <Route
        path="/verify/:certificateId"
        element={<VerifyCertificate />}
      />

      {/* ================================================================
          STUDENT
      ================================================================= */}

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={["student"]}
          >
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* ================================================================
          ISSUER
      ================================================================= */}

      <Route
        path="/issuer/dashboard"
        element={
          <ProtectedRoute
            allowedRoles={[
              "issuer",
              "admin",
            ]}
          >
            <IssuerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/issuer/issue"
        element={
          <ProtectedRoute
            allowedRoles={[
              "issuer",
              "admin",
            ]}
          >
            <IssueCertificate />
          </ProtectedRoute>
        }
      />

      {/* ================================================================
          FALLBACK
      ================================================================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;