import React, { useEffect, useState } from "react";
import { apiFetch, API_URL } from "../lib/api.js";
import {
  FaPlus, FaEdit, FaTrash, FaInfoCircle, FaTimes, FaUsers, FaUpload,
  FaCalendarAlt, FaDollarSign, FaLaptopCode, FaUserTag, FaFolderOpen
} from "react-icons/fa";

const STATUS = ["planning","on_progress","revisi","selesai"];

// ===== badge color helper =====
const statusColor = (s) =>
  s === "selesai"     ? "bg-green-600/15 text-green-300 ring-1 ring-green-500/30"
: s === "revisi"      ? "bg-red-600/15 text-red-300 ring-1 ring-red-500/30"
: s === "on_progress" ? "bg-yellow-600/15 text-yellow-300 ring-1 ring-yellow-500/30"
                      : "bg-blue-600/15 text-blue-300 ring-1 ring-blue-500/30";

export default function Projects(){
  const [rows, setRows] = useState([]);
  const [clients, setClients] = useState([]);
  const [teams, setTeams] = useState([]);
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState(null);
  const [detail, setDetail] = useState(null);

  async function load(){
    const [p, c, t] = await Promise.all([
      apiFetch("/api/projects"),
      apiFetch("/api/clients"),
      apiFetch("/api/teams")
    ]);
    setRows(p||[]); setClients(c||[]); setTeams(t||[]);
  }
  useEffect(()=>{ load(); }, []);

  async function openDetail(row){
    const d = await apiFetch(`/api/projects/${row.id}`);
    setDetail(d);
  }

  async function save(form){
    if (edit) {
      await apiFetch(`/api/projects/${edit.id}`, { method:"PUT", body: JSON.stringify(form) });
      if (form.team_ids) await apiFetch(`/api/projects/${edit.id}/team`, { method:"PUT", body: JSON.stringify({ team_ids: form.team_ids }) });
    } else {
      const res = await apiFetch(`/api/projects`, { method:"POST", body: JSON.stringify(form) });
      if (form.team_ids?.length) await apiFetch(`/api/projects/${res.id}/team`, { method:"PUT", body: JSON.stringify({ team_ids: form.team_ids }) });
    }
    setShow(false); setEdit(null); load();
  }

  async function del(id){
    if (!confirm("Hapus proyek ini?")) return;
    await apiFetch(`/api/projects/${id}`, { method:"DELETE" });
    load();
  }

  return (
    <div className="text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold tracking-wide flex items-center gap-2">
          <FaFolderOpen className="text-blue-400" /> Projects
        </h2>
        <button
          className="px-3 py-2 bg-blue-700 hover:bg-blue-600 border border-white/20 rounded-lg flex items-center gap-2"
          onClick={()=>{setEdit(null);setShow(true);}}
        >
          <FaPlus /> Tambah
        </button>
      </div>

      <div className="overflow-x-auto bg-gradient-to-br from-slate-900 to-blue-950 border border-slate-700 rounded-2xl">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800/70 text-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">Client</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Harga</th>
              <th className="px-4 py-3 text-left">Deadline</th>
              <th className="px-4 py-3 text-left">Team</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.id} className="border-t border-slate-700/60 hover:bg-slate-800/40">
                <td className="px-4 py-3 font-semibold">{r.name}</td>
                <td className="px-4 py-3">{r.client_name || "-"}</td>
                <td className="px-4 py-3 capitalize">
                  <span className={`px-2 py-1 rounded ${statusColor(r.status)}`}>{r.status.replace("_"," ")}</span>
                </td>
                <td className="px-4 py-3">Rp {Number(r.price||0).toLocaleString("id-ID")}</td>
                <td className="px-4 py-3">{r.deadline || "-"}</td>
                <td className="px-4 py-3">{r.team_count}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button className="px-2 py-1 border border-white/30 rounded hover:bg-blue-600/30" onClick={()=>openDetail(r)} title="Detail"><FaInfoCircle/></button>
                  <button className="px-2 py-1 border border-white/30 rounded hover:bg-yellow-500/30" onClick={()=>{setEdit(r);setShow(true);}} title="Edit"><FaEdit/></button>
                  <button className="px-2 py-1 border border-white/30 rounded hover:bg-red-600/30" onClick={()=>del(r.id)} title="Hapus"><FaTrash/></button>
                </td>
              </tr>
            ))}
            {rows.length===0 && <tr><td className="px-4 py-4" colSpan={7}>Belum ada proyek.</td></tr>}
          </tbody>
        </table>
      </div>

      {show && (
        <ProjectForm
          initial={edit}
          clients={clients}
          teams={teams}
          onClose={()=>{setShow(false);setEdit(null);}}
          onSave={save}
        />
      )}
      {detail && (
        <ProjectDetail
          data={detail}
          onChanged={async()=>{ const d = await apiFetch(`/api/projects/${detail.project.id}`); setDetail(d); load(); }}
          onClose={()=>setDetail(null)}
        />
      )}
    </div>
  );
}

