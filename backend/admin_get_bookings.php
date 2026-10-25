<?php
// GET: all bookings with the associated listing, donor, and recipient.
require_once __DIR__ . '/db.php';
require_admin($pdo);

$stmt = $pdo->query(
    'SELECT b.booking_id, b.booking_time, b.status AS booking_status,
            f.listing_id, f.food_name,
            donor.name AS donor_name, donor.email AS donor_email,
            recipient.user_id AS recipient_id, recipient.name AS recipient_name,
            recipient.email AS recipient_email
     FROM bookings b
     JOIN food_listings f ON f.listing_id = b.listing_id
     JOIN users donor ON donor.user_id = f.user_id
     JOIN users recipient ON recipient.user_id = b.user_id
     ORDER BY b.booking_time DESC, b.booking_id DESC'
);
respond(['success' => true, 'bookings' => $stmt->fetchAll()]);