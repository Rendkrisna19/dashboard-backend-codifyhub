import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch, API_URL } from "../lib/api.js";
import Chart from "chart.js/auto";
import {
  FaFileCsv, FaFilePdf, FaPlus, FaRedoAlt, FaFilter,
  FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaWallet,
  FaCreditCard, FaQrcode, FaExchangeAlt, FaMoneyBillWave
} from "react-icons/fa";

const TYPES   = ["income","expense"];
const CATS    = ["project_payment","domain","hosting","tools","gaji","lainnya"];
const METHODS = ["cash","transfer","qris","gateway","lainnya"];

// ===== badge helpers
const typeBadge = (t) =>
  t === "income" ? "bg-green-600/15 text-green-300 ring-1 ring-green-500/30"
                 : "bg-red-600/15 text-red-300 ring-1 ring-red-500/30";

const methodBadge = (m) =>
  m === "cash"     ? "bg-yellow-600/15 text-yellow-300 ring-1 ring-yellow-500/30"
: m === "transfer" ? "bg-blue-600/15 text-blue-300 ring-1 ring-blue-500/30"
: m === "qris"     ? "bg-purple-600/15 text-purple-300 ring-1 ring-purple-500/30"
: m === "gateway"  ? "bg-teal-600/15 text-teal-300 ring-1 ring-teal-500/30"
                   : "bg-slate-600/15 text-slate-300 ring-1 ring-slate-500/30";

const catBadge = () => "bg-slate-800/70 text-slate-200 ring-1 ring-white/10";

export default function Finance(){
  const [rows, setRows] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({ from: "", to: "", type: "", category: "" });
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState(null);
  const [summary, setSummary] = useState(null);

  async function load(){
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v])=>v)));
    const [list, pro, sum] = await Promise.all([
      apiFetch(`/api/finances?${qs.toString()}`),
      apiFetch(`/api/projects`),
      apiFetch(`/api/finances/summary?year=${new Date().getFullYear()}`)
    ]);
    setRows(list||[]); setProjects(pro||[]); setSummary(sum||null);
  }
  useEffect(()=>{ load(); }, [filters]);

  const totals = useMemo(()=>{
    let income=0, expense=0;
    rows.forEach(r => (r.type==='income' ? income += Number(r.amount||0) : expense += Number(r.amount||0)));
    return { income, expense, balance: income - expense, count: rows.length };
  }, [rows]);

  return (
    <div className="text-white">
      {/* Header actions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold tracking-wide flex items-center gap-2">
          <FaMoneyBillWave className="text-blue-400" /> Finance
        </h2>
        <div className="flex gap-2">
          <button onClick={()=>download("csv", filters)} className="px-3 py-2 border border-white/30 rounded-lg flex items-center gap-2 hover:bg-white/10">
            <FaFileCsv /> Export CSV
          </button>
          <button onClick={()=>download("pdf", filters)} className="px-3 py-2 border border-white/30 rounded-lg flex items-center gap-2 hover:bg-white/10">
            <FaFilePdf /> Export PDF
          </button>
          <button onClick={()=>{setEdit(null);setShowForm(true);}} className="px-3 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg flex items-center gap-2">
            <FaPlus /> Transaksi
          </button>
        </div>
      </div>

      {/* Filters */}
      <Filters value={filters} onChange={setFilters} />

      {/* KPI */}
      <KPIBox totals={totals} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <ChartIncomeExpense data={summary?.series||[]} />
        <ChartBalance data={summary?.series||[]} />
      </div>

      {/* Table */}
      <Table
        rows={rows}
        onEdit={(r)=>{setEdit(r);setShowForm(true);}}
        onDelete={async(id)=>{ if(confirm("Hapus transaksi?")){ await apiFetch(`/api/finances/${id}`,{method:"DELETE"}); load(); } }}
      />

      {/* Form */}
      {showForm && (
        <TxForm
          projects={projects}
          initial={edit}
          onClose={()=>{setShowForm(false);setEdit(null);}}
          onSaved={async(f)=>{
            if (edit) await apiFetch(`/api/finances/${edit.id}`, { method:"PUT", body: JSON.stringify(f) });
            else await apiFetch(`/api/finances`, { method:"POST", body: JSON.stringify(f) });
            setShowForm(false); setEdit(null); load();
          }}
        />
      )}
    </div>
  );
}

