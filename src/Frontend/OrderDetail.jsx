export default function OrderDetail() {
  return (
    <div className="w-full overflow-x-hidden">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800"></h2>
        <p className="mt-2 text-slate-600">
          
        </p>
      </div>

      <div className="rounded-[28px] border border-white/40 bg-white/30 p-6 shadow-lg backdrop-blur-xl">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white/35 p-4">
            <p className="text-sm text-slate-500">Nama Pelanggan</p>
            <p className="mt-1 text-lg font-semibold text-slate-800">
              Alya Putri
            </p>
          </div>

          <div className="rounded-2xl bg-white/35 p-4">
            <p className="text-sm text-slate-500">Total Pesanan</p>
            <p className="mt-1 text-lg font-semibold text-slate-800">
              Rp 3.500.000
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white/30 p-5">
          <h3 className="text-lg font-semibold text-slate-800">Rincian Barang</h3>
          <ul className="mt-3 space-y-3 text-slate-700">
            <li>• Website Company — 2 item</li>
            <li>• Status pesanan: Baru</li>
            <li>• Catatan: Menunggu konfirmasi pembayaran</li>
          </ul>
        </div>
      </div>
    </div>
  );
}