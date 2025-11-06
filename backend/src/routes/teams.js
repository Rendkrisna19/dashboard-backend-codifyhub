import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { listTeams, createTeam, updateTeam, deleteTeam } from "../controllers/teamsController.js";

const r = Router();
r.get("/", verifyToken, listTeams);
r.post("/", verifyToken, createTeam);
r.put("/:id", verifyToken, updateTeam);
r.delete("/:id", verifyToken, deleteTeam);
export default r;
