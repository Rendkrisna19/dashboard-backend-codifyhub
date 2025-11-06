import db from "../config/db.js";

export const listTeams = (req, res) => {
  db.query("SELECT * FROM teams ORDER BY created_at DESC", (e, rows) =>
    e ? res.status(500).json({ msg: e.message }) : res.json(rows)
  );
};

export const createTeam = (req, res) => {
  const { name, role, email, phone } = req.body;
  if (!name) return res.status(400).json({ msg: "Name required" });
  db.query(
    "INSERT INTO teams (name, role, email, phone) VALUES (?,?,?,?)",
    [name, role, email, phone],
    (e, r) => e ? res.status(500).json({ msg: e.message }) : res.json({ id: r.insertId })
  );
};

export const updateTeam = (req, res) => {
  const { id } = req.params;
  const { name, role, email, phone } = req.body;
  db.query(
    "UPDATE teams SET name=?, role=?, email=?, phone=? WHERE id=?",
    [name, role, email, phone, id],
    (e) => e ? res.status(500).json({ msg: e.message }) : res.json({ msg: "Updated" })
  );
};

export const deleteTeam = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM teams WHERE id=?", [id], (e) =>
    e ? res.status(500).json({ msg: e.message }) : res.json({ msg: "Deleted" })
  );
};
