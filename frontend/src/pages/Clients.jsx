import React, { useEffect, useState } from "react";
import { apiFetch } from "../lib/api.js";
import {
  FaPlus, FaPen, FaTrash, FaInfoCircle, FaTimes,
  FaEnvelope, FaPhone, FaBuilding, FaMapMarkerAlt,
  FaMoneyBillWave, FaCheckCircle,
} from "react-icons/fa";

const PAY_OPTS = ["belum", "dp", "lunas"];
const NOTE_STATUS = ["proses", "revisi", "selesai"];

// ===== util badge color =====
const payColor = (v) =>
  v === "lunas" ? "bg-green-600/15 text-green-300 ring-1 ring-green-500/30"
: v === "dp"    ? "bg-blue-600/15 text-blue-300 ring-1 ring-blue-500/30"
               : "bg-yellow-600/15 text-yellow-300 ring-1 ring-yellow-500/30";

const noteColor = (v) =>
  v === "selesai" ? "bg-green-600/15 text-green-300 ring-1 ring-green-500/30"
: v === "revisi"  ? "bg-red-600/15 text-red-300 ring-1 ring-red-500/30"
                 : "bg-yellow-600/15 text-yellow-300 ring-1 ring-yellow-500/30";

export default function Clients() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null); // {client, projects, notes}

  async function load() {
    setLoading(true);
    const data = await apiFetch("/api/clients");
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setEditing(null); setShowForm(true); }
  function openEdit(c) { setEditing(c); setShowForm(true); }

  async function onSave(form) {
    if (editing) {
      await apiFetch(`/api/clients/${editing.id}`, { method:"PUT", body: JSON.stringify(form) });
    } else {
      await apiFetch(`/api/clients`, { method:"POST", body: JSON.stringify(form) });
    }
    setShowForm(false);
    load();
  }

  async function onDelete(id) {
    if (!confirm("Hapus client ini?")) return;
    await apiFetch(`/api/clients/${id}`, { method:"DELETE" });
    load();
  }

  async function togglePayment(c, value) {
    const old = c.payment_status;
    setRows(rows.map(r => r.id === c.id ? { ...r, payment_status: value } : r));
    const res = await apiFetch(`/api/clients/${c.id}/payment`, {
      method:"PUT",
      body: JSON.stringify({ payment_status: value })
    });
    if (!res?.msg) {
      setRows(rows.map(r => r.id === c.id ? { ...r, payment_status: old } : r));
      alert("Gagal update payment");
    }
  }

  async function openDetail(c) {
    const data = await apiFetch(`/api/clients/${c.id}`);
    setDetail(data);
  }

  return (
    <div className="text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold tracking-wide flex items-center gap-2">
          <FaInfoCircle className="text-blue-400" /> Clients
        </h2>
        <button
          onClick={openCreate}
          className="px-3 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 transition flex items-center gap-2"
        >
          <FaPlus /> Tambah
        </button>
      </div>

      {loading ? (
        <div className="text-gray-300">Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-gradient-to-br from-slate-900 to-blue-950 border border-slate-700 rounded-2xl">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-800/60 text-gray-200">
              <tr>
                <th className="text-left px-4 py-3">Client</th>
                <th className="text-left px-4 py-3">Kontak</th>
                <th className="text-left px-4 py-3">Perusahaan</th>
                <th className="text-left px-4 py-3">Payment</th>
                <th className="text-left px-4 py-3">Projects</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(c => (
                <tr key={c.id} className="border-t border-slate-700/60 hover:bg-slate-800/40">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{c.name}</div>
                    <div className="opacity-70">{c.address || "-"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2"><FaEnvelope className="opacity-70" />{c.email || "-"}</div>
                    <div className="flex items-center gap-2 opacity-80"><FaPhone />{c.phone || "-"}</div>
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <FaBuilding className="opacity-70" /> {c.company || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={c.payment_status}
                        onChange={(e)=>togglePayment(c, e.target.value)}
                        className="bg-gray-900 border border-white/40 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-white"
                      >
                        {PAY_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <span className={`px-2 py-1 rounded-md text-xs ${payColor(c.payment_status)}`}>
                        {c.payment_status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{c.project_count}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={()=>openDetail(c)}
                      className="px-2 py-1 border border-white/30 rounded hover:bg-blue-600/30"
                      title="Detail"
                    >
                      <FaInfoCircle />
                    </button>
                    <button
                      onClick={()=>openEdit(c)}
                      className="px-2 py-1 border border-white/30 rounded hover:bg-yellow-500/30"
                      title="Edit"
                    >
                      <FaPen />
                    </button>
                    <button
                      onClick={()=>onDelete(c.id)}
                      className="px-2 py-1 border border-white/30 rounded hover:bg-red-600/30"
                      title="Hapus"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td className="px-4 py-4" colSpan={6}>Belum ada data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ClientForm
          initial={editing}
          onClose={()=>setShowForm(false)}
          onSave={onSave}
        />
      )}

      {detail && (
        <ClientDetail
          data={detail}
          onClose={()=>setDetail(null)}
          onChanged={async()=>{
            const d = await apiFetch(`/api/clients/${detail.client.id}`);
            setDetail(d); load();
          }}
        />
      )}
    </div>
  );
}

/* ===== Modal Form Client ===== */
function ClientForm({ initial, onClose, onSave }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    email: initial?.email || "",
    phone: initial?.phone || "",
    company: initial?.company || "",
    address: initial?.address || "",
    payment_status: initial?.payment_status || "belum",
  });

  function set(k, v){ setForm({ ...form, [k]: v }); }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 border border-slate-700 rounded-2xl p-5 w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {initial ? "Edit Client" : "Tambah Client"}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded">
            <FaTimes />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input label="Nama" value={form.name} onChange={e=>set("name", e.target.value)} required />
          <Input label="Email" value={form.email} onChange={e=>set("email", e.target.value)} />
          <Input label="No HP" value={form.phone} onChange={e=>set("phone", e.target.value)} />
          <Input label="Perusahaan" value={form.company} onChange={e=>set("company", e.target.value)} />
          <div className="md:col-span-2">
            <Input label="Alamat" value={form.address} onChange={e=>set("address", e.target.value)} leftIcon={<FaMapMarkerAlt />} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Payment Status</label>
            <select
              className="w-full bg-gray-900 border border-white/40 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white"
              value={form.payment_status}
              onChange={(e)=>set("payment_status", e.target.value)}
            >
              {PAY_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <div className={`inline-block mt-2 px-2 py-1 rounded text-xs ${payColor(form.payment_status)}`}>
              {form.payment_status}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 border border-white/30 rounded">Batal</button>
          <button
            onClick={()=>onSave(form)}
            className="px-3 py-2 bg-blue-700 hover:bg-blue-600 rounded text-white flex items-center gap-2"
          >
            <FaCheckCircle /> Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== Modal Detail Client (center) ===== */
function ClientDetail({ data, onClose, onChanged }) {
  const c = data.client;
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("proses");
  const [next, setNext] = useState("");

  async function addNote() {
    if (!note.trim()) return;
    await apiFetch(`/api/clients/${c.id}/notes`, {
      method:"POST",
      body: JSON.stringify({ note, status, next_follow_up: next || null })
    });
    setNote(""); setStatus("proses"); setNext("");
    onChanged();
  }

  async function updateNote(n, fields) {
    await apiFetch(`/api/clients/notes/${n.id}`, { method:"PUT", body: JSON.stringify({ ...n, ...fields }) });
    onChanged();
  }

  async function delNote(n) {
    if (!confirm("Hapus catatan ini?")) return;
    await apiFetch(`/api/clients/notes/${n.id}`, { method:"DELETE" });
    onChanged();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-gradient-to-br from-slate-900 to-blue-950 border border-slate-700 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <FaInfoCircle className="text-blue-400" /> {c.name}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded">
            <FaTimes />
          </button>
        </div>

        {/* Info grid */}
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          <Info title="Email" value={c.email || "-"} icon={<FaEnvelope />} />
          <Info title="No HP" value={c.phone || "-"} icon={<FaPhone />} />
          <Info title="Perusahaan" value={c.company || "-"} icon={<FaBuilding />} />
          <Info title="Alamat" value={c.address || "-"} icon={<FaMapMarkerAlt />} />
          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-3">
            <div className="text-xs opacity-60 mb-1 flex items-center gap-2"><FaMoneyBillWave /> Payment</div>
            <div className={`inline-block px-2 py-1 rounded text-sm ${payColor(c.payment_status)}`}>{c.payment_status}</div>
          </div>
        </div>

        {/* Projects */}
        <section className="mb-6">
          <h4 className="font-semibold mb-2">Riwayat Proyek</h4>
          <div className="overflow-x-auto border border-slate-700 rounded-xl">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-800/70">
                <tr>
                  <th className="text-left px-3 py-2">Nama</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Harga</th>
                  <th className="text-left px-3 py-2">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {data.projects.map(p => (
                  <tr key={p.id} className="border-t border-slate-700/50">
                    <td className="px-3 py-2">{p.name}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${noteColor(p.status)}`}>{p.status}</span>
                    </td>
                    <td className="px-3 py-2">Rp {Number(p.price||0).toLocaleString("id-ID")}</td>
                    <td className="px-3 py-2">{p.deadline || "-"}</td>
                  </tr>
                ))}
                {data.projects.length === 0 && <tr><td colSpan={4} className="px-3 py-3">Belum ada proyek.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        {/* Notes */}
        <section>
          <h4 className="font-semibold mb-2">Catatan & Follow-up</h4>
          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-3 mb-3">
            <textarea
              className="w-full bg-gray-900 border border-white/30 rounded p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-white"
              rows={3}
              placeholder="Tulis catatan komunikasi..."
              value={note}
              onChange={e=>setNote(e.target.value)}
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <select
                className="bg-gray-900 border border-white/30 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-white"
                value={status}
                onChange={e=>setStatus(e.target.value)}
              >
                {NOTE_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                type="date"
                className="bg-gray-900 border border-white/30 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-white"
                value={next}
                onChange={e=>setNext(e.target.value)}
              />
              <div className={`hidden sm:inline-block px-2 py-1 rounded text-xs ${noteColor(status)}`}>{status}</div>
              <button
                onClick={addNote}
                className="sm:ml-auto px-3 py-2 bg-blue-700 hover:bg-blue-600 rounded text-white"
              >
                Tambah
              </button>
            </div>
          </div>

          <ul className="space-y-3">
            {data.notes.map(n => (
              <li key={n.id} className="border border-slate-700 rounded-xl p-3">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <select
                    className="bg-gray-900 border border-white/30 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-white"
                    value={n.status}
                    onChange={(e)=>updateNote(n, { status: e.target.value })}
                  >
                    {NOTE_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span className={`px-2 py-1 rounded text-xs ${noteColor(n.status)}`}>{n.status}</span>
                  <input
                    type="date"
                    className="bg-gray-900 border border-white/30 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-white"
                    value={n.next_follow_up || ""}
                    onChange={(e)=>updateNote(n, { next_follow_up: e.target.value })}
                  />
                  <div className="text-xs opacity-60 md:ml-2">{new Date(n.created_at).toLocaleString()}</div>
                  <button
                    onClick={()=>delNote(n)}
                    className="md:ml-auto px-2 py-1 border border-white/30 rounded hover:bg-red-600/30"
                  >
                    <FaTrash />
                  </button>
                </div>
                <textarea
                  className="w-full bg-gray-900 border border-white/30 rounded p-2 mt-2 focus:outline-none focus:ring-2 focus:ring-white"
                  rows={2}
                  value={n.note}
                  onChange={(e)=>updateNote(n, { note: e.target.value })}
                />
              </li>
            ))}
            {data.notes.length === 0 && <li className="opacity-70">Belum ada catatan.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}

/* helpers */
function Input({ label, leftIcon, ...p }) {
  return (
    <label className="block">
      <span className="block text-sm mb-1">{label}</span>
      <div className="relative">
        {leftIcon && <span className="absolute left-3 top-2.5 opacity-70">{leftIcon}</span>}
        <input
          {...p}
          className={
            "w-full bg-gray-900 border border-white/40 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white " +
            (leftIcon ? "pl-9 " : "") +
            (p.className || "")
          }
        />
      </div>
    </label>
  );
}
function Info({ title, value, icon }) {
  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-3">
      <div className="text-xs opacity-60 flex items-center gap-2">{icon} {title}</div>
      <div className="font-medium mt-1">{value}</div>
    </div>
  );
}
