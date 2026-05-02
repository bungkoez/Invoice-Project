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

/*
|--------------------------------------------------------------------------
| SUMMARY DASHBOARD
|--------------------------------------------------------------------------
*/
$sqlSummary = "SELECT
    (
        SELECT COUNT(DISTINCT nama_pelanggan)
        FROM d_barang
        WHERE COALESCE(status_pesanan, 'Aktif') != 'Selesai'
    ) AS total_pelanggan_aktif,

    (
        SELECT COUNT(*)
        FROM d_barang
        WHERE COALESCE(status_pesanan, 'Aktif') != 'Selesai'
    ) AS total_barang_aktif,

    (
        SELECT COALESCE(SUM(total_harga), 0)
        FROM d_barang
        WHERE COALESCE(status_pesanan, 'Aktif') != 'Selesai'
    ) AS total_pendapatan,

    (
        SELECT COALESCE(SUM(total_harga), 0)
        FROM d_barang
        WHERE COALESCE(status_pesanan, 'Aktif') != 'Selesai'
        AND COALESCE(status_pembayaran, 'Belum Lunas') = 'Belum Lunas'
    ) AS saldo_belum_dibayar,

    (
        SELECT COUNT(DISTINCT nama_pelanggan)
        FROM d_barang
        WHERE COALESCE(status_pesanan, 'Aktif') != 'Selesai'
        AND COALESCE(status_invoice, 'Belum') = 'Sudah'
    ) AS invoice_dibuat,

    (
        SELECT COUNT(*)
        FROM history
        WHERE COALESCE(status_pesanan, 'Selesai') = 'Selesai'
    ) AS pesanan_selesai";

$resultSummary = $conn->query($sqlSummary);

if (!$resultSummary) {
    echo json_encode([
        "success" => false,
        "message" => "Gagal mengambil summary dashboard: " . $conn->error
    ]);
    $conn->close();
    exit();
}

$summaryRow = $resultSummary->fetch_assoc();

$summary = [
    "totalPelangganAktif" => (int)$summaryRow["total_pelanggan_aktif"],
    "totalBarangAktif" => (int)$summaryRow["total_barang_aktif"],
    "totalPendapatan" => (float)$summaryRow["total_pendapatan"],
    "saldoBelumDibayar" => (float)$summaryRow["saldo_belum_dibayar"],
    "invoiceDibuat" => (int)$summaryRow["invoice_dibuat"],
    "pesananSelesai" => (int)$summaryRow["pesanan_selesai"]
];

/*
|--------------------------------------------------------------------------
| PESANAN AKTIF TERBARU
|--------------------------------------------------------------------------
*/
$sqlPesananTerbaru = "SELECT
        nama_pelanggan,
        COUNT(*) AS total_item,
        SUM(jumlah) AS total_barang,
        SUM(total_harga) AS total_harga,
        MAX(COALESCE(status_invoice, 'Belum')) AS status_invoice,
        MAX(COALESCE(status_pembayaran, 'Belum Lunas')) AS status_pembayaran,
        MAX(COALESCE(status_pengiriman, 'Menunggu')) AS status_pengiriman,
        MAX(id) AS id_terakhir
    FROM d_barang
    WHERE COALESCE(status_pesanan, 'Aktif') != 'Selesai'
    GROUP BY nama_pelanggan
    ORDER BY id_terakhir DESC
    LIMIT 5";

$resultPesananTerbaru = $conn->query($sqlPesananTerbaru);

if (!$resultPesananTerbaru) {
    echo json_encode([
        "success" => false,
        "message" => "Gagal mengambil pesanan terbaru: " . $conn->error
    ]);
    $conn->close();
    exit();
}

$pesananTerbaru = [];

while ($row = $resultPesananTerbaru->fetch_assoc()) {
    $pesananTerbaru[] = [
        "namaPelanggan" => $row["nama_pelanggan"],
        "totalItem" => (int)$row["total_item"],
        "totalBarang" => (int)$row["total_barang"],
        "totalHarga" => (float)$row["total_harga"],
        "statusInvoice" => $row["status_invoice"] ?: "Belum",
        "statusPembayaran" => $row["status_pembayaran"] ?: "Belum Lunas",
        "statusPengiriman" => $row["status_pengiriman"] ?: "Menunggu"
    ];
}

/*
|--------------------------------------------------------------------------
| RIWAYAT TERBARU
|--------------------------------------------------------------------------
*/
$sqlHistoryTerbaru = "SELECT
        id_history,
        nama_pelanggan,
        nama_barang,
        total_barang,
        status_pesanan
    FROM history
    ORDER BY id_history DESC
    LIMIT 5";

$resultHistoryTerbaru = $conn->query($sqlHistoryTerbaru);

if (!$resultHistoryTerbaru) {
    echo json_encode([
        "success" => false,
        "message" => "Gagal mengambil history terbaru: " . $conn->error
    ]);
    $conn->close();
    exit();
}

$historyTerbaru = [];

while ($row = $resultHistoryTerbaru->fetch_assoc()) {
    $historyTerbaru[] = [
        "idHistory" => (int)$row["id_history"],
        "namaPelanggan" => $row["nama_pelanggan"],
        "namaBarang" => $row["nama_barang"],
        "totalBarang" => (int)$row["total_barang"],
        "statusPesanan" => $row["status_pesanan"] ?: "Selesai"
    ];
}

echo json_encode([
    "success" => true,
    "data" => [
        "summary" => $summary,
        "pesananTerbaru" => $pesananTerbaru,
        "historyTerbaru" => $historyTerbaru
    ]
]);

$conn->close();
?>