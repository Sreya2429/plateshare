<?php
// POST: email, password  ->  SELECT user, verify password, start session.
require_once __DIR__ . '/db.php';
require_method('POST');

$in       = input();
$email    = strtolower(clean($in['email'] ?? ''));
$password = (string) ($in['password'] ?? '');

if ($email === '' || $password === '') {
    fail('Enter your email and password.');
}

$stmt = $pdo->prepare('SELECT user_id, name, email, phone, user_type, password FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    fail('Email or password is incorrect.', 401);
}

session_regenerate_id(true);
$_SESSION['user_id'] = (int) $user['user_id'];
unset($user['password']);

respond(['success' => true, 'user' => $user]);
