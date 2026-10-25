<?php
// GET: all listings, including unavailable and expired food.
require_once __DIR__ . '/db.php';
require_admin($pdo);

$stmt = $pdo->query(
    'SELECT f.listing_id, f.food_name, f.quantity, f.quantity_unit,
            f.prepared_time, f.expiry_time, f.status, c.category_name,
            u.user_id AS donor_id, u.name AS donor_name, u.email AS donor_email,
            u.phone AS donor_phone
     FROM food_listings f
     JOIN food_categories c ON c.category_id = f.category_id
     JOIN users u ON u.user_id = f.user_id
     ORDER BY f.listing_id DESC'
);
respond(['success' => true, 'food' => $stmt->fetchAll()]);