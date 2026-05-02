<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . "/Koneksi.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        "success" => false,
        "message" => "Method tidak diizinkan."
    ]);
    $conn->close();
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$username = trim($data["username"] ?? "");
$password = trim($data["password"] ?? "");

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
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Username tidak ditemukan."
    ]);
    $stmt->close();
    $conn->close();
    exit();
}

$row = $result->fetch_assoc();

$passwordDatabase = $row["password"];

/*
|--------------------------------------------------------------------------
| Cek Password
| Untuk sekarang cocok dengan password biasa seperti: 12345
| Kalau nanti pakai password_hash(), tetap bisa dicek dengan password_verify()
|--------------------------------------------------------------------------
*/
$passwordCocok = false;

if ($password === $passwordDatabase) {
    $passwordCocok = true;
} else if (password_verify($password, $passwordDatabase)) {
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
        "idUser" => (int)$row["id_user"],
        "username" => $row["username"]
    ]
]);

$stmt->close();
$conn->close();
?>