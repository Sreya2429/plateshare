import { useEffect, useState } from 'react';
import { api } from '../api';
import Message from '../components/Message';
import { formatDateTime, freshness } from '../utils';

export default function MyListings({ onEdit, onNavigate, showFlash }) {
  const [food, setFood] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await api.get('get_my_food.php');
      setFood(data.food);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(item) {
    const extra = item.status === 'Booked' ? ` It is booked by ${item.booked_by_name}, so their booking will be removed too.` : '';
    if (!window.confirm(`Delete ${item.food_name}?${extra}`)) return;
    setError('');
    try {
      await api.post('delete_food.php', { listing_id: item.listing_id });
      showFlash('success', `${item.food_name} was deleted.`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <div className="page-head">
        <h1>My listings</h1>
        <button type="button" className="btn btn-primary" onClick={() => onNavigate('add')}>
          Add food
        </button>
      </div>

      <Message type="error" onClose={() => setError('')}>
        {error}
      </Message>

      {loading ? (
        <p className="muted">Loading your listings…</p>
      ) : food.length === 0 ? (
        <div className="empty">
          <p>You haven't posted any food yet.</p>
          <button type="button" className="btn btn-secondary" onClick={() => onNavigate('add')}>
            Post your first listing
          </button>
        </div>
      ) : (
        <ul className="rows">
          {food.map((item) => {
            const fresh = freshness(item.prepared_time, item.expiry_time);
            return (
              <li key={item.listing_id} className="row">
                <div className="row-main">
                  <div className="row-title">
                    <h3>{item.food_name}</h3>
                    <span className={`badge badge-${item.status.toLowerCase()}`}>{item.status}</span>
                  </div>
                  <p className="row-meta">
                    {item.category_name}. {item.quantity} {item.quantity_unit}.
                  </p>
                  <p className="row-meta">
                    Expires {formatDateTime(item.expiry_time)}
                    {fresh.expired && <strong className="tone-text-expired"> (expired)</strong>}
                  </p>
                  {item.status === 'Booked' && (
                    <p className="row-contact">
                      Booked by <strong>{item.booked_by_name}</strong>:{' '}
                      <a href={`tel:${item.booked_by_phone}`}>{item.booked_by_phone}</a>,{' '}
                      <a href={`mailto:${item.booked_by_email}`}>{item.booked_by_email}</a>
                    </p>
                  )}
                </div>
                <div className="row-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={item.status === 'Booked'}
                    title={item.status === 'Booked' ? 'Booked food cannot be edited' : undefined}
                    onClick={() => onEdit(item)}
                  >
                    Edit
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => handleDelete(item)}>
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