/* ================== FORM MODAL (CENTER) ================== */
function ProjectForm({ initial, clients, teams, onClose, onSave }){
  const [f, setF] = useState({
    client_id: initial?.client_id || "",
    name: initial?.name || "",
    website_type: initial?.website_type || "",
    deadline: initial?.deadline || "",
    price: initial?.price || 0,
    status: initial?.status || "planning",
    estimate_hours: initial?.estimate_hours || "",
    actual_hours: initial?.actual_hours || 0,
    team_ids: initial?.team_ids || [] // jika backend kirimkan saat edit
  });

  const input =
    "w-full bg-gray-900 border border-white/40 rounded px-3 py-2 " +
    "focus:outline-none focus:ring-2 focus:ring-white";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 border border-slate-700 rounded-2xl p-5 w-full max-w-3xl shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{initial ? "Edit Proyek" : "Tambah Proyek"}</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-white/10"><FaTimes/></button>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <Field label="Client">
            <select className={input} value={f.client_id} onChange={e=>setF({...f,client_id:e.target.value})}>
              <option value="">-- pilih client --</option>
              {clients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>

          <Field label="Nama Proyek">
            <input className={input} value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
          </Field>

          <Field label="Jenis Website">
            <div className="relative">
              <FaLaptopCode className="absolute left-3 top-3 opacity-70"/>
              <input className={input+" pl-9"} placeholder="company profile, toko online, dll" value={f.website_type} onChange={e=>setF({...f,website_type:e.target.value})}/>
            </div>
          </Field>

          <Field label="Deadline">
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-3 opacity-70"/>
              <input type="date" className={input+" pl-9"} value={f.deadline||""} onChange={e=>setF({...f,deadline:e.target.value})}/>
            </div>
          </Field>

          <Field label="Harga">
            <div className="relative">
              <FaDollarSign className="absolute left-3 top-3 opacity-70"/>
              <input type="number" className={input+" pl-9"} value={f.price} onChange={e=>setF({...f,price:e.target.value})}/>
            </div>
          </Field>

          <Field label="Status">
            <select className={input} value={f.status} onChange={e=>setF({...f,status:e.target.value})}>
              {STATUS.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <div className={`inline-block mt-2 px-2 py-1 rounded text-xs ${statusColor(f.status)}`}>{f.status.replace("_"," ")}</div>
          </Field>

          <Field label="Estimasi (jam)">
            <input type="number" className={input} value={f.estimate_hours||""} onChange={e=>setF({...f,estimate_hours:e.target.value})}/>
          </Field>

          <Field label="Realisasi (jam)">
            <input type="number" className={input} value={f.actual_hours||0} onChange={e=>setF({...f,actual_hours:e.target.value})}/>
          </Field>

          {/* Multi select tim */}
          <Field label="Assign Team (bisa pilih banyak)" full>
            <select
              multiple
              className={input+" min-h-[120px]"}
              value={f.team_ids}
              onChange={e=>{
                const arr = Array.from(e.target.selectedOptions).map(o=>Number(o.value));
                setF({...f,team_ids: arr});
              }}
            >
              {teams.map(t=><option key={t.id} value={t.id}>{t.name} — {t.role||"member"}</option>)}
            </select>

            {/* chips preview */}
            <div className="flex flex-wrap gap-2 mt-2">
              {teams.filter(t=>f.team_ids.includes(t.id)).map(t=>(
                <span key={t.id} className="px-2 py-1 rounded bg-slate-800/60 border border-slate-700 text-xs flex items-center gap-2">
                  <FaUserTag/> {t.name}
                </span>
              ))}
              {(!f.team_ids || f.team_ids.length===0) && <span className="text-xs opacity-60">Belum ada yang dipilih.</span>}
            </div>
          </Field>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 border border-white/30 rounded">Batal</button>
          <button onClick={()=>onSave(f)} className="px-3 py-2 bg-blue-700 hover:bg-blue-600 rounded">Simpan</button>
        </div>
      </div>
    </div>
  );
}

/* ================== DETAIL MODAL (CENTER) ================== */
function ProjectDetail({ data, onChanged, onClose }){
  const p = data.project;

  async function upload(e){
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/projects/${p.id}/files`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    });
    const out = await res.json();
    if (!out?.id) alert(out?.msg || "Upload gagal");
    await onChanged();
  }

  const progress =
    Number(p.estimate_hours || 0) === 0
      ? 0
      : Math.min(100, Math.round((Number(p.actual_hours||0) / Number(p.estimate_hours)) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-gradient-to-br from-slate-900 to-blue-950 border border-slate-700 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <FaInfoCircle className="text-blue-400" /> {p.name}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded"><FaTimes/></button>
        </div>

        {/* Info grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Info icon={<FaUsers/>}    k="Client"                  v={p.client_name||"-"} />
          <Info                      k="Status"
                v={<span className={`px-2 py-1 rounded text-sm ${statusColor(p.status)}`}>{p.status.replace("_"," ")}</span>} />
          <Info icon={<FaLaptopCode/>} k="Jenis"                  v={p.website_type||"-"} />
          <Info icon={<FaCalendarAlt/>} k="Deadline"              v={p.deadline||"-"} />
          <Info icon={<FaDollarSign/>}  k="Harga"                 v={"Rp " + Number(p.price||0).toLocaleString("id-ID")} />
          <Info                        k="Estimasi / Realisasi"
                v={`${p.estimate_hours||0} / ${p.actual_hours||0} jam`} />
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1 text-sm opacity-80">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full ${progress===100 ? "bg-green-500" : "bg-blue-600"}`} style={{width: `${progress}%`}}/>
          </div>
        </div>

        {/* Team */}
        <section className="mb-6">
          <h4 className="font-semibold mb-2">Tim Proyek</h4>
          <ul className="grid md:grid-cols-2 gap-3">
            {data.team.map(t=>(
              <li key={t.id} className="border border-slate-700 rounded-xl p-3">
                <div className="font-medium">{t.name}</div>
                <div className="text-sm opacity-70">{t.role || "member"} — {t.email || "-"}</div>
              </li>
            ))}
            {data.team.length===0 && <div className="opacity-70">Belum ada anggota tim.</div>}
          </ul>
        </section>

        {/* Files */}
        <section>
          <h4 className="font-semibold mb-2">Dokumen</h4>
          <div className="border border-slate-700 rounded-xl p-3 mb-3">
            <label className="flex items-center gap-2 cursor-pointer w-fit px-3 py-2 rounded bg-slate-800 hover:bg-slate-700">
              <FaUpload/> <span>Upload file</span>
              <input type="file" className="hidden" onChange={upload} />
            </label>
            <div className="text-xs opacity-70 mt-1">PDF/JPG/PNG/DOCX diperbolehkan. Tersimpan di <code>/uploads</code>.</div>
          </div>

          <ul className="space-y-2">
            {data.files.map(f=>(
              <li key={f.id} className="border border-slate-700 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{f.original_name}</div>
                  <div className="text-xs opacity-70">{f.mime || "file"} • {Math.round((f.size||0)/1024)} KB</div>
                </div>
                <a target="_blank" href={`${API_URL}/uploads/${f.filename}`}
                   className="px-3 py-2 border border-white/30 rounded hover:bg-white/10">Buka</a>
              </li>
            ))}
            {data.files.length===0 && <li className="opacity-70">Belum ada file.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}

/* ===== small components ===== */
function Field({ label, children, full }) {
  return (
    <label className={`block text-sm ${full ? "md:col-span-2" : ""}`}>
      <span className="mb-1 inline-block">{label}</span>
      {children}
    </label>
  );
}
function Info({k,v,icon}){ return (
  <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-3">
    <div className="text-xs opacity-60 flex items-center gap-2">{icon}{k}</div>
    <div className="font-medium mt-1">{v}</div>
  </div>
); }
