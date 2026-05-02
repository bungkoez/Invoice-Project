import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost/Invoice%20project/src/Backend/Login.php";

export default function Landingpage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const usernameValue = username.trim();
    const passwordValue = password.trim();

    if (!usernameValue || !passwordValue) {
      setError("Username dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: usernameValue,
          password: passwordValue,
        }),
      });

      const text = await response.text();

      let result;
      try {
        result = JSON.parse(text);
      } catch {
        console.error("Response Login bukan JSON:", text);
        throw new Error("Response Login.php bukan JSON. Cek file PHP.");
      }

      if (!result.success) {
        setError(result.message || "Username atau password salah.");
        return;
      }

      localStorage.setItem("id_user", result.data.idUser);
      localStorage.setItem("username", result.data.username);

      navigate("/app/dashboard");
    } catch (error) {
      console.error(error);
      setError(error.message || "Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
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
              Silakan login dulu yaa
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
                disabled={loading}
                className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400 transition focus:border-fuchsia-300 focus:ring-2 focus:ring-fuchsia-200 disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 pr-16 text-slate-800 outline-none placeholder:text-slate-400 transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-100/80 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-2xl px-4 py-3 font-semibold text-white shadow-lg transition duration-300 ${
                loading
                  ? "cursor-not-allowed bg-slate-400"
                  : "bg-gradient-to-r from-fuchsia-400 via-pink-400 to-cyan-400 hover:shadow-xl"
              }`}
            >
              {loading ? "Memeriksa..." : "Masuk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}