export function buatTemplateInvoice(invoice, tanggal, formatRupiah) {
  const escapeHtml = (value) => {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  };

  const nomorInvoice = `INV-${Date.now().toString().slice(-8)}`;

  const rowsHtml = invoice.items
    .map(
      (barang, index) => `
        <tr>
          <td class="text-center">${index + 1}</td>
          <td>
            <div class="item-name">${escapeHtml(barang.nama_barang)}</div>
          </td>
          <td class="text-center">${barang.jumlah}</td>
          <td class="text-right">Rp ${formatRupiah(barang.harga)}</td>
          <td class="text-right total-cell">Rp ${formatRupiah(
            barang.total_harga
          )}</td>
        </tr>
      `
    )
    .join("");

  return `
    <html>
      <head>
        <title>Invoice - ${escapeHtml(invoice.nama_pelanggan)}</title>

        <style>
          @page {
            size: A4;
            margin: 16mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
            color: #1e293b;
            background: #ffffff;
          }

          .invoice-wrapper {
            width: 100%;
            min-height: 100vh;
          }

          .top-line {
            height: 6px;
            width: 100%;
            border-radius: 999px;
            background: linear-gradient(90deg, #d946ef, #ec4899, #22d3ee);
            margin-bottom: 28px;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 24px;
            margin-bottom: 32px;
          }

          .title-block h1 {
            margin: 0;
            font-size: 38px;
            letter-spacing: 1px;
            color: #0f172a;
          }

          .title-block p {
            margin: 8px 0 0;
            font-size: 14px;
            color: #64748b;
          }

          .invoice-meta {
            min-width: 230px;
            border: 1px solid #e2e8f0;
            border-radius: 18px;
            padding: 16px;
            background: #f8fafc;
          }

          .meta-row {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            margin-bottom: 10px;
            font-size: 13px;
          }

          .meta-row:last-child {
            margin-bottom: 0;
          }

          .meta-label {
            color: #64748b;
          }

          .meta-value {
            font-weight: 700;
            color: #0f172a;
            text-align: right;
          }

          .info-grid {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 20px;
            margin-bottom: 28px;
          }

          .info-card {
            border: 1px solid #e2e8f0;
            border-radius: 18px;
            padding: 18px;
            background: #ffffff;
          }

          .info-card.soft {
            background: #f8fafc;
          }

          .info-title {
            margin-bottom: 8px;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
          }

          .customer-name {
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
          }

          .small-text {
            margin-top: 6px;
            font-size: 13px;
            color: #64748b;
            line-height: 1.5;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            overflow: hidden;
            border-radius: 18px;
          }

          thead {
            background: #0f172a;
            color: #ffffff;
          }

          th {
            padding: 14px 12px;
            font-size: 13px;
            text-align: left;
            font-weight: 700;
          }

          td {
            padding: 14px 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
            vertical-align: top;
          }

          tbody tr:nth-child(even) {
            background: #f8fafc;
          }

          tbody tr:last-child td {
            border-bottom: none;
          }

          .item-name {
            font-weight: 700;
            color: #0f172a;
          }

          .text-center {
            text-align: center;
          }

          .text-right {
            text-align: right;
          }

          .total-cell {
            font-weight: 800;
            color: #0f172a;
          }

          .summary-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 28px;
          }

          .summary-box {
            width: 330px;
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            overflow: hidden;
            background: #ffffff;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            padding: 14px 18px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
          }

          .summary-row:last-child {
            border-bottom: none;
          }

          .summary-row.grand {
            background: linear-gradient(90deg, #fdf4ff, #ecfeff);
            padding: 18px;
          }

          .summary-label {
            color: #64748b;
            font-weight: 700;
          }

          .summary-value {
            font-weight: 800;
            color: #0f172a;
          }

          .summary-row.grand .summary-label {
            color: #0f172a;
            font-size: 16px;
          }

          .summary-row.grand .summary-value {
            font-size: 22px;
            color: #0f172a;
          }

          .note-section {
            margin-top: 34px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          .note-box {
            border: 1px solid #e2e8f0;
            border-radius: 18px;
            padding: 16px;
            background: #f8fafc;
            min-height: 95px;
          }

          .note-box h4 {
            margin: 0 0 8px;
            font-size: 14px;
            color: #0f172a;
          }

          .note-box p {
            margin: 0;
            font-size: 13px;
            line-height: 1.6;
            color: #64748b;
          }

          .signature {
            text-align: center;
          }

          .signature-space {
            height: 42px;
          }

          .signature-name {
            display: inline-block;
            min-width: 180px;
            border-top: 1px solid #94a3b8;
            padding-top: 8px;
            font-size: 13px;
            color: #64748b;
          }

          .footer {
            margin-top: 34px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
          }

          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .invoice-wrapper {
              min-height: auto;
            }
          }
        </style>
      </head>

      <body>
        <div class="invoice-wrapper">
          <div class="top-line"></div>

          <div class="header">
            <div class="title-block">
              <h1>INVOICE</h1>
              <p>Dokumen tagihan pesanan pelanggan</p>
            </div>

            <div class="invoice-meta">
              <div class="meta-row">
                <span class="meta-label">No. Invoice</span>
                <span class="meta-value">${nomorInvoice}</span>
              </div>

              <div class="meta-row">
                <span class="meta-label">Tanggal</span>
                <span class="meta-value">${tanggal}</span>
              </div>

              <div class="meta-row">
                <span class="meta-label">Status</span>
                <span class="meta-value">Menunggu Pembayaran</span>
              </div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-card">
              <div class="info-title">Ditagihkan Kepada</div>
              <div class="customer-name">${escapeHtml(
                invoice.nama_pelanggan
              )}</div>
              <div class="small-text">
                Berikut adalah rincian barang dan total tagihan pesanan.
              </div>
            </div>

            <div class="info-card soft">
              <div class="info-title">Ringkasan</div>
              <div class="small-text">
                Jumlah item: <strong>${invoice.items.length}</strong>
              </div>
              <div class="small-text">
                Total tagihan: <strong>Rp ${formatRupiah(
                  invoice.grand_total
                )}</strong>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th class="text-center" style="width: 55px;">No</th>
                <th>Nama Barang</th>
                <th class="text-center" style="width: 110px;">Jumlah</th>
                <th class="text-right" style="width: 150px;">Harga</th>
                <th class="text-right" style="width: 170px;">Total</th>
              </tr>
            </thead>

            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="summary-section">
            <div class="summary-box">
              <div class="summary-row">
                <span class="summary-label">Subtotal</span>
                <span class="summary-value">Rp ${formatRupiah(
                  invoice.grand_total
                )}</span>
              </div>

              <div class="summary-row">
                <span class="summary-label">Biaya Tambahan</span>
                <span class="summary-value">Rp 0</span>
              </div>

              <div class="summary-row grand">
                <span class="summary-label">Total</span>
                <span class="summary-value">Rp ${formatRupiah(
                  invoice.grand_total
                )}</span>
              </div>
            </div>
          </div>

          <div class="note-section">
            <div class="note-box">
              <h4>Catatan</h4>
              <p>
                Harap melakukan pembayaran sesuai total tagihan yang tertera.
                Simpan invoice ini sebagai bukti transaksi.
              </p>
            </div>

            <div class="note-box signature">
              <h4>Hormat Kami</h4>
              <div class="signature-space"></div>
              <div class="signature-name">Admin</div>
            </div>
          </div>

          <div class="footer">
            Terima kasih atas kepercayaan Anda.
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;
}