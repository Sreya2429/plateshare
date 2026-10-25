
import { Link, useLocation } from 'react-router-dom';

const PATHS = {
  home: '/',
  add: '/add',
  listings: '/listings',
  bookings: '/bookings',
  admin: '/admin',
  login: '/login',
};

export default function Navbar({ user, onLogout }) {
  const location = useLocation();

  const links = user
    ? [
        ['home', 'Home'],
        ['add', 'Add Food'],
        ['listings', 'My Listings'],
        ['bookings', 'My Bookings'],
        ...(user.role === 'admin' ? [['admin', 'Admin Dashboard']] : []),
      ]
    : [['home', 'Home']];

  const currentPage =
    Object.keys(PATHS).find(
      (key) => PATHS[key] === location.pathname
    ) || 'home';

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            aria-hidden="true"
          >
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="var(--green)"
            />
            <circle
              cx="16"
              cy="16"
              r="8"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
            />
          </svg>
          PlateShare
        </Link>

        <nav className="nav" aria-label="Main navigation">
          {links.map(([id, label]) => (
            <Link
              key={id}
              to={PATHS[id]}
              className={`nav-link ${
                currentPage === id ? 'active' : ''
              }`}
              aria-current={
                currentPage === id ? 'page' : undefined
              }
            >
              {label}
            </Link>
          ))}

          {user ? (
            <button
              type="button"
              className="nav-link nav-user"
              onClick={onLogout}
            >
              Log out ({user.name.split(' ')[0]})
            </button>
          ) : (
            <Link
              to="/login"
              className={`nav-link ${
                location.pathname === '/login' ? 'active' : ''
              }`}
              aria-current={
                location.pathname === '/login' ? 'page' : undefined
              }
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
