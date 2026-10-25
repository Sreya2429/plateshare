import { useEffect, useState } from 'react';
import { api } from '../api';
import Message from '../components/Message';
import { formatDateTime } from '../utils';

export default function MyBookings({ onNavigate, showFlash }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await api.get('get_bookings.php');
      setBookings(data.bookings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(b) {
    if (!window.confirm(`Cancel your booking for ${b.food_name}? It will be available to others again.`)) return;
    setError('');
    try {
      await api.post('cancel_booking.php', { booking_id: b.booking_id });
      showFlash('success', `Your booking for ${b.food_name} was cancelled.`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <div className="page-head">
        <h1>My bookings</h1>
      </div>

      <Message type="error" onClose={() => setError('')}>
        {error}
      </Message>

      {loading ? (
        <p className="muted">Loading your bookings…</p>
      ) : bookings.length === 0 ? (
        <div className="empty">
          <p>You haven't booked any food yet.</p>
          <button type="button" className="btn btn-secondary" onClick={() => onNavigate('home')}>
            Browse available food
          </button>
        </div>
      ) : (
        <ul className="rows">
          {bookings.map((b) => (
            <li key={b.booking_id} className={`row ${b.booking_status === 'Cancelled' ? 'row-muted' : ''}`}>
              <div className="row-main">
                <div className="row-title">
                  <h3>{b.food_name}</h3>
                  <span className={`badge badge-${b.booking_status.toLowerCase()}`}>{b.booking_status}</span>
                </div>
                <p className="row-meta">
                  {b.quantity} {b.quantity_unit}. Booked {formatDateTime(b.booking_time)}.
                </p>
                <p className="row-contact">
                  Posted by <strong>{b.poster_name}</strong>: <a href={`tel:${b.poster_phone}`}>{b.poster_phone}</a>,{' '}
                  <a href={`mailto:${b.poster_email}`}>{b.poster_email}</a>
                </p>
              </div>
              <div className="row-actions">
                {b.booking_status === 'Booked' && (
                  <button type="button" className="btn btn-danger" onClick={() => handleCancel(b)}>
                    Cancel booking
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
