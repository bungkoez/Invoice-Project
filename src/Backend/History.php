<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . "/Koneksi.php";

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode([
        "success" => false,
        "message" => "Method tidak diizinkan."
    ]);
    $conn->close();
    exit();
}

$sql = "SELECT 
            id_history,
            nama_pelanggan,
            nama_barang,
            total_barang,
            status_pesanan
        FROM history
        ORDER BY id_history DESC";

$result = $conn->query($sql);

if (!$result) {
    echo json_encode([
        "success" => false,
        "message" => "Gagal mengambil data history: " . $conn->error
    ]);
    $conn->close();
    exit();
}

$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = [
        "idHistory" => (int)$row["id_history"],
        "namaPelanggan" => $row["nama_pelanggan"],
        "namaBarang" => $row["nama_barang"],
        "totalBarang" => (int)$row["total_barang"],
        "statusPesanan" => $row["status_pesanan"] ?: "Selesai"
    ];
}

echo json_encode([
    "success" => true,
    "data" => $data
]);

$conn->close();
?>