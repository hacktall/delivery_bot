import express from "express";
import { sendWhatsAppMessage } from "../services/whatsappCloud.js";
import { pool } from "../db.js";

const router = express.Router();

router.post("/send", async (req, res) => {
  const { phone, message, user_id, tenant_id, replied_to } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });
  }

  try {
    await sendWhatsAppMessage(phone, message);

    await pool.query(
      "INSERT INTO messages (user_id, client_name, client_phone, message, received_at, tenant_id, replied_to) VALUES (?, ?, ?, ?, NOW(), ?, ?)",
      [user_id, "", phone, message, tenant_id, replied_to || null]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

export default router;
