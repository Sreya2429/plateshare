<?php
// GET (?category_id=N optional): food with status = 'Available'.
// JOIN: FOOD_LISTINGS + USERS (poster details) + FOOD_CATEGORIES.
require_once __DIR__ . '/db.php';
require_login();

$sql = 'SELECT f.listing_id, f.food_name, f.quantity, f.quantity_unit,
               f.prepared_time, f.expiry_time, f.status,
               c.category_id, c.category_name,
               u.user_id AS poster_id, u.name AS poster_name,
               u.phone AS poster_phone, u.email AS poster_email, u.user_type AS poster_type
        FROM food_listings f
        JOIN users u           ON u.user_id = f.user_id
        JOIN food_categories c ON c.category_id = f.category_id
        WHERE f.status = ?';
$params = ['Available'];

$category = (int) ($_GET['category_id'] ?? 0);
if ($category > 0) {
    $sql .= ' AND f.category_id = ?';
    $params[] = $category;
}
$sql .= ' ORDER BY f.expiry_time ASC';    // soonest-to-expire first

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
respond(['success' => true, 'food' => $stmt->fetchAll()]);
