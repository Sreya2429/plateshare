import { useEffect, useState } from 'react';
import { api } from '../api';
import Message from '../components/Message';
import { formatDateTime } from '../utils';

const SECTIONS = [
  ['users', 'Manage users'],
  ['food', 'Manage listings'],
  ['bookings', 'Manage bookings'],
];

export default function AdminDashboard({ user }) {
  const [section, setSection] = useState('users');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const endpoints = {
      users: ['admin_get_users.php', 'users'],
      food: ['admin_get_food.php', 'food'],
      bookings: ['admin_get_bookings.php', 'bookings'],
    };
    const [endpoint, key] = endpoints[section];
    setLoading(true);
    setError('');
    api.get(endpoint)
      .then((data) => { if (active) setRecords(data[key]); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [section]);

  async function deleteListing(item) {
    const confirmed = window.confirm(
      `Delete listing #${item.listing_id} (${item.food_name})? Any bookings linked to this listing will also be deleted.`
    );
    if (!confirmed) return;
    setError('');
    try {
      await api.post('admin_delete_food.php', { listing_id: item.listing_id });
      setRecords((current) => current.filter((record) => record.listing_id !== item.listing_id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="admin-page">
      <div className="page-head">
        <div>
          <p className="admin-eyebrow">PlateShare administration</p>
          <h1>Admin dashboard</h1>
        </div>
      </div>

      <div className="admin-tabs" role="tablist" aria-label="Admin sections">
        {SECTIONS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={section === id}
            className={`admin-tab ${section === id ? 'active' : ''}`}
            onClick={() => setSection(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <Message type="error" onClose={() => setError('')}>{error}</Message>
      {loading ? <p className="muted" role="status">Loading {section}…</p> : (
        records.length === 0 ? <div className="empty"><p>No {section} to display.</p></div> : (
          <div className="admin-table-wrap">
            {section === 'users' && (
              <table className="admin-table">
                <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Contact</th><th>Account type</th><th>Role</th><th>Account</th></tr></thead>
                <tbody>{records.map((record) => (
                  <tr key={record.user_id}>
                    <td>{record.user_id}</td><td>{record.name}</td><td>{record.email}</td><td>{record.phone || '—'}</td>
                    <td>{record.user_type}</td><td><span className="admin-role">{record.role}</span></td>
                    <td>{Number(record.user_id) === Number(user.user_id) ? 'Your account' : '—'}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
            {section === 'food' && (
              <table className="admin-table">
                <thead><tr><th>ID</th><th>Food</th><th>Quantity</th><th>Category</th><th>Donor</th><th>Status</th><th>Expires</th><th>Action</th></tr></thead>
                <tbody>{records.map((record) => (
                  <tr key={record.listing_id}>
                    <td>{record.listing_id}</td><td>{record.food_name}</td>
                    <td>{record.quantity} {record.quantity_unit}</td><td>{record.category_name}</td>
                    <td>{record.donor_name}<small>{record.donor_email}</small></td>
                    <td><span className={`badge badge-${record.status.toLowerCase()}`}>{record.status}</span></td>
                    <td>{formatDateTime(record.expiry_time)}</td>
                    <td><button type="button" className="btn btn-danger admin-delete" onClick={() => deleteListing(record)}>Delete</button></td>
                  </tr>
                ))}</tbody>
              </table>
            )}
            {section === 'bookings' && (
              <table className="admin-table">
                <thead><tr><th>ID</th><th>Food listing</th><th>Donor</th><th>Recipient</th><th>Booked</th><th>Status</th></tr></thead>
                <tbody>{records.map((record) => (
                  <tr key={record.booking_id}>
                    <td>{record.booking_id}</td><td>{record.food_name} <small>Listing #{record.listing_id}</small></td>
                    <td>{record.donor_name}<small>{record.donor_email}</small></td>
                    <td>{record.recipient_name}<small>{record.recipient_email}</small></td>
                    <td>{formatDateTime(record.booking_time)}</td>
                    <td><span className={`badge badge-${record.booking_status.toLowerCase()}`}>{record.booking_status}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        )
      )}
    </section>
  );
}