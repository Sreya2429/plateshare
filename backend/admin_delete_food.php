<?php
// POST: listing_id -> delete a listing; existing ON DELETE CASCADE removes its bookings.
require_once __DIR__ . '/db.php';
require_method('POST');
require_admin($pdo);

$listing_id = filter_var(input()['listing_id'] ?? null, FILTER_VALIDATE_INT);
if (!$listing_id || $listing_id < 1) {
    fail('Choose a valid listing.');
}

$stmt = $pdo->prepare('DELETE FROM food_listings WHERE listing_id = ?');
$stmt->execute([$listing_id]);
if ($stmt->rowCount() === 0) {
    fail('Listing not found.', 404);
}
respond(['success' => true]);