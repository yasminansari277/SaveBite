<?php

session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "../config/database.php";

// Only logged-in admin can access this API
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);

    echo json_encode([
        "success" => false,
        "message" => "Admin access required."
    ]);

    exit;
}


// GET → Fetch all users
if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $result = $conn->query(
        "SELECT id, name, email, created_at
         FROM users
         ORDER BY id DESC"
    );

    $users = [];

    while ($row = $result->fetch_assoc()) {
        $users[] = [
            "uid" => (string)$row['id'],
            "name" => $row['name'],
            "email" => $row['email'],
            "created_at" => $row['created_at']
        ];
    }

    echo json_encode([
        "success" => true,
        "users" => $users
    ]);

    $conn->close();
    exit;
}


// DELETE → Delete user
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {

    $data = json_decode(file_get_contents("php://input"), true);

    $userId = $data['id'] ?? null;

    if (!$userId) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "User ID is required."
        ]);

        exit;
    }

    // Don't allow admin to delete themselves
    if ((int)$userId === (int)$_SESSION['user_id']) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "You cannot delete your own account."
        ]);

        exit;
    }

    $stmt = $conn->prepare(
        "DELETE FROM users WHERE id = ?"
    );

    $stmt->bind_param("i", $userId);

    if ($stmt->execute()) {

        if ($stmt->affected_rows > 0) {
            echo json_encode([
                "success" => true,
                "message" => "User deleted successfully."
            ]);
        } else {
            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "User not found."
            ]);
        }

    } else {
        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Failed to delete user."
        ]);
    }

    $stmt->close();
    $conn->close();
    exit;
}


// Unsupported method
http_response_code(405);

echo json_encode([
    "success" => false,
    "message" => "Method not allowed."
]);

?>