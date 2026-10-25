import { useState } from 'react';
import { api } from '../api';
import Message from '../components/Message';

// Login and registration share one page; `mode` switches between them.
export default function Auth({
  initialMode = 'login',
  notice,
  onAuthed,
  onSwitchMode,
}) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ name: '', email: '', phone: '', user_type: 'Individual', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function switchMode(next) {
    setMode(next);
    setError('');
  }

  function validate() {
    if (isRegister && !form.name.trim()) return 'Enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Enter a valid email address.';
    if (isRegister && !/^[0-9+\-\s]{7,20}$/.test(form.phone.trim())) return 'Enter a valid phone number.';
    if (!form.password) return 'Enter your password.';
    if (isRegister && form.password.length < 6) return 'Password must be at least 6 characters.';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const data = isRegister
        ? await api.post('register.php', form)
        : await api.post('login.php', { email: form.email, password: form.password });
      onAuthed(data.user, isRegister);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="form-page">
      <h1>{isRegister ? 'Create your account' : 'Log in'}</h1>
      {notice && !error && <Message type="success">{notice}</Message>}
      <Message type="error">{error}</Message>

      <form className="form" onSubmit={handleSubmit} noValidate>
        {isRegister && (
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" value={form.name} onChange={(e) => update('name', e.target.value)} autoComplete="name" required />
            <small>Your name, or your organization's name. Others will see this on your listings.</small>
          </div>
        )}

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} autoComplete="email" required />
        </div>

        {isRegister && (
          <>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} autoComplete="tel" required />
            </div>
            <div className="field">
              <label htmlFor="user_type">I am registering as</label>
              <select id="user_type" value={form.user_type} onChange={(e) => update('user_type', e.target.value)}>
                <option>Individual</option>
                <option>Organization</option>
              </select>
            </div>
          </>
        )}

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            required
          />
          {isRegister && <small>At least 6 characters.</small>}
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}
        </button>
      </form>

      <p className="switch">
        {isRegister ? 'Already have an account?' : 'New to PlateShare?'}{' '}
      <button
  type="button"
  className="link"
  onClick={() => {
    if (onSwitchMode) {
      onSwitchMode();
    } else {
      switchMode(isRegister ? 'login' : 'register');
    }
  }}
>
  {isRegister ? 'Log in' : 'Create an account'}
</button>
      </p>
    </section>
  );
}
