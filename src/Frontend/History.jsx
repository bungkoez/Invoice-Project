import { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost/Invoice%20project/src/Backend/History.php";

export default function History() {
  const [dataHistory, setDataHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  const ambilHistory = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);
      const text = await response.text();

      let result;
      try {
        result = JSON.parse(text);
      } catch {
        console.error("Response History bukan JSON:", text);
        throw new Error("Response History.php bukan JSON.");
      }

      if (!result.success) {
        throw new Error(result.message || "Gagal mengambil data history.");
      }

      setDataHistory(result.data || []);
    } catch (error) {
      console.error(error);
      alert(error.message || "Terjadi kesalahan saat mengambil data history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ambilHistory();
  }, []);

  const dataFilter = useMemo(() => {
    const q = keyword.toLowerCase().trim();

    if (!q) return dataHistory;

    return dataHistory.filter((item) => {
      return (
        item.namaPelanggan?.toLowerCase().includes(q) ||
        item.namaBarang?.toLowerCase().includes(q) ||
        item.statusPesanan?.toLowerCase().includes(q)
      );
    });
  }, [dataHistory, keyword]);

  const totalSelesai = useMemo(() => {
    return dataHistory.filter((item) => item.statusPesanan === "Selesai")
      .length;
  }, [dataHistory]);

  return (
    <div className="w-full min-w-0">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800">
        
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Menampilkan data pesanan yang sudah selesai dari menu Pelanggan.
        </p>
      </div>

      <div className="mb-6 flex justify-center">
        <div className="w-full max-w-md rounded-[28px] border border-white/40 bg-white/35 p-6 text-center shadow-lg backdrop-blur-xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Pesanan Selesai
          </p>

          <h3 className="mt-3 text-5xl font-bold text-slate-800">
            {totalSelesai}
          </h3>

          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-fuchsia-400 via-pink-400 to-cyan-400" />

          <p className="mt-4 text-sm text-slate-500">
            Total pesanan yang sudah masuk ke riwayat.
          </p>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/40 bg-white/30 p-6 shadow-lg backdrop-blur-xl">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              Data History Pesanan
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Data ini hanya bisa dilihat, tidak bisa diedit atau dihapus.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Cari pelanggan / barang..."
              className="w-full rounded-2xl border border-white/50 bg-white/60 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-fuchsia-200 sm:w-72"
            />

            <button
              type="button"
              onClick={ambilHistory}
              className="rounded-2xl bg-gradient-to-r from-fuchsia-400 via-pink-400 to-cyan-400 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-105"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <div className="mb-3 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-fuchsia-500"></div>
            Memuat data history...
          </div>
        ) : dataFilter.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/35 py-16 text-center">
            <div className="text-5xl">📜</div>
            <p className="mt-3 text-lg font-bold text-slate-700">
              Belum ada riwayat pesanan.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Data akan muncul setelah pesanan dipindahkan ke history.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="border-b border-white/40 text-sm font-semibold text-slate-600">
                  <th className="pb-4 pr-4">No</th>
                  <th className="pb-4 pr-4">Nama Pelanggan</th>
                  <th className="pb-4 pr-4">Nama Barang</th>
                  <th className="pb-4 pr-4">Total Barang</th>
                  <th className="pb-4 pr-4">Status Pesanan</th>
                </tr>
              </thead>

              <tbody className="text-slate-700">
                {dataFilter.map((item, index) => (
                  <tr
                    key={item.idHistory}
                    className="border-b border-white/20 transition hover:bg-white/20"
                  >
                    <td className="py-4 pr-4">{index + 1}</td>

                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-400 to-cyan-400 text-sm font-bold text-white shadow-md">
                          {item.namaPelanggan?.charAt(0)?.toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {item.namaPelanggan}
                          </p>
                          <p className="text-xs text-slate-500">
                            ID History: {item.idHistory}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 pr-4">
                      <p className="font-semibold text-slate-800">
                        {item.namaBarang}
                      </p>
                    </td>

                    <td className="py-4 pr-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                        {item.totalBarang}
                      </span>
                    </td>

                    <td className="py-4 pr-4">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                        {item.statusPesanan || "Selesai"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}