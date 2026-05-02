import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landingpage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const usernameValue = username.trim();

    if (!usernameValue) {
      setError("Username wajib diisi.");
      return;
    }

    // Login sementara tanpa PHP/backend
    localStorage.setItem("id_user", "1");
    localStorage.setItem("username", usernameValue);

    navigate("/app/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-100 via-sky-100 to-violet-100">
      <div className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-pink-300/40 blur-3xl" />
      <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-cyan-300/40 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-300/40 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-[28px] border border-white/50 bg-white/30 p-8 shadow-xl backdrop-blur-2xl"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/40 shadow-md backdrop-blur-xl">
              <span className="text-2xl">✨</span>
            </div>

            <h2 className="text-3xl font-bold text-slate-800">
              Welcome Back
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Masuk tanpa password untuk sementara
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Username
              </label>

              <input
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 transition focus:border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-200"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-100/80 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-400 via-pink-400 to-cyan-400 px-4 py-3 font-semibold text-white shadow-lg transition duration-300 hover:shadow-xl"
            >
              Masuk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}