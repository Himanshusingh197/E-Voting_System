import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={user?.role === 'admin' ? '/admin' : user ? '/vote' : '/'}>
          🗳️ <span className="brand-text">E-Voting</span>
        </Link>
      </div>
      <div className="navbar-links">
        {!user ? (
          <>
            <Link to="/">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : user.role === 'admin' ? (
          <>
            <Link to="/admin">Dashboard</Link>
            <Link to="/result">Results</Link>
            <button className="nav-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/vote">Vote</Link>
            <Link to="/result">Results</Link>
            <button className="nav-logout" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
