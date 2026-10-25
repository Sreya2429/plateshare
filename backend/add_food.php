<?php
// POST: food_name, category_id, quantity, quantity_unit, prepared_time, expiry_time  ->  INSERT (status = Available).
require_once __DIR__ . '/db.php';
require_method('POST');
$user_id = require_login();

$food = validate_food($pdo, input());

$stmt = $pdo->prepare(
    "INSERT INTO food_listings
        (user_id, category_id, food_name, quantity, quantity_unit, prepared_time, expiry_time, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'Available')"
);
$stmt->execute([
    $user_id, $food['category_id'], $food['food_name'], $food['quantity'],
    $food['quantity_unit'], $food['prepared_time'], $food['expiry_time'],
]);

respond(['success' => true, 'listing_id' => (int) $pdo->lastInsertId()], 201);
