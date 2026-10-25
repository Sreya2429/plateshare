import { useEffect, useState } from 'react';
import { api } from '../api';
import Message from '../components/Message';
import { sqlToInput, toInputValue } from '../utils';

// Used for both "Add Food" and "Edit listing" (when `editing` is passed in).
export default function AddFood({ editing, onDone, onCancel }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(() => {
    if (editing) {
      return {
        food_name: editing.food_name,
        category_id: String(editing.category_id),
        quantity: String(editing.quantity),
        quantity_unit: editing.quantity_unit,
        prepared_time: sqlToInput(editing.prepared_time),
        expiry_time: sqlToInput(editing.expiry_time),
      };
    }
    const now = new Date();
    return {
      food_name: '',
      category_id: '',
      quantity: '',
      quantity_unit: 'Portions',
      prepared_time: toInputValue(now),
      expiry_time: toInputValue(new Date(now.getTime() + 3 * 60 * 60 * 1000)),
    };
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get('get_categories.php')
      .then((d) => setCategories(d.categories))
      .catch((err) => setError(err.message));
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    if (!form.food_name.trim()) return 'Enter a food name.';
    if (!form.category_id) return 'Choose a category.';
    const qty = Number(form.quantity);
    if (!Number.isInteger(qty) || qty < 1) return 'Quantity must be a whole number of 1 or more.';
    if (!form.quantity_unit.trim()) return 'Enter a quantity unit, such as Portions or Kg.';
    if (!form.prepared_time || !form.expiry_time) return 'Enter both the prepared and expiry times.';
    if (new Date(form.expiry_time) <= new Date(form.prepared_time)) return 'Expiry time must be after the prepared time.';
    if (new Date(form.expiry_time) <= new Date()) return 'Expiry time is already in the past.';
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
      if (editing) {
        await api.post('update_food.php', { ...form, listing_id: editing.listing_id });
        onDone(`Saved changes to ${form.food_name.trim()}.`);
      } else {
        await api.post('add_food.php', form);
        onDone(`${form.food_name.trim()} is now listed.`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="form-page">
      <h1>{editing ? 'Edit listing' : 'Add surplus food'}</h1>
      <Message type="error">{error}</Message>

      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="food_name">Food name</label>
          <input
            id="food_name"
            value={form.food_name}
            maxLength={120}
            placeholder="e.g. Vegetable Biryani"
            onChange={(e) => update('food_name', e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="category_id">Category</label>
          <select id="category_id" value={form.category_id} onChange={(e) => update('category_id', e.target.value)} required>
            <option value="">Choose a category</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="quantity">Quantity</label>
            <input id="quantity" type="number" min="1" step="1" value={form.quantity} onChange={(e) => update('quantity', e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="quantity_unit">Unit</label>
            <input
              id="quantity_unit"
              list="unit-options"
              value={form.quantity_unit}
              maxLength={30}
              onChange={(e) => update('quantity_unit', e.target.value)}
              required
            />
            <datalist id="unit-options">
              <option value="Portions" />
              <option value="Kg" />
              <option value="Pieces" />
              <option value="Packets" />
              <option value="Loaves" />
            </datalist>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="prepared_time">Prepared at</label>
            <input id="prepared_time" type="datetime-local" value={form.prepared_time} onChange={(e) => update('prepared_time', e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="expiry_time">Best before</label>
            <input id="expiry_time" type="datetime-local" value={form.expiry_time} onChange={(e) => update('expiry_time', e.target.value)} required />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : editing ? 'Save changes' : 'Post food'}
          </button>
          {editing && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
