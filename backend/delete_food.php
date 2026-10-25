<?php
// POST: listing_id  ->  DELETE. Only the owner. Its bookings are removed by ON DELETE CASCADE.
require_once __DIR__ . '/db.php';
require_method('POST');
$user_id = require_login();

$listing_id = (int) (input()['listing_id'] ?? 0);

$stmt = $pdo->prepare('DELETE FROM food_listings WHERE listing_id = ? AND user_id = ?');
$stmt->execute([$listing_id, $user_id]);

if ($stmt->rowCount() === 0) {
    fail('Listing not found, or it is not yours.', 404);
}
respond(['success' => true]);
