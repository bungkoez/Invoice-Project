<?php
mysqli_report(MYSQLI_REPORT_OFF);

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = "sql103.byetcluster.com";
$user = "if0_41811186";
$pass = "qGuz7RuMnABF";
$db   = "if0_41811186_Invoice";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode([
        "success" => false,
        "message" => "Koneksi database gagal.",
        "error" => $conn->connect_error
    ]);
    exit();
}

$conn->set_charset("utf8mb4");
?>