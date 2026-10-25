# PlateShare

A small surplus-food sharing platform. People and organizations post food they cannot finish, and other users book it and collect it.

Built with **React** (UI), **PHP** (JSON API, PDO, sessions) and **MySQL** (4 tables with foreign keys and JOINs).

```
plateshare/
├── database/
│   ├── schema.sql          4 tables, constraints, sample categories
│   └── demo_queries.sql    INSERT / SELECT / UPDATE / DELETE / JOIN examples for your presentation
├── backend/                PHP API (one file per action)
│   ├── config.php          database login + timezone  <- edit this
│   ├── db.php              PDO connection, session, helpers
│   ├── seed.php            optional sample users and food
│   └── register, login, logout, me, get_categories, get_food, get_my_food,
│       add_food, update_food, delete_food, book_food, get_bookings, cancel_booking
└── frontend/               React app (Vite)
    └── src/  App.jsx, api.js, utils.js, styles.css, components/, pages/
```

## Run it

You need PHP 8+, MySQL or MariaDB, and Node 18+. (XAMPP gives you PHP and MySQL.)

**1. Create the database**

```bash
mysql -u root -p < database/schema.sql
```

**2. Check `backend/config.php`**

Set `DB_USER` and `DB_PASS` for your MySQL (XAMPP default is `root` with an empty password). Set `APP_TIMEZONE` to your own timezone, because food times are stored without a timezone.

For an existing database, apply `database/migrations/add_user_roles.sql` once. Existing accounts become normal users. Promote an account to admin directly in the database after verifying its owner, for example:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

Registration always creates a normal user; the role cannot be supplied through the app.

**3. Add sample data (optional)**

```bash
php backend/seed.php
```

Creates three users (`greenleaf@example.com`, `sunrise@example.com`, `anita@example.com`, password `password123`) and five listings.

**4. Start the PHP API** (terminal 1)

```bash
cd backend
php -S 127.0.0.1:8000
```

**5. Start React** (terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. Vite forwards `/api/*` to the PHP server, so login sessions work without any CORS setup.

## How it works

| Page | What it does | SQL |
|---|---|---|
| Home | Available food with poster name, phone, email, and a time-left bar. Filter by category. | `SELECT` + 3-table `JOIN`, `WHERE`, `ORDER BY` |
| Add Food | Validated form, status starts as Available | `INSERT` |
| My Listings | Edit, delete, and see who booked each item | `UPDATE`, `DELETE`, `LEFT JOIN` |
| My Bookings | Booking history with poster contact, cancel button | `JOIN` across bookings, listings, users; `UPDATE` |
| Admin Dashboard | Manage users, inspect all listings and bookings, delete listings | Admin-only PHP APIs; existing listing-to-booking cascade |

## Decisions the brief left open

- **Cancelling a booking puts the food back to Available**, so it can be booked by someone else. Otherwise the listing would stay stuck as Booked.
- **Login is required to see food**, because listings show phone numbers and emails.
- **You cannot book your own food, expired food, or food someone else just booked.** The check is in PHP inside a transaction with a row lock, so two people clicking Book at the same moment cannot both win.
- **Booked listings cannot be edited.** Deleting one removes its booking too (`ON DELETE CASCADE`).
- Expired food is still shown (the brief asks for no automatic expiry), but it is marked Expired and cannot be booked.
- Passwords are stored with `password_hash()` (bcrypt), and every query uses prepared statements.

## Future enhancements

Maps and distance, delivery, notifications, ratings, photos, automatic expiry, an admin dashboard.
