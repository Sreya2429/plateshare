<?php
// POST: booking_id  ->  UPDATE booking to 'Cancelled' and put the listing back to 'Available'.
require_once __DIR__ . '/db.php';
require_method('POST');
$user_id = require_login();

$booking_id = (int) (input()['booking_id'] ?? 0);

$pdo->beginTransaction();
try {
    $stmt = $pdo->prepare('SELECT listing_id, user_id, status FROM bookings WHERE booking_id = ? FOR UPDATE');
    $stmt->execute([$booking_id]);
    $booking = $stmt->fetch();

    if (!$booking || (int) $booking['user_id'] !== $user_id) {
        $pdo->rollBack();
        fail('Booking not found.', 404);
    }
    if ($booking['status'] !== 'Booked') {
        $pdo->rollBack();
        fail('This booking is already cancelled.', 409);
    }

    $pdo->prepare("UPDATE bookings SET status = 'Cancelled' WHERE booking_id = ?")
        ->execute([$booking_id]);
    $pdo->prepare("UPDATE food_listings SET status = 'Available' WHERE listing_id = ?")
        ->execute([$booking['listing_id']]);

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    fail('Could not cancel the booking. Please try again.', 500);
}

respond(['success' => true]);