/* ===== Filters ===== */
function Filters({ value, onChange }){
  const input = "bg-gray-900 border border-white/40 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white";
  return (
    <div className="bg-gray-900 border border-slate-700 rounded-2xl p-3">
      <div className="flex items-center gap-2 mb-3 text-sm opacity-80">
        <FaFilter /> Filter transaksi
      </div>
      <div className="grid md:grid-cols-5 gap-3">
        <label className="block text-sm">Dari
          <input type="date" className={input} value={value.from} onChange={e=>onChange({...value, from:e.target.value})}/>
        </label>
        <label className="block text-sm">Sampai
          <input type="date" className={input} value={value.to} onChange={e=>onChange({...value, to:e.target.value})}/>
        </label>
        <label className="block text-sm">Tipe
          <select className={input} value={value.type} onChange={e=>onChange({...value, type:e.target.value})}>
            <option value="">Semua</option>
            {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="block text-sm">Kategori
          <select className={input} value={value.category} onChange={e=>onChange({...value, category:e.target.value})}>
            <option value="">Semua</option>
            {CATS.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <div className="flex items-end">
          <button
            className="w-full px-3 py-2 border border-white/30 rounded-lg flex items-center justify-center gap-2 hover:bg-white/10"
            onClick={()=>onChange({ from:"", to:"", type:"", category:"" })}
          >
            <FaRedoAlt /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== KPI ===== */
function KPIBox({ totals }){
  const card = "bg-gray-900 border border-slate-700 rounded-2xl p-4";
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
      <div className={card}>
        <div className="text-sm opacity-70 flex items-center gap-2"><FaArrowUp className="text-green-400" /> Pemasukan</div>
        <div className="text-2xl font-semibold">Rp {totals.income.toLocaleString("id-ID")}</div>
      </div>
      <div className={card}>
        <div className="text-sm opacity-70 flex items-center gap-2"><FaArrowDown className="text-red-400" /> Pengeluaran</div>
        <div className="text-2xl font-semibold">Rp {totals.expense.toLocaleString("id-ID")}</div>
      </div>
      <div className={card}>
        <div className="text-sm opacity-70 flex items-center gap-2"><FaWallet className="text-blue-400" /> Saldo</div>
        <div className="text-2xl font-semibold">Rp {totals.balance.toLocaleString("id-ID")}</div>
      </div>
      <div className={card}>
        <div className="text-sm opacity-70 flex items-center gap-2"><FaExchangeAlt className="text-sky-400" /> Transaksi</div>
        <div className="text-2xl font-semibold">{totals.count}</div>
      </div>
    </div>
  );
}

/* ===== Charts ===== */
function ChartIncomeExpense({ data }){
  const ref = useRef(null);
  const chart = useRef(null);
  useEffect(()=> {
    if (!ref.current) return;
    if (chart.current) chart.current.destroy();
    const labels = data.map(d=>new Date(2025, d.m-1, 1).toLocaleString("id-ID", { month:"short" }));
    chart.current = new Chart(ref.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label:"Income",  data: data.map(d=>d.income),  backgroundColor:"#1e3a8a", borderRadius:6 },
          { label:"Expense", data: data.map(d=>d.expense), backgroundColor:"#0ea5e9", borderRadius:6 },
        ]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ labels:{ color:"#e5e7eb" } } },
        scales:{
          x:{ ticks:{ color:"#e5e7eb" }, grid:{ color:"rgba(255,255,255,.08)" } },
          y:{ ticks:{ color:"#e5e7eb" }, grid:{ color:"rgba(255,255,255,.1)" } },
        }
      }
    });
    return ()=>chart.current?.destroy();
  }, [data]);
  return (
    <div className="bg-gray-900 border border-slate-700 rounded-2xl p-4 h-80 lg:col-span-2">
      <div className="font-semibold mb-2">Income vs Expense (Bulanan)</div>
      <canvas ref={ref}/>
    </div>
  );
}

function ChartBalance({ data }){
  const ref = useRef(null);
  const chart = useRef(null);
  useEffect(()=>{
    if (!ref.current) return;
    if (chart.current) chart.current.destroy();
    const labels = data.map(d=>new Date(2025, d.m-1, 1).toLocaleString("id-ID", { month:"short" }));
    chart.current = new Chart(ref.current, {
      type:"line",
      data:{
        labels,
        datasets:[{ label:"Saldo Kumulatif", data: data.map(d=>d.balance), borderColor:"#0ea5e9", fill:false, tension:.25 }]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ labels:{ color:"#e5e7eb" } } },
        scales:{
          x:{ ticks:{ color:"#e5e7eb" }, grid:{ color:"rgba(255,255,255,.08)" } },
          y:{ ticks:{ color:"#e5e7eb" }, grid:{ color:"rgba(255,255,255,.1)" } },
        }
      }
    });
    return ()=>chart.current?.destroy();
  }, [data]);
  return (
    <div className="bg-gray-900 border border-slate-700 rounded-2xl p-4 h-80">
      <div className="font-semibold mb-2">Saldo Kumulatif</div>
      <canvas ref={ref}/>
    </div>
  );
}

