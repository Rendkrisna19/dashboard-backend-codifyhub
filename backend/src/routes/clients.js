import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  listClients, getClient, createClient, updateClient, deleteClient,
  addNote, updateNote, deleteNote, updatePaymentStatus
} from "../controllers/clientsController.js";

const r = Router();

r.get("/", verifyToken, listClients);
r.get("/:id", verifyToken, getClient);
r.post("/", verifyToken, createClient);
r.put("/:id", verifyToken, updateClient);
r.delete("/:id", verifyToken, deleteClient);

r.put("/:id/payment", verifyToken, updatePaymentStatus);

r.post("/:id/notes", verifyToken, addNote);
r.put("/notes/:noteId", verifyToken, updateNote);
r.delete("/notes/:noteId", verifyToken, deleteNote);

export default r;
