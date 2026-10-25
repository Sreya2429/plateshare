<?php
// GET: all user details safe for display; never return password hashes.
require_once __DIR__ . '/db.php';
require_admin($pdo);

$stmt = $pdo->query(
    'SELECT user_id, name, email, phone, user_type, role
     FROM users
     ORDER BY user_id DESC'
);
respond(['success' => true, 'users' => $stmt->fetchAll()]);