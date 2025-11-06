import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../lib/api.js";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png"; // ganti dengan path logo kamu

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState("");

  useEffect(() => {
    if (localStorage.getItem("token")) nav("/", { replace: true });
  }, [nav]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setAlert("");
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data?.token) {
        localStorage.setItem("token", data.token);
        nav("/", { replace: true });
      } else {
        setAlert(data?.msg || "Email atau password salah!");
      }
    } catch (err) {
      setAlert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-blue-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Logo" className="w-16 h-16 mb-2 rounded-full shadow" />
          <h1 className="text-white font-semibold text-2xl tracking-wide">codifyhub.id</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <FaEnvelope className="absolute top-3 left-3 text-blue-400" />
            <input
              type="email"
              placeholder="Email ID"
              className="w-full bg-white/10 text-white border border-white/20 rounded-md py-2 pl-10 pr-3 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-5 relative">
            <FaLock className="absolute top-3 left-3 text-blue-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-white/10 text-white border border-white/20 rounded-md py-2 pl-10 pr-3 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <AnimatePresence>
            {alert && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-md p-2 text-center"
              >
                ⚠ {alert}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            disabled={loading}
            className="w-full py-2 rounded-md bg-blue-700 text-white font-semibold hover:bg-blue-600 transition-all shadow-lg disabled:opacity-60"
          >
            {loading ? "Loading..." : "LOGIN"}
          </button>

          <div className="flex justify-between items-center mt-3 text-sm text-gray-300">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-blue-600" /> Remember me
            </label>
            <a href="#" className="hover:underline text-blue-400">
              Forgot Password?
            </a>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
