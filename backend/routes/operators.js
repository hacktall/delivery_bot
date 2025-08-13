// routes/app/operators.js
import express from "express";
import bcrypt from "bcrypt";
import { pool } from "../db.js";

const router = express.Router();

// GET   /app/operators?tenant_id=1&q=&limit=20&offset=0
router.get("/", async (req, res) => {
  const { tenant_id, q = "", limit = 50, offset = 0 } = req.query;
  if (!tenant_id) return res.status(400).json({ error: "tenant_id é obrigatório" });

  try {
    const like = `%${q}%`;
    const [rows] = await pool.query(
      `SELECT id, name, email, created_at
       FROM users
       WHERE tenant_id = ? AND role = 'user' AND (name LIKE ? OR email LIKE ?)
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [tenant_id, like, like, parseInt(limit), parseInt(offset)]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM users
       WHERE tenant_id = ? AND role = 'user' AND (name LIKE ? OR email LIKE ?)`,
      [tenant_id, like, like]
    );

    return res.json({ data: rows, total: countRows[0].total });
  } catch (err) {
    console.error("GET /app/operators error:", err);
    return res.status(500).json({ error: "Erro ao buscar operadores" });
  }
});

// POST  /app/operators
router.post("/", async (req, res) => {
  const { tenant_id, name, email, password } = req.body;
  if (!tenant_id || !name || !email || !password) {
    return res.status(400).json({ error: "tenant_id, name, email e password são obrigatórios" });
  }

  // Validações básicas:
  if (name.trim().length < 2) return res.status(400).json({ error: "Nome muito curto" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Email inválido" });
  if (password.length < 6) return res.status(400).json({ error: "Senha deve ter ao menos 6 caracteres" });

  try {
    // Hash da senha
    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (tenant_id, name, email, password, role) 
       VALUES (?, ?, ?, ?, 'user')`,
      [tenant_id, name.trim(), email.trim(), hash]
    );

    const [rows] = await pool.query("SELECT id, name, email, created_at FROM users WHERE id = ?", [
      result.insertId,
    ]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error("POST /app/operators error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Email já cadastrado" });
    }
    return res.status(500).json({ error: "Erro ao criar operador" });
  }
});

// PUT   /app/operators/:id
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { name, email, password } = req.body;

  try {
    // Atualiza somente campos presentes
    const updates = [];
    const params = [];

    if (name) {
      updates.push("name = ?");
      params.push(name.trim());
    }
    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Email inválido" });
      }
      updates.push("email = ?");
      params.push(email.trim());
    }
    if (password) {
      if (password.length < 6) return res.status(400).json({ error: "Senha muito curta" });
      const hash = await bcrypt.hash(password, 10);
      updates.push("password = ?");
      params.push(hash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "Nada para atualizar" });
    }

    params.push(id);
    await pool.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params);

    const [rows] = await pool.query("SELECT id, name, email, created_at FROM users WHERE id = ?", [
      id,
    ]);
    return res.json(rows[0]);
  } catch (err) {
    console.error("PUT /app/operators/:id error:", err);
    return res.status(500).json({ error: "Erro ao atualizar operador" });
  }
});

// DELETE /app/operators/:id
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query("DELETE FROM users WHERE id = ? AND role = 'user'", [id]);
    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE /app/operators/:id error:", err);
    return res.status(500).json({ error: "Erro ao excluir operador" });
  }
});

export default router;
