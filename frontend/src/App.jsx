
import { useEffect, useState } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { api, setUnauthorizedHandler } from './api';
import Navbar from './components/Navbar';
import Message from './components/Message';
import Home from './pages/Home';
import Auth from './pages/Auth';
import AddFood from './pages/AddFood';
import MyListings from './pages/MyListings';
import MyBookings from './pages/MyBookings';

function ProtectedRoute({ user, children }) {
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ notice: 'Log in to continue.' }}
      />
    );
  }

  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [editing, setEditing] = useState(null);
  const [flash, setFlash] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api
      .get('me.php')
      .then((d) => setUser(d.user))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setFlash({
        type: 'error',
        text: 'Your session has ended. Please log in again.',
      });
      navigate('/login', { replace: true });
    });
  }, [navigate]);

  function showFlash(type, text) {
    setFlash({ type, text });
    window.scrollTo({ top: 0 });
  }

  function go(next, message) {
    const paths = {
      home: '/',
      add: '/add',
      listings: '/listings',
      bookings: '/bookings',
      login: '/login',
      register: '/register',
    };

    navigate(paths[next] || '/');

    if (next !== 'add') {
      setEditing(null);
    }

    setFlash(
      message ? { type: 'success', text: message } : null
    );
  }

  function handleAuthed(u, justRegistered) {
    setUser(u);

    go(
      'home',
      justRegistered
        ? `Welcome to PlateShare, ${u.name}.`
        : `Welcome back, ${u.name}.`
    );
  }

  async function handleLogout() {
    try {
      await api.post('logout.php');
    } catch {
      // Clear local state even if the request fails.
    }

    setUser(null);
    go('home', 'You have been logged out.');
  }

  function startEdit(item) {
    setEditing(item);
    setFlash(null);
    navigate('/add');
  }

  if (checking) {
    return (
      <main className="container">
        <p className="muted">Loading...</p>
      </main>
    );
  }

  const pagePaths = {
    '/': 'home',
    '/login': 'login',
    '/register': 'register',
    '/add': 'add',
    '/listings': 'listings',
    '/bookings': 'bookings',
  };

  const page = pagePaths[location.pathname] || 'home';

  return (
    <>
      <Navbar
        user={user}
        page={page}
        onNavigate={go}
        onLogout={handleLogout}
      />

      <main className="container">
        {flash && (
          <Message
            type={flash.type}
            onClose={() => setFlash(null)}
          >
            {flash.text}
          </Message>
        )}

        <Routes>
          <Route
            path="/"
            element={
              <Home
                user={user}
                onNavigate={go}
                showFlash={showFlash}
              />
            }
          />

          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <Auth
                  key="login"
                  initialMode="login"
                  onAuthed={handleAuthed}
                  notice={location.state?.notice}
                  onSwitchMode={() => navigate('/register')}
                />
              )
            }
          />

          <Route
            path="/register"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <Auth
                  key="register"
                  initialMode="register"
                  onAuthed={handleAuthed}
                  onSwitchMode={() => navigate('/login')}
                />
              )
            }
          />

          <Route
            path="/add"
            element={
              <ProtectedRoute user={user}>
                <AddFood
                  key={editing ? editing.listing_id : 'new'}
                  editing={editing}
                  onDone={(msg) => go('listings', msg)}
                  onCancel={() => go('listings')}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/listings"
            element={
              <ProtectedRoute user={user}>
                <MyListings
                  onEdit={startEdit}
                  onNavigate={go}
                  showFlash={showFlash}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bookings"
            element={
              <ProtectedRoute user={user}>
                <MyBookings
                  onNavigate={go}
                  showFlash={showFlash}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </main>

      <footer className="site-footer container">
Plate Share only connects food providers with people seeking surplus food and does not prepare, inspect, or handle the food.
Food providers and recipients are responsible for food safety and handling; Plate Share is not liable for food-related issues to the extent permitted by law.      </footer>
    </>
  );
}
