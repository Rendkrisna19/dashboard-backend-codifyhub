import bcrypt from "bcrypt";

/**
 * Seed admin user if not exists.
 * Default email/pass bisa diambil dari ENV, kalau kosong pakai fallback.
 */
export async function seedAdmin(db) {
  const email = process.env.DEFAULT_ADMIN_EMAIL || "admin@codifyhub.id";
  const name  = process.env.DEFAULT_ADMIN_NAME  || "Admin";
  const pass  = process.env.DEFAULT_ADMIN_PASS  || "admin123";

  // cek apakah tabel users ada (opsional safety)
  await new Promise((resolve) => {
    db.query("SHOW TABLES LIKE 'users'", (e, rows) => {
      if (e) {
        console.error("SeedAdmin: cek tabel users gagal:", e.message);
        return resolve();
      }
      if (!rows || rows.length === 0) {
        console.warn("SeedAdmin: tabel 'users' belum ada. Lewati seeding.");
      }
      resolve();
    });
  });

  // cek user by email
  const exists = await new Promise((resolve) => {
    db.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email], (e, rows) => {
      if (e) {
        console.error("SeedAdmin: cek user gagal:", e.message);
        return resolve(true); // true = anggap ada supaya tidak insert ngawur
      }
      resolve(rows.length > 0);
    });
  });

  if (exists) {
    console.log(`🔐 Admin sudah ada (${email}), skip seeding.`);
    return;
  }

  // hash password & insert
  try {
    const hashed = bcrypt.hashSync(pass, 10);
    await new Promise((resolve) => {
      db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashed],
        (e) => {
          if (e) {
            console.error("SeedAdmin: insert gagal:", e.message);
          } else {
            console.log(`✅ Admin dibuat: ${email} (password: ${pass})`);
          }
          resolve();
        }
      );
    });
  } catch (e) {
    console.error("SeedAdmin: error hashing/insert:", e.message);
  }
}
