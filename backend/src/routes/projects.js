import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  listProjects, getProject, createProject, updateProject, deleteProject,
  setProjectTeams, uploadFile
} from "../controllers/projectsController.js";

const r = Router();

/* multer setup */
const dir = "uploads";
if (!fs.existsSync(dir)) fs.mkdirSync(dir);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

r.get("/", verifyToken, listProjects);
r.get("/:id", verifyToken, getProject);
r.post("/", verifyToken, createProject);
r.put("/:id", verifyToken, updateProject);
r.delete("/:id", verifyToken, deleteProject);

r.put("/:id/team", verifyToken, setProjectTeams);

r.post("/:id/files", verifyToken, upload.single("file"), uploadFile);

export default r;
