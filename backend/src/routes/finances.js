import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  listFinances, createFinance, updateFinance, deleteFinance,
  monthlySummary, exportCSV, exportPDF
} from "../controllers/financesController.js";

const r = Router();

r.get("/", verifyToken, listFinances);
r.post("/", verifyToken, createFinance);
r.put("/:id", verifyToken, updateFinance);
r.delete("/:id", verifyToken, deleteFinance);

r.get("/summary", verifyToken, monthlySummary);

r.get("/export.csv", verifyToken, exportCSV);
r.get("/export.pdf", verifyToken, exportPDF);

export default r;
