<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

require_once __DIR__ . "/Koneksi.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        "success" => false,
        "message" => "Endpoint Login.php aktif. Gunakan method POST untuk login."
    ]);
    $conn->close();
    exit();
}

/*
| Ambil data dari form-urlencoded atau JSON
*/
$username = "";
$password = "";

if (!empty($_POST)) {
    $username = trim($_POST["username"] ?? "");
    $password = trim($_POST["password"] ?? "");
} else {
    $rawInput = file_get_contents("php://input");
    $data = json_decode($rawInput, true);

    if (is_array($data)) {
        $username = trim($data["username"] ?? "");
        $password = trim($data["password"] ?? "");
    }
}

if ($username === "" || $password === "") {
    echo json_encode([
        "success" => false,
        "message" => "Username dan password wajib diisi."
    ]);
    $conn->close();
    exit();
}

$sql = "SELECT id_user, username, password 
        FROM `user`
        WHERE username = ?
        LIMIT 1";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Prepare statement gagal: " . $conn->error
    ]);
    $conn->close();
    exit();
}

$stmt->bind_param("s", $username);

if (!$stmt->execute()) {
    echo json_encode([
        "success" => false,
        "message" => "Query gagal dijalankan: " . $stmt->error
    ]);
    $stmt->close();
    $conn->close();
    exit();
}

$stmt->store_result();

if ($stmt->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Username tidak ditemukan."
    ]);
    $stmt->close();
    $conn->close();
    exit();
}

$stmt->bind_result($idUser, $usernameDb, $passwordDatabase);
$stmt->fetch();

$passwordCocok = false;

if ($password === $passwordDatabase) {
    $passwordCocok = true;
} elseif (password_verify($password, $passwordDatabase)) {
    $passwordCocok = true;
}

if (!$passwordCocok) {
    echo json_encode([
        "success" => false,
        "message" => "Password salah."
    ]);
    $stmt->close();
    $conn->close();
    exit();
}

echo json_encode([
    "success" => true,
    "message" => "Login berhasil.",
    "data" => [
        "idUser" => (int)$idUser,
        "username" => $usernameDb
    ]
]);

$stmt->close();
$conn->close();
?>