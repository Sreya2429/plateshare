// Date helpers. The server stores DATETIME values as "YYYY-MM-DD HH:MM:SS" (no timezone),
// so we read them as local time, which is how users type them into the form.

export function parseDate(sql) {
  return new Date(String(sql).replace(' ', 'T'));
}

export function formatDateTime(sql) {
  return parseDate(sql).toLocaleString([], {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const pad = (n) => String(n).padStart(2, '0');

/** Date -> value for <input type="datetime-local"> */
export function toInputValue(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** "2026-10-07 18:30:00" -> "2026-10-07T18:30" */
export function sqlToInput(sql) {
  return String(sql).slice(0, 16).replace(' ', 'T');
}

/**
 * How fresh is this food?
 * Returns the label ("2h 15m left"), the share of the prepared-to-expiry window still remaining (0 to 1),
 * and a tone used for colour: fresh, soon, urgent or expired.
 */
export function freshness(prepared, expiry, now = new Date()) {
  const msLeft = parseDate(expiry) - now;
  const total = parseDate(expiry) - parseDate(prepared);

  if (msLeft <= 0) {
    return { expired: true, label: 'Expired', fraction: 0, tone: 'expired' };
  }

  const mins = Math.floor(msLeft / 60000);
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const minutes = mins % 60;
  const label = days > 0 ? `${days}d ${hours}h left` : hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;

  const fraction = total > 0 ? Math.min(1, msLeft / total) : 0;
  const tone = mins < 60 || fraction < 0.2 ? 'urgent' : fraction < 0.5 ? 'soon' : 'fresh';

  return { expired: false, label, fraction, tone };
}
