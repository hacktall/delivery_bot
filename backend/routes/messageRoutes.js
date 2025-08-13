import express from "express";
import { getMessages, getMessageHistory } from "../controllers/messageController.js";
import { pool } from "../db.js";

const router = express.Router();

router.get("/", getMessages);
router.get("/history", getMessageHistory);


router.get("/", async (req, res) => {
  const { tenant_id } = req.query;
  if (!tenant_id) return res.status(400).json({ error: "tenant_id é obrigatório" });

  try {
    const [rows] = await pool.query(
      `SELECT * FROM messages WHERE tenant_id = ? ORDER BY received_at DESC`,
      [tenant_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /api/messages error:", err);
    res.status(500).json({ error: "Erro ao buscar mensagens" });
  }
});


router.post("/reply", async (req, res) => {
  const { messageId, user_id, tenant_id, message } = req.body;
  if (!messageId || !user_id || !tenant_id || !message) {
    return res.status(400).json({ error: "messageId, user_id, tenant_id e message são obrigatórios" });
  }
  try {
    const [result] = await pool.query(
      `INSERT INTO messages (user_id, client_name, client_phone, message, received_at, tenant_id, replied_to)
       VALUES (?, NULL, NULL, ?, NOW(), ?, ?)`,
      [user_id, message, tenant_id, messageId]
    );
    res.status(201).json({ id: result.insertId, message, replied_to: messageId });
  } catch (err) {
    console.error("POST /api/messages/reply error:", err);
    res.status(500).json({ error: "Erro ao enviar resposta" });
  }
});







export default router;
