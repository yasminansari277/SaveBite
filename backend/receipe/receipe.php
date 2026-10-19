<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");

require_once "../config/database.php";

$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 12;
$search = isset($_GET['search']) ? trim($_GET['search']) : "";
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($page < 1) {
    $page = 1;
}

if ($limit < 1 || $limit > 50) {
    $limit = 12;
}

$offset = ($page - 1) * $limit;

try {

    /*
    |--------------------------------------------------------------------------
    | SEARCH MODE
    |--------------------------------------------------------------------------
    */

    if ($search !== "") {

        $searchTerm = "%" . $search . "%";

        // Count matching recipes
        $countSql = "
            SELECT COUNT(*) AS total
            FROM recipes_10k
            WHERE title LIKE ?
        ";

        $countStmt = $conn->prepare($countSql);

        if (!$countStmt) {
            throw new Exception($conn->error);
        }

        $countStmt->bind_param("s", $searchTerm);
        $countStmt->execute();

        $countResult = $countStmt->get_result();
        $total = $countResult->fetch_assoc()['total'];

        // Get recipes
        $sql = "
            SELECT
                id,
                title,
                ingredients,
                directions,
                link,
                source,
                ner
            FROM recipes_10k
            WHERE title LIKE ?
            LIMIT $limit OFFSET $offset
        ";

        $stmt = $conn->prepare($sql);

        if (!$stmt) {
            throw new Exception($conn->error);
        }

        $stmt->bind_param("s", $searchTerm);

    } else {

        /*
        |--------------------------------------------------------------------------
        | NORMAL MODE
        |--------------------------------------------------------------------------
        */

        $countResult = $conn->query("
            SELECT COUNT(*) AS total
            FROM recipes_10k
        ");

        if (!$countResult) {
            throw new Exception($conn->error);
        }

        $total = $countResult->fetch_assoc()['total'];

        // Get recipes
        $sql = "
            SELECT
                id,
                title,
                ingredients,
                directions,
                link,
                source,
                ner
            FROM recipes_10k
            LIMIT $limit OFFSET $offset
        ";

        $stmt = $conn->prepare($sql);

        if (!$stmt) {
            throw new Exception($conn->error);
        }
    }


    
    /*
    |--------------------------------------------------------------------------
    | EXECUTE QUERY
    |--------------------------------------------------------------------------
    */

    $stmt->execute();

    $result = $stmt->get_result();

    $recipes = [];

    while ($row = $result->fetch_assoc()) {

        /*
        |--------------------------------------------------------------------------
        | Decode JSON fields
        |--------------------------------------------------------------------------
        */

        $ingredients = json_decode($row['ingredients'], true);
        $directions = json_decode($row['directions'], true);
        $ner = json_decode($row['ner'], true);

        if (!is_array($ingredients)) {
            $ingredients = $row['ingredients'];
        }

        if (!is_array($directions)) {
            $directions = $row['directions'];
        }

        if (!is_array($ner)) {
            $ner = $row['ner'];
        }

        /*
        |--------------------------------------------------------------------------
        | Recipe Object
        |--------------------------------------------------------------------------
        */

        $recipes[] = [
            "id" => intval($row['id']),
            "title" => $row['title'],
            "ingredients" => $ingredients,
            "directions" => $directions,
            "link" => $row['link'],
            "source" => $row['source'],
            "ner" => $ner
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | API RESPONSE
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        "success" => true,
        "page" => $page,
        "limit" => $limit,
        "total" => intval($total),
        "totalPages" => $total > 0 ? ceil($total / $limit) : 0,
        "recipes" => $recipes
    ]);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to fetch recipes",
        "error" => $e->getMessage()
    ]);
}

$conn->close();

?>