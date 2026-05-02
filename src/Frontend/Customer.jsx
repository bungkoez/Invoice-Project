import { useEffect, useMemo, useState } from "react";
import { buatTemplateInvoice } from "./Invoicetemplate";

const API_URL = "https://invoice-project.infinityfreeapp.com/api/Detailbarang.php";

export default function OrderList() {
  const [dataPesanan, setDataPesanan] = useState([]);
  const [halamanAktif, setHalamanAktif] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updatingNama, setUpdatingNama] = useState("");

  const [modalTipe, setModalTipe] = useState("");
  const [modalNama, setModalNama] = useState("");
  const [detailItems, setDetailItems] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const itemPerHalaman = 5;

  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID").format(angka || 0);

  const hitungTotalHarga = (item) => {
    return Number(item.jumlah || 0) * Number(item.harga_jual || 0);
  };

  const ambilDataPesanan = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);
      const text = await response.text();

      let result;
      try {
        result = JSON.parse(text);
      } catch {
        console.error("Response bukan JSON:", text);
        throw new Error("Response PHP bukan JSON. Cek Detailbarang.php.");
      }

      if (result.success) {
        setDataPesanan(result.data || []);
      } else {
        alert(result.message || "Gagal mengambil data pesanan.");
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Terjadi kesalahan saat mengambil data pesanan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ambilDataPesanan();
  }, []);

  const ambilDetailPesanan = async (namaPelanggan) => {
    setLoadingDetail(true);

    try {
      const response = await fetch(
        `${API_URL}?mode=detail&nama_pelanggan=${encodeURIComponent(
          namaPelanggan
        )}`
      );

      const text = await response.text();

      let result;
      try {
        result = JSON.parse(text);
      } catch {
        console.error("Response detail bukan JSON:", text);
        throw new Error("Response detail bukan JSON.");
      }

      if (!result.success) {
        throw new Error(result.message || "Gagal mengambil detail pesanan.");
      }

      setDetailItems(result.data || []);
    } catch (error) {
      console.error(error);
      alert(error.message || "Terjadi kesalahan saat mengambil detail.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const bukaModal = async (tipe, namaPelanggan) => {
    setModalTipe(tipe);
    setModalNama(namaPelanggan);
    setEditItem(null);
    await ambilDetailPesanan(namaPelanggan);
  };

  const tutupModal = () => {
    setModalTipe("");
    setModalNama("");
    setDetailItems([]);
    setEditItem(null);
  };

  const totalPesanan = dataPesanan.length;

  const totalPendapatan = useMemo(() => {
    return dataPesanan.reduce(
      (acc, item) => acc + Number(item.totalHarga || 0),
      0
    );
  }, [dataPesanan]);

  const saldoBelumDibayar = useMemo(() => {
    return dataPesanan
      .filter((item) => item.statusPembayaran === "Belum Lunas")
      .reduce((acc, item) => acc + Number(item.totalHarga || 0), 0);
  }, [dataPesanan]);

  const totalHalaman = Math.ceil(dataPesanan.length / itemPerHalaman) || 1;
  const indexAwal = (halamanAktif - 1) * itemPerHalaman;
  const indexAkhir = indexAwal + itemPerHalaman;
  const dataTampil = dataPesanan.slice(indexAwal, indexAkhir);

  const updateStatus = async (
    namaPelanggan,
    statusInvoice,
    statusPembayaran,
    statusPengiriman
  ) => {
    const response = await fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nama_pelanggan: namaPelanggan,
        status_invoice: statusInvoice,
        status_pembayaran: statusPembayaran,
        status_pengiriman: statusPengiriman,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Gagal menyimpan status.");
    }
  };

  const updateBarang = async () => {
    if (!editItem) return;

    if (!editItem.nama_barang || Number(editItem.jumlah) <= 0) {
      alert("Nama barang dan jumlah wajib diisi dengan benar.");
      return;
    }

    const total_harga = hitungTotalHarga(editItem);

    const response = await fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "update_barang",
        id: editItem.id,
        nama_barang: editItem.nama_barang,
        jumlah: Number(editItem.jumlah),
        modal: Number(editItem.modal),
        ongkos_kirim: Number(editItem.ongkos_kirim),
        margin_persen: Number(editItem.margin_persen),
        harga_jual: Number(editItem.harga_jual),
        total_harga,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      alert(result.message || "Gagal update barang.");
      return;
    }

    alert("Barang berhasil diperbarui.");
    setEditItem(null);
    await ambilDetailPesanan(modalNama);
    await ambilDataPesanan();
  };

  const hapusBarang = async (barang) => {
    const yakin = window.confirm(
      `Yakin ingin menyelesaikan pesanan "${barang.nama_barang}"? Data akan masuk ke Riwayat Pesanan dan hilang dari menu Pelanggan.`
    );

    if (!yakin) return;

    try {
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: barang.id }),
      });

      const text = await response.text();

      let result;
      try {
        result = JSON.parse(text);
      } catch {
        console.error("Response DELETE bukan JSON:", text);
        throw new Error("Response DELETE bukan JSON.");
      }

      if (!result.success) {
        alert(result.message || "Gagal memindahkan pesanan ke Riwayat.");
        return;
      }

      alert(result.message || "Pesanan berhasil masuk ke Riwayat.");

      await ambilDetailPesanan(modalNama);
      await ambilDataPesanan();
    } catch (error) {
      console.error(error);
      alert(error.message || "Terjadi kesalahan saat memindahkan ke Riwayat.");
    }
  };

  const handleGenerateInvoice = async (item) => {
    try {
      setUpdatingNama(item.namaPelanggan);

      const response = await fetch(
        `${API_URL}?mode=invoice&nama_pelanggan=${encodeURIComponent(
          item.namaPelanggan
        )}`
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Gagal mengambil detail invoice.");
      }

      const invoice = result.data;

      await updateStatus(
        item.namaPelanggan,
        "Sudah",
        item.statusPembayaran,
        item.statusPengiriman
      );

      setDataPesanan((prev) =>
        prev.map((row) =>
          row.namaPelanggan === item.namaPelanggan
            ? { ...row, statusInvoice: "Sudah" }
            : row
        )
      );

      const tanggal = new Date().toLocaleDateString("id-ID");
      const html = buatTemplateInvoice(invoice, tanggal, formatRupiah);

      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        throw new Error("Popup diblokir browser. Izinkan popup untuk mencetak invoice.");
      }

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (error) {
      console.error(error);
      alert(error.message || "Terjadi kesalahan saat generate invoice.");
    } finally {
      setUpdatingNama("");
    }
  };

  const handleStatusChange = async (namaPelanggan, field, value) => {
    const dataBaru = dataPesanan.map((item) =>
      item.namaPelanggan === namaPelanggan ? { ...item, [field]: value } : item
    );

    setDataPesanan(dataBaru);

    const itemDipilih = dataBaru.find(
      (item) => item.namaPelanggan === namaPelanggan
    );

    try {
      setUpdatingNama(namaPelanggan);

      await updateStatus(
        namaPelanggan,
        itemDipilih.statusInvoice || "Belum",
        itemDipilih.statusPembayaran,
        itemDipilih.statusPengiriman
      );
    } catch (error) {
      console.error(error);
      alert(error.message || "Terjadi kesalahan saat update status.");
    } finally {
      setUpdatingNama("");
    }
  };

  const modalInfo = {
    view: {
      icon: "👁️",
      title: "Detail Pesanan",
      subtitle: "Lihat daftar barang yang dipesan pelanggan.",
      color: "from-cyan-500 to-blue-500",
      badge: "bg-cyan-100 text-cyan-700",
    },
    edit: {
      icon: "✏️",
      title: "Edit Pesanan",
      subtitle: "Pilih barang yang ingin diperbarui dari daftar pesanan.",
      color: "from-amber-400 to-orange-500",
      badge: "bg-amber-100 text-amber-700",
    },
    delete: {
      icon: "🗑️",
      title: "Selesaikan Pesanan",
      subtitle: "Pilih barang yang ingin dipindahkan ke Riwayat Pesanan.",
      color: "from-rose-500 to-red-500",
      badge: "bg-rose-100 text-rose-700",
    },
  };

  return (
    <div className="w-full overflow-x-hidden">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800"></h2>
        <p className="mt-2 text-sm text-slate-500">
          Informasi pesanan pelanggan, status pembayaran, status pengiriman, dan
          aksi detail pesanan.
        </p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/40 bg-white/30 p-5 shadow-lg backdrop-blur-xl">
          <p className="text-sm text-slate-500">Total Pelanggan</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-800">
            {totalPesanan}
          </h3>
        </div>

        <div className="rounded-[28px] border border-white/40 bg-white/30 p-5 shadow-lg backdrop-blur-xl">
          <p className="text-sm text-slate-500">Total Pendapatan</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-800">
            Rp {formatRupiah(totalPendapatan)}
          </h3>
        </div>

        <div className="rounded-[28px] border border-white/40 bg-white/30 p-5 shadow-lg backdrop-blur-xl">
          <p className="text-sm text-slate-500">Saldo Belum Dibayar</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-800">
            Rp {formatRupiah(saldoBelumDibayar)}
          </h3>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/40 bg-white/30 p-6 shadow-lg backdrop-blur-xl">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              Informasi Pesanan Pelanggan
            </h3>
            <p className="text-sm text-slate-500">
              Gunakan tombol aksi untuk melihat, mengubah, atau menyelesaikan
              barang tertentu.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Memuat data...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px] text-left">
                <thead>
                  <tr className="border-b border-white/40 text-sm font-semibold text-slate-600">
                    <th className="pb-4 pr-4">Nama Pelanggan</th>
                    <th className="pb-4 pr-4">Total Barang</th>
                    <th className="pb-4 pr-4">Total Harga</th>
                    <th className="pb-4 pr-4">Status Invoice</th>
                    <th className="pb-4 pr-4">Status Pembayaran</th>
                    <th className="pb-4 pr-4">Status Pengiriman</th>
                    <th className="pb-4 pr-4 text-center">Aksi</th>
                  </tr>
                </thead>

                <tbody className="text-slate-700">
                  {dataTampil.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-500">
                        Belum ada data pesanan aktif di database.
                      </td>
                    </tr>
                  ) : (
                    dataTampil.map((item) => (
                      <tr
                        key={item.namaPelanggan}
                        className="border-b border-white/20 transition hover:bg-white/20"
                      >
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-400 to-cyan-400 text-sm font-bold text-white shadow-md">
                              {item.namaPelanggan?.charAt(0)?.toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800">
                                {item.namaPelanggan}
                              </p>
                              <button
                                type="button"
                                title="Generate Invoice"
                                onClick={() => handleGenerateInvoice(item)}
                                disabled={updatingNama === item.namaPelanggan}
                                className="mt-1 text-xs font-medium text-fuchsia-500 transition hover:text-fuchsia-700 disabled:text-slate-300"
                              >
                                🧾 Generate Invoice
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 pr-4">{item.totalBarang}</td>

                        <td className="py-4 pr-4 font-semibold">
                          Rp {formatRupiah(item.totalHarga)}
                        </td>

                        <td className="py-4 pr-4">
                          <span
                            className={`rounded-full px-3 py-1 text-sm ${
                              item.statusInvoice === "Sudah"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {item.statusInvoice || "Belum"}
                          </span>
                        </td>

                        <td className="py-4 pr-4">
                          <select
                            value={item.statusPembayaran}
                            onChange={(e) =>
                              handleStatusChange(
                                item.namaPelanggan,
                                "statusPembayaran",
                                e.target.value
                              )
                            }
                            disabled={updatingNama === item.namaPelanggan}
                            className="rounded-xl border border-white/50 bg-white/60 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-fuchsia-300"
                          >
                            <option value="Belum Lunas">Belum Lunas</option>
                            <option value="Lunas">Lunas</option>
                          </select>
                        </td>

                        <td className="py-4 pr-4">
                          <select
                            value={item.statusPengiriman}
                            onChange={(e) =>
                              handleStatusChange(
                                item.namaPelanggan,
                                "statusPengiriman",
                                e.target.value
                              )
                            }
                            disabled={updatingNama === item.namaPelanggan}
                            className="rounded-xl border border-white/50 bg-white/60 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-cyan-300"
                          >
                            <option value="Menunggu">Menunggu</option>
                            <option value="Diproses">Diproses</option>
                            <option value="Dikirim">Dikirim</option>
                            <option value="Selesai">Selesai</option>
                          </select>
                        </td>

                        <td className="py-4 pr-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              title="Lihat Pesanan"
                              onClick={() => bukaModal("view", item.namaPelanggan)}
                              className="group flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 shadow-sm transition hover:-translate-y-1 hover:bg-cyan-500 hover:text-white hover:shadow-lg"
                            >
                              👁️
                            </button>

                            <button
                              type="button"
                              title="Edit Pesanan"
                              onClick={() => bukaModal("edit", item.namaPelanggan)}
                              className="group flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-sm transition hover:-translate-y-1 hover:bg-amber-500 hover:text-white hover:shadow-lg"
                            >
                              ✏️
                            </button>

                            <button
                              type="button"
                              title="Selesaikan Pesanan"
                              onClick={() => bukaModal("delete", item.namaPelanggan)}
                              className="group flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 shadow-sm transition hover:-translate-y-1 hover:bg-rose-500 hover:text-white hover:shadow-lg"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-white/30 pt-5 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-500">
                Halaman {halamanAktif} dari {totalHalaman}
              </p>

              <div className="flex items-center gap-4 text-lg font-bold text-slate-700">
                <button
                  type="button"
                  onClick={() =>
                    halamanAktif > 1 && setHalamanAktif((prev) => prev - 1)
                  }
                  disabled={halamanAktif === 1}
                  className="rounded-xl bg-white/50 px-4 py-2 transition hover:text-fuchsia-500 disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  {"<"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    halamanAktif < totalHalaman &&
                    setHalamanAktif((prev) => prev + 1)
                  }
                  disabled={halamanAktif === totalHalaman}
                  className="rounded-xl bg-white/50 px-4 py-2 transition hover:text-cyan-500 disabled:cursor-not-allowed disabled:text-slate-300"
                >
                  {">"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {modalTipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
            <div
              className={`bg-gradient-to-r ${
                modalInfo[modalTipe]?.color
              } p-6 text-white`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/20 text-3xl shadow-inner">
                    {modalInfo[modalTipe]?.icon}
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold">
                      {modalInfo[modalTipe]?.title}
                    </h3>
                    <p className="mt-1 text-sm text-white/90">
                      {modalInfo[modalTipe]?.subtitle}
                    </p>
                    <div className="mt-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                      Pelanggan: {modalNama}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={tutupModal}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl transition hover:bg-white/30"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              {loadingDetail ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <div className="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-fuchsia-500"></div>
                  Memuat detail pesanan...
                </div>
              ) : detailItems.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-14 text-center">
                  <div className="text-5xl">📦</div>
                  <p className="mt-3 font-semibold text-slate-700">
                    Tidak ada barang aktif di pesanan ini.
                  </p>
                  <p className="text-sm text-slate-500">
                    Semua barang pelanggan ini mungkin sudah masuk ke Riwayat.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {modalTipe === "delete" && (
                    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                      <strong>Perhatian:</strong> pilih barang yang ingin
                      diselesaikan. Data akan masuk ke Riwayat Pesanan dan tidak
                      tampil lagi di menu Pelanggan.
                    </div>
                  )}

                  {detailItems.map((barang, index) => (
                    <div
                      key={barang.id}
                      className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition hover:shadow-md"
                    >
                      {modalTipe === "edit" && editItem?.id === barang.id ? (
                        <div>
                          <div className="mb-4 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-500">
                                Edit Barang #{index + 1}
                              </p>
                              <h4 className="text-lg font-bold text-slate-800">
                                {barang.nama_barang}
                              </h4>
                            </div>

                            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                              Mode Edit
                            </span>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-sm font-medium text-slate-600">
                                Nama Barang
                              </label>
                              <input
                                value={editItem.nama_barang}
                                onChange={(e) =>
                                  setEditItem({
                                    ...editItem,
                                    nama_barang: e.target.value,
                                  })
                                }
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                                placeholder="Nama barang"
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-sm font-medium text-slate-600">
                                Jumlah
                              </label>
                              <input
                                type="number"
                                value={editItem.jumlah}
                                onChange={(e) =>
                                  setEditItem({
                                    ...editItem,
                                    jumlah: e.target.value,
                                  })
                                }
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                                placeholder="Jumlah"
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-sm font-medium text-slate-600">
                                Modal
                              </label>
                              <input
                                type="number"
                                value={editItem.modal}
                                onChange={(e) =>
                                  setEditItem({
                                    ...editItem,
                                    modal: e.target.value,
                                  })
                                }
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                                placeholder="Modal"
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-sm font-medium text-slate-600">
                                Ongkos Kirim
                              </label>
                              <input
                                type="number"
                                value={editItem.ongkos_kirim}
                                onChange={(e) =>
                                  setEditItem({
                                    ...editItem,
                                    ongkos_kirim: e.target.value,
                                  })
                                }
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                                placeholder="Ongkos kirim"
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-sm font-medium text-slate-600">
                                Margin Persen
                              </label>
                              <input
                                type="number"
                                value={editItem.margin_persen}
                                onChange={(e) =>
                                  setEditItem({
                                    ...editItem,
                                    margin_persen: e.target.value,
                                  })
                                }
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                                placeholder="Margin persen"
                              />
                            </div>

                            <div>
                              <label className="mb-1 block text-sm font-medium text-slate-600">
                                Harga Jual
                              </label>
                              <input
                                type="number"
                                value={editItem.harga_jual}
                                onChange={(e) =>
                                  setEditItem({
                                    ...editItem,
                                    harga_jual: e.target.value,
                                  })
                                }
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                                placeholder="Harga jual"
                              />
                            </div>
                          </div>

                          <div className="mt-5 rounded-2xl bg-slate-100 p-4">
                            <p className="text-sm text-slate-500">
                              Total harga otomatis dihitung dari jumlah × harga
                              jual.
                            </p>
                            <p className="mt-1 text-xl font-bold text-slate-800">
                              Rp {formatRupiah(hitungTotalHarga(editItem))}
                            </p>
                          </div>

                          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                              type="button"
                              onClick={() => setEditItem(null)}
                              className="rounded-2xl bg-slate-100 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-200"
                            >
                              Batal
                            </button>

                            <button
                              type="button"
                              onClick={updateBarang}
                              className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                            >
                              Simpan Perubahan
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-start gap-4">
                            <div
                              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${
                                modalInfo[modalTipe]?.badge
                              }`}
                            >
                              {index + 1}
                            </div>

                            <div>
                              <h4 className="text-lg font-bold text-slate-800">
                                {barang.nama_barang}
                              </h4>

                              <div className="mt-2 grid gap-2 text-sm text-slate-500 sm:grid-cols-2 lg:grid-cols-4">
                                <p>
                                  Jumlah:{" "}
                                  <span className="font-semibold text-slate-700">
                                    {barang.jumlah}
                                  </span>
                                </p>
                                <p>
                                  Harga:{" "}
                                  <span className="font-semibold text-slate-700">
                                    Rp {formatRupiah(barang.harga_jual)}
                                  </span>
                                </p>
                                <p>
                                  Modal:{" "}
                                  <span className="font-semibold text-slate-700">
                                    Rp {formatRupiah(barang.modal)}
                                  </span>
                                </p>
                                <p>
                                  Ongkir:{" "}
                                  <span className="font-semibold text-slate-700">
                                    Rp {formatRupiah(barang.ongkos_kirim)}
                                  </span>
                                </p>
                              </div>

                              <div className="mt-3 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-800">
                                Total: Rp {formatRupiah(barang.total_harga)}
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 gap-2">
                            {modalTipe === "edit" && (
                              <button
                                type="button"
                                onClick={() => setEditItem(barang)}
                                className="rounded-2xl bg-amber-100 px-4 py-3 font-semibold text-amber-700 transition hover:bg-amber-500 hover:text-white"
                              >
                                ✏️ Edit
                              </button>
                            )}

                            {modalTipe === "delete" && (
                              <button
                                type="button"
                                onClick={() => hapusBarang(barang)}
                                className="rounded-2xl bg-rose-100 px-4 py-3 font-semibold text-rose-700 transition hover:bg-rose-500 hover:text-white"
                              >
                                🗑️ Selesai
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={tutupModal}
                className="rounded-2xl bg-slate-800 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-slate-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}