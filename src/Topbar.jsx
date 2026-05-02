export default function Topbar({ title }) {
  return (
    <header className="sticky top-4 z-10 flex min-h-[88px] items-center justify-between rounded-[28px] border border-white/40 bg-white/25 px-6 py-4 shadow-xl backdrop-blur-2xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">Halaman utama / {title}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/30 px-3 py-2">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-700">Admin Invoice</p>
            <p className="text-[11px] font-medium text-emerald-500">Online</p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-400 via-pink-400 to-cyan-400 font-bold text-white shadow-md">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}