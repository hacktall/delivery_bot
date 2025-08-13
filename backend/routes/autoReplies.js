// routes/app/autoReplies.js
import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// GET all for tenant
router.get("/", async (req, res) => {
  const { tenant_id } = req.query;
  if (!tenant_id) return res.status(400).json({ error: "tenant_id é obrigatório" });

  try {
    const [rows] = await pool.query(
      "SELECT * FROM auto_replies WHERE tenant_id = ? ORDER BY created_at DESC",
      [tenant_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("GET /app/auto-replies error:", err);
    res.status(500).json({ error: "Erro ao buscar respostas automáticas" });
  }
});

// POST create
router.post("/", async (req, res) => {
  const { tenant_id, keyword, response } = req.body;
  if (!tenant_id || !keyword || !response) {
    return res.status(400).json({ error: "tenant_id, keyword e response são obrigatórios" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO auto_replies (tenant_id, keyword, response) VALUES (?, ?, ?)",
      [tenant_id, keyword.trim(), response.trim()]
    );
    const [rows] = await pool.query("SELECT * FROM auto_replies WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("POST /app/auto-replies error:", err);
    res.status(500).json({ error: "Erro ao criar resposta automática" });
  }
});

// PUT update
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { keyword, response, active } = req.body;
  const updates = [];
  const params = [];

  if (keyword !== undefined) {
    updates.push("keyword = ?");
    params.push(keyword.trim());
  }
  if (response !== undefined) {
    updates.push("response = ?");
    params.push(response.trim());
  }
  if (active !== undefined) {
    updates.push("active = ?");
    params.push(active ? 1 : 0);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "Nada para atualizar" });
  }

  params.push(id);

  try {
    await pool.query(`UPDATE auto_replies SET ${updates.join(", ")} WHERE id = ?`, params);
    const [rows] = await pool.query("SELECT * FROM auto_replies WHERE id = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error("PUT /app/auto-replies/:id error:", err);
    res.status(500).json({ error: "Erro ao atualizar resposta automática" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query("DELETE FROM auto_replies WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /app/auto-replies/:id error:", err);
    res.status(500).json({ error: "Erro ao excluir resposta automática" });
  }
});

export default router;
