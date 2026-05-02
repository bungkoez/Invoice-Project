import { useMemo, useState } from "react";

export default function Order() {
  const [customerName, setCustomerName] = useState("");
  const [rows, setRows] = useState([
    {
      id: 1,
      namaBarang: "",
      jumlah: 1,
      modal: 0,
      ongkosKirim: 0,
      margin: 0,
    },
  ]);

  const [savedOrder, setSavedOrder] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const ambilAngka = (value) => {
    if (value === "" || value === null || value === undefined) return 0;
    return Number(String(value).replace(/[^\d]/g, "")) || 0;
  };

  const formatRupiah = (value) => {
    const number = Number(value) || 0;
    return number.toLocaleString("id-ID");
  };

  const handleChange = (id, field, value) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]:
                field === "namaBarang"
                  ? value
                  : field === "jumlah"
                  ? value === ""
                    ? ""
                    : Number(value)
                  : ambilAngka(value),
            }
          : row
      )
    );
  };

  const tambahBaris = () => {
    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        namaBarang: "",
        jumlah: 1,
        modal: 0,
        ongkosKirim: 0,
        margin: 0,
      },
    ]);
  };

  const hapusBaris = (id) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const hitungHargaJual = (row) => {
    const modal = Number(row.modal) || 0;
    const ongkir = Number(row.ongkosKirim) || 0;
    const margin = Number(row.margin) || 0;

    return modal + ongkir + (modal * margin) / 100;
  };

  const hitungTotalHarga = (row) => {
    const jumlah = Number(row.jumlah) || 0;
    return hitungHargaJual(row) * jumlah;
  };

  const grandTotal = useMemo(() => {
    return rows.reduce((total, row) => total + hitungTotalHarga(row), 0);
  }, [rows]);

  const handleKonfirmasi = async () => {
    const namaPelanggan = customerName.trim();

    if (!namaPelanggan) {
      alert("Nama pelanggan wajib diisi.");
      return;
    }

    const filteredRows = rows.filter(
      (row) =>
        row.namaBarang.trim() !== "" &&
        Number(row.jumlah) > 0
    );

    if (filteredRows.length === 0) {
      alert("Detail barang tidak boleh kosong.");
      return;
    }

    const payload = {
      nama_pelanggan: namaPelanggan,
      items: filteredRows.map((row) => ({
        nama_barang: row.namaBarang.trim(),
        jumlah: Number(row.jumlah) || 0,
        modal: Number(row.modal) || 0,
        ongkos_kirim: Number(row.ongkosKirim) || 0,
        margin_persen: Number(row.margin) || 0,
        harga_jual: hitungHargaJual(row),
        total_harga: hitungTotalHarga(row),
      })),
    };

    try {
      setIsSaving(true);

      const response = await fetch(
        "http://localhost/Invoice%20project/src/Backend/Detailbarang.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menyimpan data.");
      }

      setSavedOrder({
        customerName: namaPelanggan,
        rows: filteredRows,
        grandTotal,
      });

      alert("Data berhasil disimpan ke database.");
    } catch (error) {
      console.error("Gagal simpan:", error);
      alert(error.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800"></h2>
        <p className="mt-2 text-slate-600">
          
        </p>
      </div>

      <div className="mb-6 rounded-[28px] border border-white/40 bg-white/30 p-6 shadow-lg backdrop-blur-xl">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Nama Pemesan / Pelanggan
        </label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Masukkan nama pelanggan"
          className="w-full rounded-2xl border border-white/50 bg-white/50 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-fuchsia-200"
        />
      </div>

      <div className="w-full rounded-[28px] border border-white/40 bg-white/30 p-6 shadow-lg backdrop-blur-xl">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-slate-800">Detail Barang</h3>
            <p className="mt-1 text-sm text-slate-500">
              Semua kolom diisi manual. Harga jual dan total dihitung otomatis.
            </p>
          </div>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={tambahBaris}
              title="Tambah Baris"
              className="text-3xl font-bold text-fuchsia-500 transition hover:scale-110"
            >
              +
            </button>

            <button
              type="button"
              onClick={handleKonfirmasi}
              title="Konfirmasi"
              disabled={isSaving}
              className={`text-2xl font-bold transition ${
                isSaving
                  ? "cursor-not-allowed text-slate-400"
                  : "text-cyan-500 hover:scale-110"
              }`}
            >
              ✓
            </button>
          </div>
        </div>

        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed text-left">
            <colgroup>
              <col className="w-[4%]" />
              <col className="w-[16%]" />
              <col className="w-[8%]" />
              <col className="w-[13%]" />
              <col className="w-[13%]" />
              <col className="w-[9%]" />
              <col className="w-[14%]" />
              <col className="w-[15%]" />
              <col className="w-[8%]" />
            </colgroup>

            <thead>
              <tr className="border-b border-white/40 text-sm font-semibold text-slate-600">
                <th className="pb-4 pr-2">No</th>
                <th className="pb-4 pr-2">Nama Barang</th>
                <th className="pb-4 pr-2">Jumlah</th>
                <th className="pb-4 pr-2">Modal</th>
                <th className="pb-4 pr-2">Ongkos Kirim</th>
                <th className="pb-4 pr-2">Margin %</th>
                <th className="pb-4 pr-2">Harga Jual</th>
                <th className="pb-4 pr-2">Total Harga</th>
                <th className="pb-4 pr-2">Aksi</th>
              </tr>
            </thead>

            <tbody className="text-slate-700">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-500">
                    Belum ada detail barang. Klik simbol <span className="font-semibold">+</span> untuk menambahkan data.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => {
                  const hargaJual = hitungHargaJual(row);
                  const totalHarga = hitungTotalHarga(row);

                  return (
                    <tr key={row.id} className="border-b border-white/20 align-top">
                      <td className="py-4 pr-2">{index + 1}</td>

                      <td className="py-4 pr-2">
                        <input
                          type="text"
                          value={row.namaBarang}
                          onChange={(e) =>
                            handleChange(row.id, "namaBarang", e.target.value)
                          }
                          placeholder="Nama barang"
                          className="w-full rounded-xl border border-white/50 bg-white/50 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-fuchsia-200"
                        />
                      </td>

                      <td className="py-4 pr-2">
                        <input
                          type="number"
                          min="1"
                          value={row.jumlah}
                          onChange={(e) =>
                            handleChange(row.id, "jumlah", e.target.value)
                          }
                          className="w-full rounded-xl border border-white/50 bg-white/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-fuchsia-200"
                        />
                      </td>

                      <td className="py-4 pr-2">
                        <div className="flex w-full items-center rounded-xl border border-white/50 bg-white/50 px-3 py-2 focus-within:ring-2 focus-within:ring-fuchsia-200">
                          <span className="mr-2 shrink-0 text-sm font-medium text-slate-500">Rp</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={row.modal ? formatRupiah(row.modal) : ""}
                            onChange={(e) =>
                              handleChange(row.id, "modal", e.target.value)
                            }
                            placeholder="0"
                            className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
                          />
                        </div>
                      </td>

                      <td className="py-4 pr-2">
                        <div className="flex w-full items-center rounded-xl border border-white/50 bg-white/50 px-3 py-2 focus-within:ring-2 focus-within:ring-fuchsia-200">
                          <span className="mr-2 shrink-0 text-sm font-medium text-slate-500">Rp</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={row.ongkosKirim ? formatRupiah(row.ongkosKirim) : ""}
                            onChange={(e) =>
                              handleChange(row.id, "ongkosKirim", e.target.value)
                            }
                            placeholder="0"
                            className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
                          />
                        </div>
                      </td>

                      <td className="py-4 pr-2">
                        <div className="flex w-full items-center rounded-xl border border-white/50 bg-white/50 px-3 py-2 focus-within:ring-2 focus-within:ring-fuchsia-200">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={row.margin || ""}
                            onChange={(e) =>
                              handleChange(row.id, "margin", e.target.value)
                            }
                            placeholder="0"
                            className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
                          />
                          <span className="ml-2 shrink-0 text-sm font-medium text-slate-500">%</span>
                        </div>
                      </td>

                      <td className="py-4 pr-2">
                        <div
                          title={`Rp ${hargaJual.toLocaleString("id-ID")}`}
                          className="w-full overflow-hidden rounded-xl bg-white/40 px-3 py-2 text-sm font-medium text-slate-700"
                        >
                          <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                            Rp {hargaJual.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 pr-2">
                        <div
                          title={`Rp ${totalHarga.toLocaleString("id-ID")}`}
                          className="w-full overflow-hidden rounded-xl bg-white/40 px-3 py-2 text-sm font-semibold text-slate-800"
                        >
                          <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                            Rp {totalHarga.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 pr-2">
                        <button
                          type="button"
                          onClick={() => hapusBaris(row.id)}
                          className="w-full rounded-xl bg-rose-100 px-2 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-200"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded-[24px] border border-white/40 bg-white/25 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-sm text-slate-500">Nama Pemesan</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">
                {customerName || "-"}
              </p>
            </div>

            <div className="min-w-0 md:max-w-[320px] md:text-right">
              <p className="text-sm text-slate-500">Grand Total</p>
              <div title={`Rp ${grandTotal.toLocaleString("id-ID")}`} className="mt-1 overflow-hidden">
                <p className="overflow-hidden text-ellipsis whitespace-nowrap text-2xl font-bold text-slate-800">
                  Rp {grandTotal.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {savedOrder && (
        <div className="mt-6 w-full rounded-[28px] border border-white/40 bg-white/30 p-6 shadow-lg backdrop-blur-xl">
          <h3 className="text-2xl font-bold text-slate-800">Ringkasan Konfirmasi</h3>
          <p className="mt-2 text-slate-600">
            Data hasil konfirmasi berhasil disimpan ke database.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white/35 p-4">
              <p className="text-sm text-slate-500">Nama Pelanggan</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">
                {savedOrder.customerName}
              </p>
            </div>

            <div className="rounded-2xl bg-white/35 p-4">
              <p className="text-sm text-slate-500">Total Keseluruhan</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">
                Rp {savedOrder.grandTotal.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}