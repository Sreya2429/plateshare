<?php
// GET: returns the logged-in user (or null). React calls this when the app loads.
require_once __DIR__ . '/db.php';

$user = null;
if (!empty($_SESSION['user_id'])) {
    $stmt = $pdo->prepare('SELECT user_id, name, email, phone, user_type, role FROM users WHERE user_id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch() ?: null;
    if (!$user) {            // account no longer exists
        $_SESSION = [];
    }
}
respond(['success' => true, 'user' => $user]);
