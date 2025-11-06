import db from "../config/db.js";
import PDFDocument from "pdfkit";
import { Readable } from "stream";

/* Utils */
function buildWhere({ from, to, type, category }) {
  const wh = [], vals = [];
  if (from) { wh.push("date >= ?"); vals.push(from); }
  if (to)   { wh.push("date <= ?"); vals.push(to); }
  if (type) { wh.push("type = ?");  vals.push(type); }
  if (category) { wh.push("category = ?"); vals.push(category); }
  const where = wh.length ? `WHERE ${wh.join(" AND ")}` : "";
  return { where, vals };
}

/* List + filter */
export const listFinances = (req, res) => {
  const { from, to, type, category } = req.query;
  const { where, vals } = buildWhere({ from, to, type, category });
  const sql = `
    SELECT f.*, p.name AS project_name
    FROM finances f
    LEFT JOIN projects p ON p.id=f.project_id
    ${where}
    ORDER BY date DESC, id DESC`;
  db.query(sql, vals, (e, rows) => e ? res.status(500).json({ msg: e.message }) : res.json(rows));
};

/* Create */
export const createFinance = (req, res) => {
  const { type, category, project_id, description, amount, date, method, note } = req.body;
  if (!type || !amount || !date) return res.status(400).json({ msg: "type, amount, date required" });
  const sql = `INSERT INTO finances (type, category, project_id, description, amount, date, method, note)
               VALUES (?,?,?,?,?,?,?,?)`;
  db.query(sql, [type, category || null, project_id || null, description || null, amount, date, method || null, note || null],
    (e, r) => e ? res.status(500).json({ msg: e.message }) : res.json({ id: r.insertId }));
};

/* Update */
export const updateFinance = (req, res) => {
  const { id } = req.params;
  const { type, category, project_id, description, amount, date, method, note } = req.body;
  const sql = `UPDATE finances SET type=?, category=?, project_id=?, description=?, amount=?, date=?, method=?, note=? WHERE id=?`;
  db.query(sql, [type, category || null, project_id || null, description || null, amount, date, method || null, note || null, id],
    (e) => e ? res.status(500).json({ msg: e.message }) : res.json({ msg: "Updated" }));
};

/* Delete */
export const deleteFinance = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM finances WHERE id=?", [id], (e) =>
    e ? res.status(500).json({ msg: e.message }) : res.json({ msg: "Deleted" })
  );
};

/* Monthly summary (Income/Expense per month + saldo kumulatif) */
export const monthlySummary = (req, res) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const sql = `
    SELECT
      MONTH(date) AS m,
      SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS income,
      SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense
    FROM finances
    WHERE YEAR(date)=?
    GROUP BY MONTH(date)
    ORDER BY m`;
  db.query(sql, [year], (e, rows) => {
    if (e) return res.status(500).json({ msg: e.message });
    const months = Array.from({length:12}, (_,i)=>i+1).map(m=>{
      const r = rows.find(x=>x.m===m) || { income:0, expense:0 };
      return { m, income: Number(r.income||0), expense: Number(r.expense||0) };
    });
    // saldo kumulatif
    let balance = 0;
    const series = months.map(x=>{
      balance += x.income - x.expense;
      return { ...x, balance };
    });
    res.json({ year, series });
  });
};

/* Export CSV */
export const exportCSV = (req, res) => {
  const { from, to, type, category } = req.query;
  const { where, vals } = buildWhere({ from, to, type, category });
  const sql = `
    SELECT date, type, category, description, amount, method, note
    FROM finances
    ${where}
    ORDER BY date ASC, id ASC`;
  db.query(sql, vals, (e, rows) => {
    if (e) return res.status(500).json({ msg: e.message });
    const header = "date,type,category,description,amount,method,note";
    const lines = rows.map(r => [
      r.date, r.type, r.category || "", (r.description||"").replace(/,/g," "), r.amount, r.method||"", (r.note||"").replace(/,/g," ")
    ].join(","));
    const csv = [header, ...lines].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=finances.csv");
    res.send(csv);
  });
};

/* Export PDF (ringkas) */
export const exportPDF = (req, res) => {
  const { from, to, type, category } = req.query;
  const { where, vals } = buildWhere({ from, to, type, category });
  const sql = `
    SELECT date, type, category, description, amount
    FROM finances
    ${where}
    ORDER BY date ASC, id ASC`;
  db.query(sql, vals, (e, rows) => {
    if (e) return res.status(500).json({ msg: e.message });
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=finances.pdf");
    doc.pipe(res);
    doc.fontSize(16).text("Laporan Keuangan", { align: "center" });
    doc.moveDown();
    if (from || to) doc.fontSize(10).text(`Periode: ${from||"-"} s/d ${to||"-"}`, { align: "center" }).moveDown();

    let totalIn=0, totalEx=0;
    doc.fontSize(11);
    rows.forEach(r=>{
      if (r.type==='income') totalIn+=Number(r.amount||0); else totalEx+=Number(r.amount||0);
      doc.text(`${r.date}  |  ${r.type.toUpperCase()}  |  ${r.category||"-"}  |  ${r.description||"-"}  |  Rp ${Number(r.amount||0).toLocaleString('id-ID')}`);
    });
    doc.moveDown();
    doc.text(`Total Pemasukan: Rp ${totalIn.toLocaleString('id-ID')}`);
    doc.text(`Total Pengeluaran: Rp ${totalEx.toLocaleString('id-ID')}`);
    doc.text(`Saldo: Rp ${(totalIn-totalEx).toLocaleString('id-ID')}`);
    doc.end();
  });
};
