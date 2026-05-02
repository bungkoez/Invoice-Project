<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . "/Koneksi.php";

/*
|--------------------------------------------------------------------------
| GET HISTORY PESANAN
|--------------------------------------------------------------------------
*/
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['mode']) && $_GET['mode'] === 'history') {
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
    exit();
}

/*
|--------------------------------------------------------------------------
| GET DETAIL BARANG PER PELANGGAN
|--------------------------------------------------------------------------
*/
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['mode']) && $_GET['mode'] === 'detail') {
    $nama_pelanggan = trim($_GET['nama_pelanggan'] ?? "");

    if ($nama_pelanggan === "") {
        echo json_encode([
            "success" => false,
            "message" => "Nama pelanggan wajib diisi."
        ]);
        $conn->close();
        exit();
    }

    $sql = "SELECT 
                id,
                nama_pelanggan,
                nama_barang,
                jumlah,
                modal,
                ongkos_kirim,
                margin_persen,
                harga_jual,
                total_harga
            FROM d_barang
            WHERE nama_pelanggan = ?
              AND COALESCE(status_pesanan, 'Aktif') != 'Selesai'
            ORDER BY id ASC";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        echo json_encode([
            "success" => false,
            "message" => "Prepare statement gagal: " . $conn->error
        ]);
        $conn->close();
        exit();
    }

    $stmt->bind_param("s", $nama_pelanggan);
    $stmt->execute();
    $result = $stmt->get_result();

    $items = [];

    while ($row = $result->fetch_assoc()) {
        $items[] = [
            "id" => (int)$row["id"],
            "nama_pelanggan" => $row["nama_pelanggan"],
            "nama_barang" => $row["nama_barang"],
            "jumlah" => (int)$row["jumlah"],
            "modal" => (float)$row["modal"],
            "ongkos_kirim" => (float)$row["ongkos_kirim"],
            "margin_persen" => (float)$row["margin_persen"],
            "harga_jual" => (float)$row["harga_jual"],
            "total_harga" => (float)$row["total_harga"]
        ];
    }

    echo json_encode([
        "success" => true,
        "data" => $items
    ]);

    $stmt->close();
    $conn->close();
    exit();
}

/*
|--------------------------------------------------------------------------
| GET INVOICE
|--------------------------------------------------------------------------
*/
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['mode']) && $_GET['mode'] === 'invoice') {
    $nama_pelanggan = trim($_GET['nama_pelanggan'] ?? "");

    if ($nama_pelanggan === "") {
        echo json_encode([
            "success" => false,
            "message" => "Nama pelanggan wajib diisi."
        ]);
        $conn->close();
        exit();
    }

    $sql = "SELECT 
                nama_pelanggan,
                nama_barang,
                jumlah,
                harga_jual,
                total_harga
            FROM d_barang
            WHERE nama_pelanggan = ?
              AND COALESCE(status_pesanan, 'Aktif') != 'Selesai'
            ORDER BY id ASC";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        echo json_encode([
            "success" => false,
            "message" => "Prepare statement gagal: " . $conn->error
        ]);
        $conn->close();
        exit();
    }

    $stmt->bind_param("s", $nama_pelanggan);
    $stmt->execute();
    $result = $stmt->get_result();

    $items = [];
    $grandTotal = 0;

    while ($row = $result->fetch_assoc()) {
        $items[] = [
            "nama_barang" => $row["nama_barang"],
            "jumlah" => (int)$row["jumlah"],
            "harga" => (float)$row["harga_jual"],
            "total_harga" => (float)$row["total_harga"]
        ];

        $grandTotal += (float)$row["total_harga"];
    }

    echo json_encode([
        "success" => true,
        "data" => [
            "nama_pelanggan" => $nama_pelanggan,
            "items" => $items,
            "grand_total" => $grandTotal
        ]
    ]);

    $stmt->close();
    $conn->close();
    exit();
}

