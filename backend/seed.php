<?php
// Optional sample data. Run from the command line (not the browser):
//     php backend/seed.php
// Sample users all have the password:  password123
// Times are generated with PHP's clock, the same one the API uses, so the sample food is never "expired" on first run.

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Run this from the command line: php backend/seed.php');
}

require_once __DIR__ . '/config.php';
date_default_timezone_set(APP_TIMEZONE);

$pdo = new PDO(
    'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
    DB_USER, DB_PASS,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

if ($pdo->query('SELECT COUNT(*) FROM users')->fetchColumn() > 0) {
    exit("Users already exist, so nothing was added. Re-import database/schema.sql to start fresh.\n");
}

$hash  = password_hash('password123', PASSWORD_DEFAULT);
$users = $pdo->prepare('INSERT INTO users (name, email, phone, user_type, password) VALUES (?, ?, ?, ?, ?)');
$users->execute(['Green Leaf Restaurant', 'greenleaf@example.com', '9800000001', 'Organization', $hash]);
$users->execute(['Sunrise Bakery',        'sunrise@example.com',   '9800000002', 'Organization', $hash]);
$users->execute(['Anita Thomas',          'anita@example.com',     '9800000003', 'Individual',   $hash]);

// [user_id, category_id, name, quantity, unit, hours since prepared, hours until expiry]
$food = [
    [1, 1, 'Vegetable Biryani', 5,  'Portions', 1,  3],
    [1, 1, 'Chapati and Dal',   8,  'Portions', 2,  2],
    [2, 2, 'Whole Wheat Bread', 12, 'Loaves',   8,  20],
    [2, 2, 'Assorted Buns',     20, 'Pieces',   6,  10],
    [3, 3, 'Ripe Bananas',      2,  'Kg',       24, 48],
];
$listing = $pdo->prepare(
    "INSERT INTO food_listings (user_id, category_id, food_name, quantity, quantity_unit, prepared_time, expiry_time, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'Available')"
);
foreach ($food as [$uid, $cat, $name, $qty, $unit, $ago, $left]) {
    $listing->execute([
        $uid, $cat, $name, $qty, $unit,
        date('Y-m-d H:i:s', strtotime("-$ago hours")),
        date('Y-m-d H:i:s', strtotime("+$left hours")),
    ]);
}

echo "Added 3 users and 5 food listings.\n";
echo "Log in with greenleaf@example.com, sunrise@example.com or anita@example.com. Password: password123\n";
