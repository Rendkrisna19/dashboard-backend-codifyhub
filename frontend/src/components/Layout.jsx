import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaChartBar,
  FaUsers,
  FaBriefcase,
  FaUserFriends,
  FaBars,
  FaSignOutAlt,
  FaBolt,
  FaSearch,
  FaMoneyBillWave,
} from "react-icons/fa";

// simpan icon sebagai elemen agar mudah dipakai di map()
const navItems = [
  { to: "/",         label: "Dashboard", icon: <FaChartBar /> },
  { to: "/clients",  label: "Clients",   icon: <FaUsers /> },
  { to: "/projects", label: "Projects",  icon: <FaBriefcase /> },
  { to: "/team",     label: "Team",      icon: <FaUserFriends /> },
  { to: "/finance", label: "Finance", icon: <FaMoneyBillWave /> },

  // tambah menu lain di sini...
];

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-base text-ink flex">
      {/* Sidebar */}
      <aside
        className={`fixed z-40 top-0 left-0 h-full w-72 bg-card border-r border-edge/40 transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="h-16 flex items-center px-5 border-b border-edge/40">
          <div className="h-9 w-9 rounded-xl bg-deep/70 flex items-center justify-center mr-3">
            <FaBolt />
          </div>
          <div className="font-semibold">CodifyHub</div>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg border transition
                 hover:bg-deep/40 hover:border-edge/40
                 ${isActive ? "bg-deep/60 border-edge/60" : "border-transparent"}`
              }
            >
              <span className="text-lg">{it.icon}</span>
              <span>{it.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-edge/40 text-sm opacity-70">
          © {new Date().getFullYear()} CodifyHub
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 md:ml-72">
        {/* Header */}
        <header className="h-16 sticky top-0 z-30 bg-card/80 backdrop-blur border-b border-edge/40 flex items-center px-4 md:px-6">
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden mr-3 p-2 rounded-lg border border-edge/40 hover:bg-deep/50"
            aria-label="Toggle menu"
          >
            <FaBars />
          </button>

          <h1 className="text-lg md:text-xl font-semibold">Dashboard</h1>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-base border border-edge/40 rounded-lg px-3 py-2 w-56">
              <FaSearch className="opacity-70" />
              <input
                placeholder="Search..."
                className="bg-transparent outline-none w-full"
              />
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
              className="px-3 py-2 rounded-lg bg-deep hover:bg-deep/80 border border-edge/60 flex items-center gap-2"
              title="Logout"
            >
              <FaSignOutAlt />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 md:p-6">{children}</main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-edge/40 text-sm text-ink/70">
          Copyright © {new Date().getFullYear()} CodifyHub. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