/*
|--------------------------------------------------------------------------
| GET LIST PESANAN / PELANGGAN AKTIF
|--------------------------------------------------------------------------
*/
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT 
                nama_pelanggan,
                SUM(jumlah) AS total_barang,
                SUM(total_harga) AS total_harga,
                MAX(COALESCE(status_invoice, 'Belum')) AS status_invoice,
                MAX(COALESCE(status_pembayaran, 'Belum Lunas')) AS status_pembayaran,
                MAX(COALESCE(status_pengiriman, 'Menunggu')) AS status_pengiriman
            FROM d_barang
            WHERE COALESCE(status_pesanan, 'Aktif') != 'Selesai'
            GROUP BY nama_pelanggan
            ORDER BY nama_pelanggan ASC";

    $result = $conn->query($sql);

    if (!$result) {
        echo json_encode([
            "success" => false,
            "message" => "Gagal mengambil data: " . $conn->error
        ]);
        $conn->close();
        exit();
    }

    $data = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = [
            "namaPelanggan" => $row["nama_pelanggan"],
            "totalBarang" => (int)$row["total_barang"],
            "totalHarga" => (float)$row["total_harga"],
            "statusInvoice" => $row["status_invoice"] ?: "Belum",
            "statusPembayaran" => $row["status_pembayaran"] ?: "Belum Lunas",
            "statusPengiriman" => $row["status_pengiriman"] ?: "Menunggu"
        ];
    }

    echo json_encode([
        "success" => true,
        "data" => $data
    ]);

    $conn->close();
    exit();
}

/*
|--------------------------------------------------------------------------
| PUT UPDATE STATUS / UPDATE BARANG
|--------------------------------------------------------------------------
*/
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        echo json_encode([
            "success" => false,
            "message" => "Data JSON tidak valid."
        ]);
        $conn->close();
        exit();
    }

    if (($data["mode"] ?? "") === "update_barang") {
        $id = (int)($data["id"] ?? 0);
        $nama_barang = trim($data["nama_barang"] ?? "");
        $jumlah = (int)($data["jumlah"] ?? 0);
        $modal = (float)($data["modal"] ?? 0);
        $ongkos_kirim = (float)($data["ongkos_kirim"] ?? 0);
        $margin_persen = (float)($data["margin_persen"] ?? 0);
        $harga_jual = (float)($data["harga_jual"] ?? 0);
        $total_harga = (float)($data["total_harga"] ?? 0);

        if ($id <= 0 || $nama_barang === "" || $jumlah <= 0) {
            echo json_encode([
                "success" => false,
                "message" => "Data barang tidak valid."
            ]);
            $conn->close();
            exit();
        }

        $sql = "UPDATE d_barang
                SET nama_barang = ?,
                    jumlah = ?,
                    modal = ?,
                    ongkos_kirim = ?,
                    margin_persen = ?,
                    harga_jual = ?,
                    total_harga = ?
                WHERE id = ?
                  AND COALESCE(status_pesanan, 'Aktif') != 'Selesai'";

        $stmt = $conn->prepare($sql);

        if (!$stmt) {
            echo json_encode([
                "success" => false,
                "message" => "Prepare statement gagal: " . $conn->error
            ]);
            $conn->close();
            exit();
        }

        $stmt->bind_param(
            "sidddddi",
            $nama_barang,
            $jumlah,
            $modal,
            $ongkos_kirim,
            $margin_persen,
            $harga_jual,
            $total_harga,
            $id
        );

        if ($stmt->execute()) {
            echo json_encode([
                "success" => true,
                "message" => "Barang berhasil diperbarui."
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Gagal update barang: " . $stmt->error
            ]);
        }

        $stmt->close();
        $conn->close();
        exit();
    }

    $nama_pelanggan = trim($data["nama_pelanggan"] ?? "");
    $status_invoice = trim($data["status_invoice"] ?? "Belum");
    $status_pembayaran = trim($data["status_pembayaran"] ?? "Belum Lunas");
    $status_pengiriman = trim($data["status_pengiriman"] ?? "Menunggu");

    if ($nama_pelanggan === "") {
        echo json_encode([
            "success" => false,
            "message" => "Nama pelanggan wajib diisi."
        ]);
        $conn->close();
        exit();
    }

    $sql = "UPDATE d_barang
            SET status_invoice = ?,
                status_pembayaran = ?,
                status_pengiriman = ?
            WHERE nama_pelanggan = ?
              AND COALESCE(status_pesanan, 'Aktif') != 'Selesai'";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        echo json_encode([
            "success" => false,
            "message" => "Prepare statement gagal: " . $conn->error
        ]);
        $conn->close();
        exit();
    }

    $stmt->bind_param(
        "ssss",
        $status_invoice,
        $status_pembayaran,
        $status_pengiriman,
        $nama_pelanggan
    );

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Status berhasil diperbarui."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Gagal update status: " . $stmt->error
        ]);
    }

    $stmt->close();
    $conn->close();
    exit();
}

