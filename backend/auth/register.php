<?php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle browser preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "../config/database.php";

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        "success" => false,
        "message" => "Only POST requests are allowed."
    ]);
    exit;
}

// Get JSON data from React
$data = json_decode(file_get_contents("php://input"), true);

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

// Validate fields
if ($name === '' || $email === '' || $password === '') {
    echo json_encode([
        "success" => false,
        "message" => "All fields are required."
    ]);
    exit;
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid email address."
    ]);
    exit;
}

// Check password length
if (strlen($password) < 6) {
    echo json_encode([
        "success" => false,
        "message" => "Password must be at least 6 characters."
    ]);
    exit;
}

// Check if email already exists
$check = $conn->prepare("SELECT id FROM users WHERE email = ?");
$check->bind_param("s", $email);
$check->execute();
$result = $check->get_result();

if ($result->num_rows > 0) {
    echo json_encode([
        "success" => false,
        "message" => "Email is already registered."
    ]);
    $check->close();
    $conn->close();
    exit;
}

$check->close();

// Hash password before storing it
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insert user
$stmt = $conn->prepare(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)"
);

$stmt->bind_param("sss", $name, $email, $hashedPassword);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Registration successful.",
        "user" => [
            "id" => $stmt->insert_id,
            "name" => $name,
            "email" => $email
        ]
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Registration failed."
    ]);
}

$stmt->close();
$conn->close();

?>