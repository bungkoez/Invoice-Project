import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";

export default function Mainlayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  let title = "Dashboard";

  if (location.pathname === "/app/dashboard") {
    title = "Dashboard";
  } else if (location.pathname === "/app/order") {
    title = "Pesanan";
  } else if (location.pathname === "/app/order-history") {
    title = "Riwayat Pesanan";
  } else if (location.pathname === "/app/order-detail") {
    title = "Detail Pelanggan";
  } else if (location.pathname === "/app/customer") {
    title = "Daftar Pesanan";
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-rose-100 via-sky-100 to-violet-100">
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-pink-300/30 blur-3xl" />
      <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl" />

      {/* Tombol menu khusus HP */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/50 bg-white/60 text-2xl shadow-lg backdrop-blur-xl md:hidden"
      >
        ☰
      </button>

      {/* Sidebar desktop */}
      <Sidebar />

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="relative h-full w-72 max-w-[85%]">
            <Sidebar mobile onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="relative z-10 min-h-screen p-4 pt-20 md:ml-72 md:p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Topbar title={title} />

          <main className="min-w-0 flex-1 rounded-[28px] border border-white/40 bg-white/25 p-4 shadow-xl backdrop-blur-2xl md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}