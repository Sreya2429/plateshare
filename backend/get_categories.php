<?php
// GET: all food categories (SELECT + ORDER BY).
require_once __DIR__ . '/db.php';

$rows = $pdo->query('SELECT category_id, category_name FROM food_categories ORDER BY category_name')->fetchAll();
respond(['success' => true, 'categories' => $rows]);