/* ===== Table ===== */
function Table({ rows, onEdit, onDelete }){
  const iconForMethod = (m) =>
    m === "cash" ? <FaMoneyBillWave/>
  : m === "transfer" ? <FaCreditCard/>
  : m === "qris" ? <FaQrcode/>
  : m === "gateway" ? <FaExchangeAlt/>
  : <FaWallet/>;

  return (
    <div className="overflow-x-auto bg-gray-900 border border-slate-700 rounded-2xl mt-6">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-800/70">
          <tr>
            <th className="px-4 py-3 text-left">Tanggal</th>
            <th className="px-4 py-3 text-left">Tipe</th>
            <th className="px-4 py-3 text-left">Kategori</th>
            <th className="px-4 py-3 text-left">Deskripsi</th>
            <th className="px-4 py-3 text-left">Metode</th>
            <th className="px-4 py-3 text-left">Jumlah</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.id} className="border-t border-slate-700/60 hover:bg-slate-800/40">
              <td className="px-4 py-3">{r.date}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded ${typeBadge(r.type)} capitalize`}>{r.type}</span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded ${catBadge()}`}>{r.category||"-"}</span>
              </td>
              <td className="px-4 py-3">{r.description||"-"}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded inline-flex items-center gap-2 ${methodBadge(r.method||"lainnya")}`}>
                  {iconForMethod(r.method)} {r.method||"-"}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">Rp {Number(r.amount||0).toLocaleString("id-ID")}</td>
              <td className="px-4 py-3 text-right space-x-2">
                <button onClick={()=>onEdit(r)} className="px-2 py-1 border border-white/30 rounded hover:bg-yellow-500/30" title="Edit"><FaEdit/></button>
                <button onClick={()=>onDelete(r.id)} className="px-2 py-1 border border-white/30 rounded hover:bg-red-600/30" title="Hapus"><FaTrash/></button>
              </td>
            </tr>
          ))}
          {rows.length===0 && <tr><td className="px-4 py-4" colSpan={7}>Belum ada data.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

/* ===== Form ===== */
function TxForm({ initial, onClose, onSaved, projects }){
  const [f, setF] = useState({
    type: initial?.type || "income",
    category: initial?.category || "project_payment",
    project_id: initial?.project_id || "",
    description: initial?.description || "",
    amount: initial?.amount || "",
    date: initial?.date || new Date().toISOString().slice(0,10),
    method: initial?.method || "transfer",
    note: initial?.note || ""
  });
  const input = "w-full bg-gray-900 border border-white/40 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white text-white placeholder-gray-400";

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-slate-700 rounded-2xl p-5 w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{initial?"Edit Transaksi":"Tambah Transaksi"}</h3>
          <button onClick={onClose} className="p-2 rounded hover:bg-white/10">
            <FaTrash className="opacity-0" /> {/* spacer agar tinggi konsisten */}
            <span className="absolute right-7 top-6">✕</span>
          </button>
        </div>

        {/* segmented type */}
        <div className="mb-4 inline-flex rounded-lg overflow-hidden border border-white/20">
          <button
            className={`px-4 py-2 ${f.type==="income" ? "bg-green-600/20 text-green-300" : "bg-slate-800 text-slate-200"}`}
            onClick={()=>setF({...f, type:"income"})}
            type="button"
          >
            <FaArrowUp className="inline mr-2" /> Income
          </button>
          <button
            className={`px-4 py-2 ${f.type==="expense" ? "bg-red-600/20 text-red-300" : "bg-slate-800 text-slate-200"}`}
            onClick={()=>setF({...f, type:"expense"})}
            type="button"
          >
            <FaArrowDown className="inline mr-2" /> Expense
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <label className="block text-sm">Kategori
            <select className={input} value={f.category} onChange={e=>setF({...f, category:e.target.value})}>
              {CATS.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label className="block text-sm">Proyek (opsional)
            <select className={input} value={f.project_id} onChange={e=>setF({...f, project_id:e.target.value})}>
              <option value="">—</option>
              {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>

          <label className="block text-sm">Tanggal
            <input type="date" className={input} value={f.date} onChange={e=>setF({...f, date:e.target.value})}/>
          </label>

          <label className="block text-sm">Jumlah (Rp)
            <input type="number" className={input} value={f.amount} onChange={e=>setF({...f, amount:e.target.value})}/>
          </label>

          <label className="block text-sm md:col-span-2">Deskripsi
            <input className={input} value={f.description} onChange={e=>setF({...f, description:e.target.value})}/>
          </label>

          <label className="block text-sm">Metode
            <select className={input} value={f.method} onChange={e=>setF({...f, method:e.target.value})}>
              {METHODS.map(m=><option key={m} value={m}>{m}</option>)}
            </select>
          </label>

          <label className="block text-sm">Catatan
            <input className={input} value={f.note} onChange={e=>setF({...f, note:e.target.value})}/>
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 border border-white/30 rounded">Batal</button>
          <button onClick={()=>onSaved(f)} className="px-3 py-2 bg-blue-700 hover:bg-blue-600 rounded">Simpan</button>
        </div>
      </div>
    </div>
  );
}

/* ===== Export helper ===== */
async function download(kind, filters){
  const qs = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v])=>v)));
  const token = localStorage.getItem("token");
  const url = `${API_URL}/api/finances/export.${kind}?${qs.toString()}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `finances.${kind}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
