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
    
    // The secret code requested by the user
    const ADMIN_CODE = "06610";

    if (code === ADMIN_CODE) {
      return res.json({ role: "admin", success: true });
    } else {
      // For any other code, it's a success but role is normal user
      return res.json({ role: "user", success: true });
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
