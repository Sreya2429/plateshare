<?php
// GET: the logged-in user's bookings.
// JOIN: BOOKINGS + FOOD_LISTINGS + USERS (poster) + FOOD_CATEGORIES.
require_once __DIR__ . '/db.php';
$user_id = require_login();

$stmt = $pdo->prepare(
    'SELECT b.booking_id, b.booking_time, b.status AS booking_status,
            f.listing_id, f.food_name, f.quantity, f.quantity_unit, f.expiry_time,
            c.category_name,
            u.name AS poster_name, u.phone AS poster_phone, u.email AS poster_email
     FROM bookings b
     JOIN food_listings f   ON f.listing_id = b.listing_id
     JOIN users u           ON u.user_id = f.user_id
     JOIN food_categories c ON c.category_id = f.category_id
     WHERE b.user_id = ?
     ORDER BY b.booking_time DESC, b.booking_id DESC'
);
$stmt->execute([$user_id]);
respond(['success' => true, 'bookings' => $stmt->fetchAll()]);
