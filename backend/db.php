<?php
// db.php - included by every endpoint.
// Connects to MySQL (PDO), starts the session, and provides small helpers.

require_once __DIR__ . '/config.php';

date_default_timezone_set(APP_TIMEZONE);
session_start();

header('Content-Type: application/json; charset=utf-8');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, ALLOWED_ORIGINS, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
    // Make MySQL's NOW() agree with PHP's clock (matters for the demo queries in database/demo_queries.sql).
    $pdo->exec("SET time_zone = '" . date('P') . "'");
} catch (PDOException $e) {
    respond(['success' => false, 'error' => 'Cannot connect to the database. Check backend/config.php.'], 500);
}

/** Send a JSON response and stop. */
function respond(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data);
    exit;
}

/** Send an error response and stop. */
function fail(string $message, int $status = 400): void
{
    respond(['success' => false, 'error' => $message], $status);
}

/** Only allow the given HTTP method. */
function require_method(string $method): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $method) {
        fail("Use $method for this endpoint.", 405);
    }
}

/** Read the JSON body sent by React's fetch(). */
function input(): array
{
    $data = json_decode(file_get_contents('php://input'), true);
    return is_array($data) ? $data : [];
}

/** Return the logged-in user's id, or stop with a 401. */
function require_login(): int
{
    if (empty($_SESSION['user_id'])) {
        fail('Please log in to continue.', 401);
    }
    return (int) $_SESSION['user_id'];
}

/** Trim a string input safely. */
function clean($value): string
{
    return trim((string) ($value ?? ''));
}

/**
 * Validate and normalise the food form fields shared by add_food.php and update_food.php.
 * Returns the cleaned values, or stops with a 400 error.
 */
function validate_food(PDO $pdo, array $in): array
{
    $food_name = clean($in['food_name'] ?? '');
    $unit      = clean($in['quantity_unit'] ?? '');
    $category  = (int) ($in['category_id'] ?? 0);
    $quantity  = $in['quantity'] ?? '';

    if ($food_name === '' || strlen($food_name) > 120) {
        fail('Enter a food name (up to 120 characters).');
    }
    if ($unit === '' || strlen($unit) > 30) {
        fail('Enter a quantity unit, such as Portions or Kg.');
    }
    if (filter_var($quantity, FILTER_VALIDATE_INT) === false || (int) $quantity < 1) {
        fail('Quantity must be a whole number of 1 or more.');
    }

    $check = $pdo->prepare('SELECT 1 FROM food_categories WHERE category_id = ?');
    $check->execute([$category]);
    if (!$check->fetchColumn()) {
        fail('Choose a category.');
    }

    $prepared = parse_datetime($in['prepared_time'] ?? '');
    $expiry   = parse_datetime($in['expiry_time'] ?? '');
    if (!$prepared || !$expiry) {
        fail('Enter valid prepared and expiry times.');
    }
    if ($expiry <= $prepared) {
        fail('Expiry time must be after the prepared time.');
    }

    return [
        'food_name'     => $food_name,
        'category_id'   => $category,
        'quantity'      => (int) $quantity,
        'quantity_unit' => $unit,
        'prepared_time' => $prepared->format('Y-m-d H:i:s'),
        'expiry_time'   => $expiry->format('Y-m-d H:i:s'),
    ];
}

/** Accepts "2026-10-07T18:30", "2026-10-07 18:30" or with seconds. */
function parse_datetime($value): ?DateTime
{
    $value = str_replace('T', ' ', clean($value));
    foreach (['Y-m-d H:i:s', 'Y-m-d H:i'] as $format) {
        $dt = DateTime::createFromFormat($format, $value);
        if ($dt && $dt->format($format) === $value) {
            return $dt;
        }
    }
    return null;
}
