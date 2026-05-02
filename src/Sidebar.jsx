import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", icon: "📊", path: "/app/dashboard" },
    { name: "Pesanan", icon: "🛒", path: "/app/order" },
    { name: "Pelanggan", icon: "👥", path: "/app/customer" },
    { name: "Riwayat Pesanan", icon: "📜", path: "/app/order-history" },
  ];

  return (
    <aside className="fixed left-4 top-4 z-20 hidden h-[calc(100vh-2rem)] w-68 flex-col rounded-[30px] border border-white/40 bg-white/20 p-5 shadow-2xl backdrop-blur-2xl md:flex">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-400 via-pink-400 to-cyan-400 text-lg font-bold text-white shadow-lg">
          I
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-800">Invora</h2>
        </div>
      </div>

      <nav className="flex-1 space-y-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === "/app/order"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-fuchsia-400/90 via-pink-400/90 to-cyan-400/90 text-white shadow-lg"
                  : "bg-white/20 text-slate-700 hover:bg-white/40"
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/30 pt-5">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full rounded-2xl bg-white/25 px-4 py-3 text-left font-medium text-rose-500 transition hover:bg-white/40"
        >
          🚪 Keluar
        </button>
      </div>
    </aside>
  );
}