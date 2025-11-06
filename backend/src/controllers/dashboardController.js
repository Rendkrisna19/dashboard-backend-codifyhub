import db from "../config/db.js";

/**
 * GET /api/dashboard
 * Mengembalikan ringkasan:
 * - clients (COUNT)
 * - projects (COUNT)
 * - income (SUM semua pemasukan)
 * - expense (SUM semua pengeluaran)
 * - income_month & expense_month (bulan berjalan, opsional untuk dipakai nanti)
 */
export const getSummary = (req, res) => {
  // Bisa override tahun/bulan via query ?year=2025&month=11
  const now = new Date();
  const year  = Number(req.query.year  || now.getFullYear());
  const month = Number(req.query.month || (now.getMonth() + 1));

  const sql = `
    SELECT
      (SELECT COUNT(*) FROM clients) AS clients,
      (SELECT COUNT(*) FROM projects) AS projects,
      (SELECT IFNULL(SUM(amount),0) FROM finances WHERE type='income')  AS income_all,
      (SELECT IFNULL(SUM(amount),0) FROM finances WHERE type='expense') AS expense_all,
      (SELECT IFNULL(SUM(amount),0) FROM finances WHERE type='income'  AND YEAR(date)=? AND MONTH(date)=?)  AS income_month,
      (SELECT IFNULL(SUM(amount),0) FROM finances WHERE type='expense' AND YEAR(date)=? AND MONTH(date)=?) AS expense_month
  `;
  db.query(sql, [year, month, year, month], (err, rows) => {
    if (err) return res.status(500).json({ msg: err.message });
    const r = rows[0] || {};
    // Frontend kamu pakai properti ini:
    res.json({
      clients:  Number(r.clients || 0),
      projects: Number(r.projects || 0),
      income:   Number(r.income_all || 0),
      expense:  Number(r.expense_all || 0),

      // bonus—kalau nanti mau dipakai
      income_month:  Number(r.income_month || 0),
      expense_month: Number(r.expense_month || 0),
      year, month
    });
  });
};
