<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
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

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

// Validate fields
if ($email === '' || $password === '') {

    echo json_encode([
        "success" => false,
        "message" => "Email and password are required."
    ]);
    exit;
}

// Find user by email
$stmt = $conn->prepare(
    "SELECT id, name, email, password FROM users WHERE email = ?"
);

$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "User not found."
    ]);

    $stmt->close();
    $conn->close();
    exit;
}

$user = $result->fetch_assoc();

// Verify password
if (!password_verify($password, $user['password'])) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password."
    ]);

    $stmt->close();
    $conn->close();
    exit;
}

// Determine role
$role = (
    strtolower($user['email']) === 'admin@savebite.com' ||
    strpos(strtolower($user['email']), 'admin') !== false
) ? 'admin' : 'user';

// Create PHP session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_role'] = $role;

// Successful login
echo json_encode([
    
    "success" => true,
    "message" => "Login successful.",
    "user" => [
        "id" => $user['id'],
        "name" => $user['name'],
        "email" => $user['email'],
        "role" => $role
    ]
]);

$stmt->close();
$conn->close();

?>