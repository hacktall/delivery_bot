// routes/adminAnalytics.js
import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/analytics", async (req, res) => {
  const tenant_id = req.query.tenant_id;
  if (!tenant_id) {
    return res.status(400).json({ error: "tenant_id é obrigatório" });
  }

  try {
    // 📈 Mensagens por semana
    const [messagesPerWeek] = await pool.query(
      `SELECT 
         WEEK(received_at, 1) AS semana,
         COUNT(*) AS total
       FROM messages
       WHERE tenant_id = ?
       GROUP BY semana
       ORDER BY semana DESC
       LIMIT 6`,
      [tenant_id]
    );

    // 👤 Operadores registrados por semana
    const [usersPerWeek] = await pool.query(
      `SELECT 
         WEEK(created_at, 1) AS semana,
         COUNT(*) AS total
       FROM users
       WHERE tenant_id = ? AND role = 'user'
       GROUP BY semana
       ORDER BY semana DESC
       LIMIT 6`,
      [tenant_id]
    );

    // 🧩 Quantidade por papel (user, admin, superadmin)
    const [userRoles] = await pool.query(
      `SELECT role, COUNT(*) AS total
       FROM users
       WHERE tenant_id = ?
       GROUP BY role`,
      [tenant_id]
    );

    res.json({ messagesPerWeek, usersPerWeek, userRoles });
  } catch (err) {
    console.error("Erro ao buscar analytics:", err);
    res.status(500).json({ error: "Erro interno ao buscar dados" });
  }
});

export default router;
