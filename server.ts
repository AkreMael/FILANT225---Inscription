import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for code verification
  app.post("/api/verify-code", (req, res) => {
    const { code, phoneNumber } = req.body;
    console.log(`Verifying: Phone=${phoneNumber}, Code=${code}`);
    
    // The secret code and phone requested by the user for admin
    const ADMIN_PHONE = "0705052632";
    const ADMIN_CODE = "06610";

    // Clean phone number for comparison (remove prefix if present)
    const cleanPhone = phoneNumber ? phoneNumber.replace("+225", "").trim() : "";

    if (cleanPhone === ADMIN_PHONE && code === ADMIN_CODE) {
      console.log("Admin login detected");
      return res.json({ role: "admin", success: true });
    } else if (cleanPhone.length === 10 && code && code.length === 5) {
      console.log("User login accepted");
      return res.json({ role: "user", success: true });
    } else {
      console.log("Invalid credentials format or values");
      if (cleanPhone.length !== 10) {
        return res.status(400).json({ success: false, message: "Le numéro doit comporter 10 chiffres (Côte d'Ivoire)." });
      }
      return res.status(400).json({ success: false, message: "Informations invalides." });
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
