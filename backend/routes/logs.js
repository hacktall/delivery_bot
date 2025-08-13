// routes/logs.js
import express from "express";
import { pool } from "../db.js";
import { sendLogsByEmail } from "../controllers/logEmailController.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { email, acao, inicio, fim } = req.query;
    let query = "SELECT * FROM logs WHERE 1=1";
    const values = [];

    if (email) {
      query += " AND user_email LIKE ?";
      values.push(`%${email}%`);
    }

    if (acao) {
      query += " AND acao LIKE ?";
      values.push(`%${acao}%`);
    }

    if (inicio) {
      query += " AND timestamp >= ?";
      values.push(inicio);
    }

    if (fim) {
      query += " AND timestamp <= ?";
      values.push(fim);
    }

    query += " ORDER BY timestamp DESC LIMIT 200";

    const [rows] = await pool.query(query, values);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar logs:", err);
    res.status(500).json({ error: "Erro ao buscar logs" });
  }
});
router.post("/send", sendLogsByEmail);
export default router;
