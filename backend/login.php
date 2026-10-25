<?php
// POST: email, password  ->  SELECT user, verify password, start session.
require_once __DIR__ . '/db.php';
require_method('POST');

$in       = input();
$email    = strtolower(clean($in['email'] ?? ''));
$password = (string) ($in['password'] ?? '');
$login_type = clean($in['login_type'] ?? '');

if ($email === '' || $password === '') {
    fail('Enter your email and password.');
}
if (!in_array($login_type, ['user', 'admin'], true)) {
    fail('Choose User Login or Admin Login.');
}

$stmt = $pdo->prepare('SELECT user_id, name, email, phone, user_type, role, password FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    fail('Email or password is incorrect.', 401);
}
if ($user['role'] !== $login_type) {
    if ($login_type === 'admin') {
        fail('This account does not have admin access. Please select User Login.', 403);
    }
    fail('This account has admin access. Please select Admin Login.', 403);
}

session_regenerate_id(true);
$_SESSION['user_id'] = (int) $user['user_id'];
unset($user['password']);

respond(['success' => true, 'user' => $user]);
