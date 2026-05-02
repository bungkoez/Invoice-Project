import { useEffect, useState } from "react";

const API_URL = "http://localhost/Invoice%20project/src/Backend/Dashboard.php";

export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalPelangganAktif: 0,
    totalBarangAktif: 0,
    totalPendapatan: 0,
    saldoBelumDibayar: 0,
    invoiceDibuat: 0,
    pesananSelesai: 0,
  });

  const [pesananTerbaru, setPesananTerbaru] = useState([]);
  const [historyTerbaru, setHistoryTerbaru] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID").format(angka || 0);

  const ambilDataDashboard = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);
      const text = await response.text();

      let result;
      try {
        result = JSON.parse(text);
      } catch {
        console.error("Response Dashboard bukan JSON:", text);
        throw new Error("Response Dashboard.php bukan JSON.");
      }

      if (!result.success) {
        throw new Error(result.message || "Gagal mengambil data dashboard.");
      }

      setSummary(result.data?.summary || {});
      setPesananTerbaru(result.data?.pesananTerbaru || []);
      setHistoryTerbaru(result.data?.historyTerbaru || []);
    } catch (error) {
      console.error(error);
      alert(error.message || "Terjadi kesalahan saat mengambil dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ambilDataDashboard();
  }, []);

  return (
    <div className="w-full min-w-0">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800"></h2>
        <p className="mt-2 text-sm text-slate-500">
          Ringkasan pesanan, pelanggan, invoice, pembayaran, dan riwayat pesanan.
        </p>
      </div>

      {loading ? (
        <div className="rounded-[28px] border border-white/40 bg-white/30 p-12 text-center text-slate-500 shadow-lg backdrop-blur-xl">
          Memuat data dashboard...
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[28px] border border-white/40 bg-white/35 p-5 shadow-lg backdrop-blur-xl">
              <p className="text-sm text-slate-500">Pelanggan Aktif</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-800">
                {summary.totalPelangganAktif}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Pelanggan yang masih memiliki pesanan aktif.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/40 bg-white/35 p-5 shadow-lg backdrop-blur-xl">
              <p className="text-sm text-slate-500">Barang Aktif</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-800">
                {summary.totalBarangAktif}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Total item barang yang belum masuk riwayat.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/40 bg-white/35 p-5 shadow-lg backdrop-blur-xl">
              <p className="text-sm text-slate-500">Pesanan Selesai</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-800">
                {summary.pesananSelesai}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Pesanan yang sudah masuk ke history.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/40 bg-white/35 p-5 shadow-lg backdrop-blur-xl">
              <p className="text-sm text-slate-500">Total Pendapatan Aktif</p>
              <h3 className="mt-2 break-words text-3xl font-bold text-slate-800">
                Rp {formatRupiah(summary.totalPendapatan)}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Total nilai pesanan yang masih aktif.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/40 bg-white/35 p-5 shadow-lg backdrop-blur-xl">
              <p className="text-sm text-slate-500">Belum Dibayar</p>
              <h3 className="mt-2 break-words text-3xl font-bold text-slate-800">
                Rp {formatRupiah(summary.saldoBelumDibayar)}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Total pesanan aktif yang belum lunas.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/40 bg-white/35 p-5 shadow-lg backdrop-blur-xl">
              <p className="text-sm text-slate-500">Invoice Dibuat</p>
              <h3 className="mt-2 text-3xl font-bold text-slate-800">
                {summary.invoiceDibuat}
              </h3>
              <p className="mt-2 text-xs text-slate-500">
                Pelanggan aktif yang invoice-nya sudah dibuat.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <div className="rounded-[28px] border border-white/40 bg-white/30 p-6 shadow-lg backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Pesanan Aktif Terbaru
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Ringkasan pelanggan yang masih memiliki pesanan aktif.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={ambilDataDashboard}
                  className="rounded-2xl bg-white/50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white/70"
                >
                  Refresh
                </button>
              </div>

              {pesananTerbaru.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white/35 py-12 text-center text-slate-500">
                  Belum ada pesanan aktif.
                </div>
              ) : (
                <div className="space-y-3">
                  {pesananTerbaru.map((item) => (
                    <div
                      key={item.namaPelanggan}
                      className="rounded-3xl border border-white/40 bg-white/35 p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-400 to-cyan-400 font-bold text-white shadow-md">
                            {item.namaPelanggan?.charAt(0)?.toUpperCase()}
                          </div>

                          <div>
                            <p className="font-bold text-slate-800">
                              {item.namaPelanggan}
                            </p>
                            <p className="text-sm text-slate-500">
                              {item.totalItem} item | {item.totalBarang} barang
                            </p>
                          </div>
                        </div>

                        <div className="text-left md:text-right">
                          <p className="font-bold text-slate-800">
                            Rp {formatRupiah(item.totalHarga)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.statusPembayaran} • {item.statusPengiriman}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-white/40 bg-white/30 p-6 shadow-lg backdrop-blur-xl">
              <div className="mb-5">
                <h3 className="text-xl font-bold text-slate-800">
                  Riwayat Terbaru
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Pesanan yang terakhir masuk ke menu Riwayat Pesanan.
                </p>
              </div>

              {historyTerbaru.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white/35 py-12 text-center text-slate-500">
                  Belum ada riwayat pesanan.
                </div>
              ) : (
                <div className="space-y-3">
                  {historyTerbaru.map((item) => (
                    <div
                      key={item.idHistory}
                      className="rounded-3xl border border-white/40 bg-white/35 p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-bold text-slate-800">
                            {item.namaPelanggan}
                          </p>
                          <p className="text-sm text-slate-500">
                            {item.namaBarang} • {item.totalBarang} barang
                          </p>
                        </div>

                        <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                          {item.statusPesanan || "Selesai"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}