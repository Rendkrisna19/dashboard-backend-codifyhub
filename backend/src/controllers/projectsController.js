import db from "../config/db.js";
import path from "path";
import fs from "fs";

export const listProjects = (req, res) => {
  const sql = `
    SELECT p.*, c.name AS client_name,
      (SELECT COUNT(*) FROM project_team pt WHERE pt.project_id = p.id) AS team_count
    FROM projects p
    LEFT JOIN clients c ON c.id = p.client_id
    ORDER BY p.id DESC`;
  db.query(sql, (e, rows) => e ? res.status(500).json({ msg: e.message }) : res.json(rows));
};

export const getProject = (req, res) => {
  const { id } = req.params;
  const q1 = `SELECT p.*, c.name AS client_name FROM projects p LEFT JOIN clients c ON c.id=p.client_id WHERE p.id=?`;
  const q2 = `SELECT t.* FROM project_team pt JOIN teams t ON t.id=pt.team_id WHERE pt.project_id=?`;
  const q3 = `SELECT * FROM project_files WHERE project_id=? ORDER BY uploaded_at DESC`;

  db.query(q1, [id], (e1, r1) => {
    if (e1) return res.status(500).json({ msg: e1.message });
    if (!r1.length) return res.status(404).json({ msg: "Not found" });
    db.query(q2, [id], (e2, team) => {
      if (e2) return res.status(500).json({ msg: e2.message });
      db.query(q3, [id], (e3, files) => {
        if (e3) return res.status(500).json({ msg: e3.message });
        res.json({ project: r1[0], team, files });
      });
    });
  });
};

export const createProject = (req, res) => {
  const { client_id, name, website_type, deadline, price, status, estimate_hours, actual_hours } = req.body;
  if (!client_id || !name) return res.status(400).json({ msg: "client_id & name required" });

  const sql = `INSERT INTO projects (client_id, name, website_type, deadline, price, status, estimate_hours, actual_hours)
               VALUES(?,?,?,?,?,?,?,?)`;
  db.query(sql, [client_id, name, website_type || null, deadline || null, price || 0, status || 'planning', estimate_hours || null, actual_hours || 0],
    (e, r) => e ? res.status(500).json({ msg: e.message }) : res.json({ id: r.insertId })
  );
};

export const updateProject = (req, res) => {
  const { id } = req.params;
  const { client_id, name, website_type, deadline, price, status, estimate_hours, actual_hours } = req.body;
  const sql = `UPDATE projects SET client_id=?, name=?, website_type=?, deadline=?, price=?, status=?, estimate_hours=?, actual_hours=? WHERE id=?`;
  db.query(sql, [client_id, name, website_type || null, deadline || null, price || 0, status, estimate_hours || null, actual_hours || 0, id],
    (e) => e ? res.status(500).json({ msg: e.message }) : res.json({ msg: "Updated" })
  );
};

export const deleteProject = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM projects WHERE id=?", [id], (e) =>
    e ? res.status(500).json({ msg: e.message }) : res.json({ msg: "Deleted" })
  );
};

export const setProjectTeams = (req, res) => {
  const { id } = req.params;
  const { team_ids } = req.body; // array of team id
  if (!Array.isArray(team_ids)) return res.status(400).json({ msg: "team_ids must be array" });

  db.query("DELETE FROM project_team WHERE project_id=?", [id], (e) => {
    if (e) return res.status(500).json({ msg: e.message });
    if (team_ids.length === 0) return res.json({ msg: "Updated team assignment" });

    const values = team_ids.map(tid => [id, tid]);
    db.query("INSERT INTO project_team (project_id, team_id) VALUES ?", [values], (e2) =>
      e2 ? res.status(500).json({ msg: e2.message }) : res.json({ msg: "Updated team assignment" })
    );
  });
};

export const uploadFile = (req, res) => {
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ msg: "No file" });
  const { originalname, filename, mimetype, size } = req.file;

  db.query(
    "INSERT INTO project_files (project_id, original_name, filename, mime, size) VALUES (?,?,?,?,?)",
    [id, originalname, filename, mimetype, size],
    (e, r) => e ? res.status(500).json({ msg: e.message }) :
      res.json({ id: r.insertId, url: `/uploads/${filename}` })
  );
};
