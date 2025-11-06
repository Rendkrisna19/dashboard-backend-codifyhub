import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { FaPlus, FaEdit, FaTrash, FaTimes, FaUserFriends, FaEnvelope, FaPhone } from "react-icons/fa";

export default function Team() {
  const [rows, setRows] = useState([]);
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState(null);

  async function load() {
    setRows((await apiFetch("/api/teams")) || []);
  }
  useEffect(() => { load(); }, []);

  async function save(form) {
    if (edit)
      await apiFetch(`/api/teams/${edit.id}`, { method: "PUT", body: JSON.stringify(form) });
    else
      await apiFetch("/api/teams", { method: "POST", body: JSON.stringify(form) });
    setShow(false);
    setEdit(null);
    load();
  }

  async function del(id) {
    if (!confirm("Hapus anggota tim?")) return;
    await apiFetch(`/api/teams/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold tracking-wide flex items-center gap-2">
          <FaUserFriends className="text-blue-400" /> Team
        </h2>
        <button
          onClick={() => { setEdit(null); setShow(true); }}
          className="px-3 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg flex items-center gap-2"
        >
          <FaPlus /> Tambah
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900 border border-slate-700 rounded-2xl">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800/70 text-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Kontak</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(t => (
              <tr key={t.id} className="border-t border-slate-700/60 hover:bg-slate-800/40">
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="px-4 py-3 capitalize">{t.role || "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2"><FaEnvelope className="opacity-70" /> {t.email || "-"}</div>
                  <div className="flex items-center gap-2 opacity-80 mt-1"><FaPhone /> {t.phone || "-"}</div>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => { setEdit(t); setShow(true); }}
                    className="px-2 py-1 border border-white/30 rounded hover:bg-yellow-500/30"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => del(t.id)}
                    className="px-2 py-1 border border-white/30 rounded hover:bg-red-600/30"
                    title="Hapus"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="px-4 py-4 text-center opacity-70" colSpan={4}>Belum ada anggota tim.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {show && (
        <TeamForm
          initial={edit}
          onClose={() => { setShow(false); setEdit(null); }}
          onSave={save}
        />
      )}
    </div>
  );
}

/* ========================= MODAL FORM ========================= */
function TeamForm({ initial, onClose, onSave }) {
  const [f, setF] = useState({
    name: initial?.name || "",
    role: initial?.role || "",
    email: initial?.email || "",
    phone: initial?.phone || "",
  });
  const set = (k, v) => setF({ ...f, [k]: v });

  const inputCls =
    "w-full bg-transparent border border-white/40 rounded px-3 py-2 text-white " +
    "focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-400";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-slate-700 rounded-2xl p-5 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{initial ? "Edit Anggota" : "Tambah Anggota"}</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-white/10"><FaTimes /></button>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Nama">
            <input className={inputCls} value={f.name} onChange={e => set("name", e.target.value)} />
          </Field>
          <Field label="Role">
            <input className={inputCls} value={f.role} onChange={e => set("role", e.target.value)} />
          </Field>
          <Field label="Email">
            <input className={inputCls} value={f.email} onChange={e => set("email", e.target.value)} />
          </Field>
          <Field label="No HP">
            <input className={inputCls} value={f.phone} onChange={e => set("phone", e.target.value)} />
          </Field>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 border border-white/30 rounded">
            Batal
          </button>
          <button
            onClick={() => onSave(f)}
            className="px-3 py-2 bg-blue-700 hover:bg-blue-600 rounded text-white flex items-center gap-2"
          >
            <FaUserFriends /> Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================= SMALL COMPONENT ========================= */
function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="block mb-1">{label}</span>
      {children}
    </label>
  );
}
