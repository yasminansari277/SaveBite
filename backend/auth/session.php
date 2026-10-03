<?php

session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Handle browser preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "success" => false,
        "loggedIn" => false,
        "message" => "No active session."
    ]);
    exit;
}

// Return logged-in user
echo json_encode([
    "success" => true,
    "loggedIn" => true,
    "user" => [
        "id" => $_SESSION['user_id'],
        "name" => $_SESSION['user_name'],
        "email" => $_SESSION['user_email'],
        "role" => $_SESSION['user_role']
    ]
]);

?>