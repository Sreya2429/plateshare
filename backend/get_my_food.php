<?php
// GET: listings posted by the logged-in user.
// JOINs: FOOD_LISTINGS + FOOD_CATEGORIES, LEFT JOIN the active BOOKING and the person who booked it.
require_once __DIR__ . '/db.php';
$user_id = require_login();

$stmt = $pdo->prepare(
    "SELECT f.listing_id, f.food_name, f.quantity, f.quantity_unit,
            f.prepared_time, f.expiry_time, f.status,
            c.category_id, c.category_name,
            bu.name  AS booked_by_name,
            bu.phone AS booked_by_phone,
            bu.email AS booked_by_email
     FROM food_listings f
     JOIN food_categories c ON c.category_id = f.category_id
     LEFT JOIN bookings b   ON b.listing_id = f.listing_id AND b.status = 'Booked'
     LEFT JOIN users bu     ON bu.user_id = b.user_id
     WHERE f.user_id = ?
     ORDER BY f.listing_id DESC"
);
$stmt->execute([$user_id]);
respond(['success' => true, 'food' => $stmt->fetchAll()]);
