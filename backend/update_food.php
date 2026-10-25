<?php
// POST: listing_id + the same fields as add_food.php  ->  UPDATE. Only the owner, only while Available.
require_once __DIR__ . '/db.php';
require_method('POST');
$user_id = require_login();

$in         = input();
$listing_id = (int) ($in['listing_id'] ?? 0);

$check = $pdo->prepare('SELECT user_id, status FROM food_listings WHERE listing_id = ?');
$check->execute([$listing_id]);
$listing = $check->fetch();

if (!$listing)                                fail('That listing no longer exists.', 404);
if ((int) $listing['user_id'] !== $user_id)   fail('You can only edit your own listings.', 403);
if ($listing['status'] !== 'Available')       fail('Booked food cannot be edited. Ask the person to cancel the booking first.', 409);

$food = validate_food($pdo, $in);

$stmt = $pdo->prepare(
    'UPDATE food_listings
     SET category_id = ?, food_name = ?, quantity = ?, quantity_unit = ?, prepared_time = ?, expiry_time = ?
     WHERE listing_id = ? AND user_id = ?'
);
$stmt->execute([
    $food['category_id'], $food['food_name'], $food['quantity'], $food['quantity_unit'],
    $food['prepared_time'], $food['expiry_time'], $listing_id, $user_id,
]);

respond(['success' => true]);
