import { Link } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, role, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Token Booking
        </Link>

        <ul className="navbar-menu">
          {!isAuthenticated ? (
            <>
              <li>
                <Link to="/login" className="navbar-link">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="navbar-link navbar-link-btn">
                  Register
                </Link>
              </li>
            </>
          ) : (
            <>
              {role === 'user' && (
                <>
                  <li>
                    <Link to="/book" className="navbar-link">
                      Book Token
                    </Link>
                  </li>
                  <li>
                    <Link to="/dashboard" className="navbar-link">
                      My Tokens
                    </Link>
                  </li>
                </>
              )}

              {role === 'employee' && (
                <li>
                  <Link to="/employee" className="navbar-link">
                    Dashboard
                  </Link>
                </li>
              )}

              {role === 'admin' && (
                <li>
                  <Link to="/admin" className="navbar-link">
                    Admin Panel
                  </Link>
                </li>
              )}

              <li className="navbar-user-info">
                <span className="navbar-username">{user?.name}</span>
                <span className="navbar-role">({role})</span>
              </li>

              <li>
                <button onClick={logout} className="navbar-logout-btn">
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
