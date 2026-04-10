import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/Authcontext';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import BookToken from './pages/BookToken';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Pages (to be created)
// import Register from './pages/Register';
// import EmployeeDashboard from './pages/EmployeeDashboard';

import './App.css';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<div className="container">Welcome to Token Booking System</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        {/* <Route path="/register" element={<Register />} /> */}

        {/* User Routes */}
        <Route
          path="/book"
          element={
            <ProtectedRoute
              element={<BookToken />}
              requiredRoles={['user']}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              element={<UserDashboard />}
              requiredRoles={['user']}
            />
          }
        />

        {/* Employee Routes */}
        {/* <Route
          path="/employee"
          element={
            <ProtectedRoute
              element={<EmployeeDashboard />}
              requiredRoles={['employee']}
            />
          }
        /> */}

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute
              element={<AdminDashboard />}
              requiredRoles={['admin']}
            />
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
