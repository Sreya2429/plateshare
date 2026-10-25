<?php
// POST: name, email, phone, user_type, password  ->  INSERT into users, then log the user in.
require_once __DIR__ . '/db.php';
require_method('POST');

$in        = input();
$name      = clean($in['name'] ?? '');
$email     = strtolower(clean($in['email'] ?? ''));
$phone     = clean($in['phone'] ?? '');
$user_type = clean($in['user_type'] ?? '');
$password  = (string) ($in['password'] ?? '');

if ($name === '' || strlen($name) > 100)                  fail('Enter your name.');
if (!filter_var($email, FILTER_VALIDATE_EMAIL))           fail('Enter a valid email address.');
if (!preg_match('/^[0-9+\-\s]{7,20}$/', $phone))          fail('Enter a valid phone number (7 to 20 digits).');
if (!in_array($user_type, ['Individual', 'Organization'], true)) fail('Choose Individual or Organization.');
if (strlen($password) < 6)                                fail('Password must be at least 6 characters.');

$exists = $pdo->prepare('SELECT 1 FROM users WHERE email = ?');
$exists->execute([$email]);
if ($exists->fetchColumn()) {
    fail('An account with this email already exists. Try logging in.', 409);
}

$stmt = $pdo->prepare(
    'INSERT INTO users (name, email, phone, user_type, password) VALUES (?, ?, ?, ?, ?)'
);
$stmt->execute([$name, $email, $phone, $user_type, password_hash($password, PASSWORD_DEFAULT)]);

session_regenerate_id(true);
$_SESSION['user_id'] = (int) $pdo->lastInsertId();

respond([
    'success' => true,
    'user'    => ['user_id' => $_SESSION['user_id'], 'name' => $name, 'email' => $email, 'phone' => $phone, 'user_type' => $user_type],
], 201);
