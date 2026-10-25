// All communication with the PHP backend goes through this file (fetch API).
const BASE = '/api';

let onUnauthorized = () => {};
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

async function request(file, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}/${file}`, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is the PHP server running?');
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('The server sent an unexpected response. Check the PHP server and backend/config.php.');
  }

  if (!res.ok || data.success === false) {
    if (res.status === 401 && file !== 'login.php' && file !== 'me.php') {
      onUnauthorized();
    }
    const err = new Error(data.error || 'Something went wrong. Please try again.');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  get: (file) => request(file),
  post: (file, body = {}) => request(file, { method: 'POST', body }),
};
