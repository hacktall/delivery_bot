// routes/app/bot.js
import express from "express";
import { pool } from "../db.js"; // se não usa MySQL, pode manter dummy data

const router = express.Router();

// GET status + qrToken (fetches from DB or in-memory store)
router.get("/status", async (req, res) => {
  const { tenant_id } = req.query;
  if (!tenant_id) return res.status(400).json({ error: "tenant_id obrigatório" });

  try {
    // Aqui você buscaria no DB ou cache o status real.
    // Para exemplo, retornamos dados fictícios:
    res.json({
      connected: false,
      lastSeen: null,
      qrToken: "data:image/png;base64,iVBORw0G…", // base64 do QR
    });
  } catch (err) {
    console.error("GET /app/bot/status error:", err);
    res.status(500).json({ error: "Erro ao obter status do bot" });
  }
});

// POST /status/reconnect — força reconexão
router.post("/status/reconnect", async (req, res) => {
  const { tenant_id } = req.body;
  if (!tenant_id) return res.status(400).json({ error: "tenant_id obrigatório" });

  try {
    // Lógica para reconectar o bot (reset token, etc).
    // Aqui apenas simulamos:
    console.log(`Reconectando bot do tenant ${tenant_id}`);
    res.json({ success: true, message: "Reconexão iniciada" });
  } catch (err) {
    console.error("POST /app/bot/status/reconnect error:", err);
    res.status(500).json({ error: "Erro ao reconectar bot" });
  }
});

export default router;
