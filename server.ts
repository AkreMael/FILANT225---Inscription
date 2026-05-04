import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode`);

  app.use(express.json());

  // Request logger
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API Route for admin login
  app.post("/api/admin-login", (req, res) => {
    const { phoneNumber } = req.body;
    console.log(`[ADMIN AUTH] Attempt: Phone=${phoneNumber}`);
    
    const ADMIN_PHONE = "0705052632";
    const cleanPhone = phoneNumber ? phoneNumber.replace("+225", "").trim() : "";

    if (cleanPhone === ADMIN_PHONE) {
      console.log("[ADMIN AUTH] Admin access granted");
      return res.json({ role: "admin", success: true });
    } else {
      console.log("[ADMIN AUTH] Access denied for phone:", cleanPhone);
      return res.status(403).json({ success: false, message: "Numéro administrateur non reconnu." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
