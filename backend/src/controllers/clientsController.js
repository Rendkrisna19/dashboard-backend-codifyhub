import db from "../config/db.js";

/* List + ringkas */
export const listClients = (req, res) => {
  const sql = `
    SELECT c.*,
      (SELECT COUNT(*) FROM projects p WHERE p.client_id = c.id) AS project_count,
      (SELECT status FROM client_notes n WHERE n.client_id = c.id ORDER BY n.created_at DESC LIMIT 1) AS last_note_status
    FROM clients c
    ORDER BY c.created_at DESC`;
  db.query(sql, (e, rows) => {
    if (e) return res.status(500).json({ msg: e.message });
    res.json(rows);
  });
};

/* Detail + projects + notes */
export const getClient = (req, res) => {
  const { id } = req.params;
  const qClient = `SELECT * FROM clients WHERE id=? LIMIT 1`;
  const qProjects = `SELECT id, name, status, price, deadline FROM projects WHERE client_id=? ORDER BY deadline DESC`;
  const qNotes = `SELECT * FROM client_notes WHERE client_id=? ORDER BY created_at DESC`;

  db.query(qClient, [id], (e1, r1) => {
    if (e1) return res.status(500).json({ msg: e1.message });
    if (!r1.length) return res.status(404).json({ msg: "Client not found" });

    db.query(qProjects, [id], (e2, r2) => {
      if (e2) return res.status(500).json({ msg: e2.message });
      db.query(qNotes, [id], (e3, r3) => {
        if (e3) return res.status(500).json({ msg: e3.message });
        res.json({ client: r1[0], projects: r2, notes: r3 });
      });
    });
  });
};

/* Create */
export const createClient = (req, res) => {
  const { name, email, phone, company, address, payment_status } = req.body;
  if (!name) return res.status(400).json({ msg: "Name is required" });
  const sql = `INSERT INTO clients (name,email,phone,company,address,payment_status) VALUES (?,?,?,?,?,?)`;
  db.query(sql, [name, email, phone, company, address, payment_status || "belum"], (e, r) => {
    if (e) return res.status(500).json({ msg: e.message });
    res.json({ id: r.insertId });
  });
};

/* Update */
export const updateClient = (req, res) => {
  const { id } = req.params;
  const { name, email, phone, company, address, payment_status } = req.body;
  const sql = `UPDATE clients SET name=?, email=?, phone=?, company=?, address=?, payment_status=? WHERE id=?`;
  db.query(sql, [name, email, phone, company, address, payment_status, id], (e) => {
    if (e) return res.status(500).json({ msg: e.message });
    res.json({ msg: "Updated" });
  });
};

/* Delete */
export const deleteClient = (req, res) => {
  const { id } = req.params;
  db.query(`DELETE FROM clients WHERE id=?`, [id], (e) => {
    if (e) return res.status(500).json({ msg: e.message });
    res.json({ msg: "Deleted" });
  });
};

/* Update payment status cepat */
export const updatePaymentStatus = (req, res) => {
  const { id } = req.params;
  const { payment_status } = req.body; // 'belum' | 'dp' | 'lunas'
  db.query(`UPDATE clients SET payment_status=? WHERE id=?`, [payment_status, id], (e) => {
    if (e) return res.status(500).json({ msg: e.message });
    res.json({ msg: "Payment status updated" });
  });
};

/* Notes */
export const addNote = (req, res) => {
  const { id } = req.params; // client_id
  const { note, status, next_follow_up } = req.body;
  if (!note) return res.status(400).json({ msg: "note required" });
  const sql = `INSERT INTO client_notes (client_id, note, status, next_follow_up) VALUES (?,?,?,?)`;
  db.query(sql, [id, note, status || "proses", next_follow_up || null], (e, r) => {
    if (e) return res.status(500).json({ msg: e.message });
    res.json({ id: r.insertId });
  });
};

export const updateNote = (req, res) => {
  const { noteId } = req.params;
  const { note, status, next_follow_up } = req.body;
  const sql = `UPDATE client_notes SET note=?, status=?, next_follow_up=? WHERE id=?`;
  db.query(sql, [note, status, next_follow_up || null, noteId], (e) => {
    if (e) return res.status(500).json({ msg: e.message });
    res.json({ msg: "Note updated" });
  });
};

export const deleteNote = (req, res) => {
  const { noteId } = req.params;
  db.query(`DELETE FROM client_notes WHERE id=?`, [noteId], (e) => {
    if (e) return res.status(500).json({ msg: e.message });
    res.json({ msg: "Note deleted" });
  });
};
