import { formatDateTime, freshness } from '../utils';

// One food listing on the Home page.
export default function FoodCard({ item, currentUserId, onBook, busy }) {
  const fresh = freshness(item.prepared_time, item.expiry_time);
  const isOwn = item.poster_id === currentUserId;

  let buttonLabel = 'Book food';
  if (busy) buttonLabel = 'Booking…';
  else if (isOwn) buttonLabel = 'Your listing';
  else if (fresh.expired) buttonLabel = 'Expired';

  return (
    <article className="food-card">
      <div className={`timebar tone-${fresh.tone}`} role="img" aria-label={fresh.label}>
        <span style={{ width: `${Math.round(fresh.fraction * 100)}%` }} />
      </div>

      <div className="food-card-body">
        <p className="chip">{item.category_name}</p>
        <h3>{item.food_name}</h3>
        <p className="quantity">
          {item.quantity} {item.quantity_unit}
        </p>
        <p className="expiry">
          Available until {formatDateTime(item.expiry_time)}
          <strong className={`tone-text-${fresh.tone}`}>{fresh.label}</strong>
        </p>

        <dl className="poster">
          <dt>Posted by</dt>
          <dd>
            {item.poster_name} <span className="poster-type">({item.poster_type})</span>
          </dd>
          <dt>Phone</dt>
          <dd>
            <a href={`tel:${item.poster_phone}`}>{item.poster_phone}</a>
          </dd>
          <dt>Email</dt>
          <dd>
            <a href={`mailto:${item.poster_email}`}>{item.poster_email}</a>
          </dd>
        </dl>

        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={busy || isOwn || fresh.expired}
          onClick={() => onBook(item)}
        >
          {buttonLabel}
        </button>
      </div>
    </article>
  );
}