/*
|--------------------------------------------------------------------------
| DELETE / SELESAIKAN PESANAN
| Masuk ke tabel history.
| Data tetap ada di d_barang, tapi status_pesanan jadi Selesai.
|--------------------------------------------------------------------------
*/
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = (int)($data["id"] ?? 0);

    if ($id <= 0) {
        echo json_encode([
            "success" => false,
            "message" => "ID barang tidak valid."
        ]);
        $conn->close();
        exit();
    }

    $conn->begin_transaction();

    try {
        $sqlHistory = "INSERT INTO history (
                            nama_pelanggan,
                            nama_barang,
                            total_barang,
                            status_pesanan
                        )
                        SELECT
                            nama_pelanggan,
                            nama_barang,
                            jumlah,
                            'Selesai'
                        FROM d_barang
                        WHERE id = ?
                          AND COALESCE(status_pesanan, 'Aktif') != 'Selesai'";

        $stmtHistory = $conn->prepare($sqlHistory);

        if (!$stmtHistory) {
            throw new Exception("Prepare history gagal: " . $conn->error);
        }

        $stmtHistory->bind_param("i", $id);

        if (!$stmtHistory->execute()) {
            throw new Exception("Gagal menyimpan ke history: " . $stmtHistory->error);
        }

        if ($stmtHistory->affected_rows <= 0) {
            throw new Exception("Data barang tidak ditemukan atau sudah selesai.");
        }

        $sqlUpdate = "UPDATE d_barang
                      SET status_pesanan = 'Selesai'
                      WHERE id = ?";

        $stmtUpdate = $conn->prepare($sqlUpdate);

        if (!$stmtUpdate) {
            throw new Exception("Prepare update status pesanan gagal: " . $conn->error);
        }

        $stmtUpdate->bind_param("i", $id);

        if (!$stmtUpdate->execute()) {
            throw new Exception("Gagal update status pesanan: " . $stmtUpdate->error);
        }

        $conn->commit();

        echo json_encode([
            "success" => true,
            "message" => "Pesanan berhasil masuk ke Riwayat dan tidak tampil lagi di menu Pelanggan."
        ]);

        $stmtHistory->close();
        $stmtUpdate->close();
    } catch (Exception $e) {
        $conn->rollback();

        echo json_encode([
            "success" => false,
            "message" => $e->getMessage()
        ]);
    }

    $conn->close();
    exit();
}

/*
|--------------------------------------------------------------------------
| POST INSERT DATA
|--------------------------------------------------------------------------
*/
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode([
        "success" => false,
        "message" => "Data JSON tidak valid."
    ]);
    $conn->close();
    exit();
}

$nama_pelanggan = trim($data["nama_pelanggan"] ?? "");
$items = $data["items"] ?? [];

if ($nama_pelanggan === "") {
    echo json_encode([
        "success" => false,
        "message" => "Nama pelanggan wajib diisi."
    ]);
    $conn->close();
    exit();
}

if (!is_array($items) || count($items) === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Detail barang tidak boleh kosong."
    ]);
    $conn->close();
    exit();
}

$sql = "INSERT INTO d_barang 
        (
            nama_pelanggan,
            nama_barang,
            jumlah,
            modal,
            ongkos_kirim,
            margin_persen,
            harga_jual,
            total_harga,
            status_pesanan
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Prepare statement gagal: " . $conn->error
    ]);
    $conn->close();
    exit();
}

$conn->begin_transaction();

try {
    foreach ($items as $item) {
        $nama_barang = trim($item["nama_barang"] ?? "");
        $jumlah = (int)($item["jumlah"] ?? 0);
        $modal = (float)($item["modal"] ?? 0);
        $ongkos_kirim = (float)($item["ongkos_kirim"] ?? 0);
        $margin_persen = (float)($item["margin_persen"] ?? 0);
        $harga_jual = (float)($item["harga_jual"] ?? 0);
        $total_harga = (float)($item["total_harga"] ?? 0);
        $status_pesanan = "Aktif";

        if ($nama_barang === "" || $jumlah <= 0) {
            throw new Exception("Nama barang dan jumlah wajib valid.");
        }

        $stmt->bind_param(
            "ssiddddds",
            $nama_pelanggan,
            $nama_barang,
            $jumlah,
            $modal,
            $ongkos_kirim,
            $margin_persen,
            $harga_jual,
            $total_harga,
            $status_pesanan
        );

        if (!$stmt->execute()) {
            throw new Exception("Gagal menyimpan data: " . $stmt->error);
        }
    }

    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => "Data berhasil disimpan."
    ]);
} catch (Exception $e) {
    $conn->rollback();

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}

$stmt->close();
$conn->close();
?>