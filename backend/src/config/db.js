import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const normalize = (v) => {
  if (v === undefined || v === null) return undefined;
  const t = String(v).trim();
  return t === "" ? undefined : t;
};

const db = mysql.createConnection({
  host: normalize(process.env.DB_HOST) || "localhost",
  user: normalize(process.env.DB_USER) || "root",
  // jika kosong/spasi -> undefined (driver tidak kirim password)
  password: normalize(process.env.DB_PASS),
  database: normalize(process.env.DB_NAME) || "db_usaha",
});

db.connect((err) => {
  if (err) console.error("DB Error:", err.message);
  else console.log("✅ Database connected");
});

export default db;
