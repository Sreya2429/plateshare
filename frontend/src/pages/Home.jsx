import { useEffect, useState } from 'react';
import { api } from '../api';
import FoodCard from '../components/FoodCard';
import Message from '../components/Message';

export default function Home({ user, onNavigate, showFlash }) {
  const [food, setFood] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState(null);
  const [, setTick] = useState(0);

  // Load categories once.
  useEffect(() => {
    if (!user) return;
    api.get('get_categories.php').then((d) => setCategories(d.categories)).catch(() => {});
  }, [user]);

  // Load food whenever the category filter changes.
  useEffect(() => {
    if (user) loadFood();
  }, [user, categoryId]);

  // Re-render every minute so "time left" stays current.
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  async function loadFood() {
    setLoading(true);
    setError('');
    try {
      const query = categoryId ? `?category_id=${categoryId}` : '';
      const data = await api.get(`get_food.php${query}`);
      setFood(data.food);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleBook(item) {
    if (!window.confirm(`Book ${item.quantity} ${item.quantity_unit} of ${item.food_name}?`)) return;
    setBookingId(item.listing_id);
    setError('');
    try {
      await api.post('book_food.php', { listing_id: item.listing_id });
      showFlash(
        'success',
        `Booked! Contact ${item.poster_name} on ${item.poster_phone} to arrange pickup.`
      );
      await loadFood();
    } catch (err) {
      setError(err.message);
      await loadFood();
    } finally {
      setBookingId(null);
    }
  }

  // Logged-out visitors see an introduction instead of the food (contact details are for members only).
  if (!user) {
    return (
      <section className="intro">
        <h1>Surplus food, shared before it goes to waste.</h1>
        <p className="lead">
          Restaurants, bakeries, event teams and households post the food they cannot finish. Neighbours browse it,
          book it and collect it while it is still good.
        </p>
        <div className="intro-actions">
          <button type="button" className="btn btn-primary" onClick={() => onNavigate('register')}>
            Create an account
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => onNavigate('login')}>
            Log in
          </button>
        </div>

        <ol className="steps">
          <li>
            <strong>Post</strong>
            <span>Add what is left, how much, and when it expires.</span>
          </li>
          <li>
            <strong>Book</strong>
            <span>Someone nearby reserves it. The listing is marked Booked.</span>
          </li>
          <li>
            <strong>Collect</strong>
            <span>They call or email you to arrange pickup.</span>
          </li>
        </ol>
      </section>
    );
  }

  return (
    <section>
      <div className="page-head">
        <h1>Available food</h1>
        <label className="filter">
          <span>Category</span>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Message type="error" onClose={() => setError('')}>
        {error}
      </Message>

      {loading && food.length === 0 ? (
        <p className="muted">Loading food…</p>
      ) : food.length === 0 ? (
        <div className="empty">
          <p>No surplus food is currently available.</p>
          <button type="button" className="btn btn-secondary" onClick={() => onNavigate('add')}>
            Post some food
          </button>
        </div>
      ) : (
        <div className="grid">
          {food.map((item) => (
            <FoodCard
              key={item.listing_id}
              item={item}
              currentUserId={user.user_id}
              busy={bookingId === item.listing_id}
              onBook={handleBook}
            />
          ))}
        </div>
      )}
    </section>
  );
}
