<?php
// POST: ends the session.
require_once __DIR__ . '/db.php';
require_method('POST');

$_SESSION = [];
session_destroy();
respond(['success' => true]);
