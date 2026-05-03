import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for code verification
  app.post("/api/verify-code", (req, res) => {
    const { code } = req.body;
    console.log(`Verifying code: ${code}`);
    
    // The secret code requested by the user
    // Supporting both the old one and the new one requested (12345)
    const ADMIN_CODES = ["06610", "12345"];

    if (ADMIN_CODES.includes(code)) {
      console.log("Admin code detected");
      return res.json({ role: "admin", success: true });
    } else if (code && code.length === 5) {
      console.log("User code accepted");
      return res.json({ role: "user", success: true });
    } else {
      console.log("Invalid code format");
      return res.status(400).json({ success: false, message: "Code invalide" });
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
