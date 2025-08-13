import express from "express";
import { pool } from "../db.js";
const router = express.Router();

router.get("/", async (req, res) => {
  const { tenant_id } = req.query;
  if (!tenant_id) return res.status(400).json({ error: "tenant_id obrigatório" });

  try {
    const [rows] = await pool.query("SELECT * FROM bot_settings WHERE tenant_id = ?", [tenant_id]);
    return res.json(rows[0] || {});
  } catch (err) {
    console.error("GET /app/bot-settings error:", err);
    return res.status(500).json({ error: "Erro interno ao buscar configurações" });
  }
});

// POST - criar ou atualizar configurações do tenant
router.post("/", async (req, res) => {
  const {
    tenant_id,
    welcome_message = "",
    default_response = "",
    active_hours = "",
    enable_auto_reply = true,
    webhook_url = "",
  } = req.body;

  // Validações básicas
  if (!tenant_id) return res.status(400).json({ error: "tenant_id obrigatório" });
  if (typeof enable_auto_reply !== "boolean" && enable_auto_reply !== 0 && enable_auto_reply !== 1) {
    return res.status(400).json({ error: "enable_auto_reply deve ser boolean" });
  }
  if (!welcome_message || !default_response || !active_hours) {
    return res.status(400).json({ error: "Preencha welcome_message, default_response e active_hours" });
  }

  // validação simples de formato de horário (ex: 08:00 - 18:00)
  if (!/^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$/.test(active_hours)) {
    return res.status(400).json({ error: "active_hours deve ter formato 'HH:MM - HH:MM'" });
  }

  try {
    const [existing] = await pool.query("SELECT id FROM bot_settings WHERE tenant_id = ?", [tenant_id]);
    if (existing.length > 0) {
      await pool.query(
        `UPDATE bot_settings
         SET welcome_message=?, default_response=?, active_hours=?, enable_auto_reply=?, webhook_url=?, updated_at = CURRENT_TIMESTAMP
         WHERE tenant_id = ?`,
        [welcome_message, default_response, active_hours, enable_auto_reply ? 1 : 0, webhook_url, tenant_id]
      );
    } else {
      await pool.query(
        `INSERT INTO bot_settings (tenant_id, welcome_message, default_response, active_hours, enable_auto_reply, webhook_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [tenant_id, welcome_message, default_response, active_hours, enable_auto_reply ? 1 : 0, webhook_url]
      );
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("POST /app/bot-settings error:", err);
    return res.status(500).json({ error: "Erro interno ao salvar configurações" });
  }
});

export default router;