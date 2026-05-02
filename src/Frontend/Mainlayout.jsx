import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";

export default function Mainlayout() {
  const location = useLocation();

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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-100 via-sky-100 to-violet-100">
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-pink-300/30 blur-3xl" />
      <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl" />

      <div className="relative z-10 flex min-h-screen gap-4 p-4">
        <Sidebar />

        <div className="ml-0 flex min-w-0 flex-1 flex-col gap-4 md:ml-72">
          <Topbar title={title} />

          <main className="min-w-0 flex-1 rounded-[28px] border border-white/40 bg-white/25 p-6 shadow-xl backdrop-blur-2xl">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}