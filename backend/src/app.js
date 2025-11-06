import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/db.js";
import { register, login } from "./controllers/authController.js";
import { getSummary } from "./controllers/dashboardController.js";
import { verifyToken } from "./middleware/authMiddleware.js";
import { seedAdmin } from "./utils/seedAdmin.js"; // ⬅️ tambahkan ini
import clientsRoute from "./routes/clients.js";
import teamsRoute from "./routes/teams.js";
import projectsRoute from "./routes/projects.js";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

//clients
app.use("/api/clients", clientsRoute);
//uploads static
app.use("/uploads", express.static("uploads"));
//teams
app.use("/api/teams", teamsRoute);
//project
app.use("/api/projects", projectsRoute);

// ping lalu seed
db.query("SELECT 1", async (err) => {
  if (err) console.error("DB ping error:", err.message);
  else {
    console.log("✅ Database connected");
    await seedAdmin(db); // ⬅️ panggil seeding di sini
  }
});

// routes
app.post("/api/register", register);
app.post("/api/login", login);
app.get("/api/dashboard", verifyToken, getSummary);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
