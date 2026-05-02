<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "invoice";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode([
        "success" => false,
        "message" => "Koneksi database gagal: " . $conn->connect_error
    ]);
    exit();
}

$conn->set_charset("utf8mb4");