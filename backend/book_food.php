<?php
// POST: listing_id  ->  INSERT into bookings and UPDATE the listing to 'Booked' (one transaction).
require_once __DIR__ . '/db.php';
require_method('POST');
$user_id = require_login();

$listing_id = (int) (input()['listing_id'] ?? 0);

$pdo->beginTransaction();
try {
    // Lock the row so two people cannot book the same food at the same moment.
    $stmt = $pdo->prepare('SELECT user_id, status, expiry_time FROM food_listings WHERE listing_id = ? FOR UPDATE');
    $stmt->execute([$listing_id]);
    $listing = $stmt->fetch();

    if (!$listing) {
        $pdo->rollBack();
        fail('That listing no longer exists.', 404);
    }
    if ((int) $listing['user_id'] === $user_id) {
        $pdo->rollBack();
        fail('You cannot book your own food.', 403);
    }
    if ($listing['status'] !== 'Available') {
        $pdo->rollBack();
        fail('Sorry, someone else just booked this food.', 409);
    }
    if ($listing['expiry_time'] <= date('Y-m-d H:i:s')) {
        $pdo->rollBack();
        fail('This food has passed its expiry time.', 410);
    }

    $pdo->prepare("INSERT INTO bookings (listing_id, user_id, booking_time, status) VALUES (?, ?, ?, 'Booked')")
        ->execute([$listing_id, $user_id, date('Y-m-d H:i:s')]);
    $booking_id = (int) $pdo->lastInsertId();

    $pdo->prepare("UPDATE food_listings SET status = 'Booked' WHERE listing_id = ?")
        ->execute([$listing_id]);

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    fail('Could not complete the booking. Please try again.', 500);
}

respond(['success' => true, 'booking_id' => $booking_id], 201);
