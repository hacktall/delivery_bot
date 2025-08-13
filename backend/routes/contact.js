// routes/app/contacts.js
import express from "express";
import { pool } from "../db.js"; // ajuste caminho se necessário

const router = express.Router();

// pequena validação de telefone/email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d+\s()-]{6,20}$/;

// GET /app/contacts?tenant_id=1&q=nome&limit=20&offset=0
router.get("/", async (req, res) => {
  const tenant_id = req.query.tenant_id;
  const q = (req.query.q || "").trim();
  const limit = parseInt(req.query.limit || "50", 10);
  const offset = parseInt(req.query.offset || "0", 10);

  if (!tenant_id) return res.status(400).json({ error: "tenant_id é obrigatório" });

  try {
    let sql = `SELECT id, tenant_id, name, email, phone, notes, created_at, last_message_at
               FROM contacts WHERE tenant_id = ?`;
    const params = [tenant_id];

    if (q) {
      sql += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR notes LIKE ?)`;
      const like = `%${q}%`;
      params.push(like, like, like, like);
    }

    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);

    // total count
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM contacts WHERE tenant_id = ? ${q ? "AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR notes LIKE ?)" : ""}`,
      q ? [tenant_id, `%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`] : [tenant_id]
    );
    const total = countRows[0].total || 0;

    res.json({ data: rows, total });
  } catch (err) {
    console.error("GET /app/contacts error:", err);
    res.status(500).json({ error: "Erro ao buscar contatos" });
  }
});

// GET single
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.query("SELECT * FROM contacts WHERE id = ?", [id]);
    if (!rows[0]) return res.status(404).json({ error: "Contato não encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error("GET /app/contacts/:id error:", err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// POST create
router.post("/", async (req, res) => {
  const { tenant_id, name, email = null, phone = null, notes = null } = req.body;

  if (!tenant_id) return res.status(400).json({ error: "tenant_id é obrigatório" });
  if (!name || name.trim().length < 2) return res.status(400).json({ error: "Nome inválido" });
  if (email && !emailRegex.test(email)) return res.status(400).json({ error: "Email inválido" });
  if (phone && !phoneRegex.test(phone)) return res.status(400).json({ error: "Telefone inválido" });

  try {
    const [result] = await pool.query(
      "INSERT INTO contacts (tenant_id, name, email, phone, notes) VALUES (?, ?, ?, ?, ?)",
      [tenant_id, name.trim(), email || null, phone || null, notes || null]
    );
    const insertId = result.insertId;
    const [rows] = await pool.query("SELECT * FROM contacts WHERE id = ?", [insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("POST /app/contacts error:", err);
    res.status(500).json({ error: "Erro ao criar contato" });
  }
});

// PUT update
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { name, email = null, phone = null, notes = null } = req.body;

  if (name && name.trim().length < 2) return res.status(400).json({ error: "Nome inválido" });
  if (email && !emailRegex.test(email)) return res.status(400).json({ error: "Email inválido" });
  if (phone && !phoneRegex.test(phone)) return res.status(400).json({ error: "Telefone inválido" });

  try {
    await pool.query(
      "UPDATE contacts SET name = COALESCE(?, name), email = COALESCE(?, email), phone = COALESCE(?, phone), notes = COALESCE(?, notes) WHERE id = ?",
      [name, email, phone, notes, id]
    );
    const [rows] = await pool.query("SELECT * FROM contacts WHERE id = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error("PUT /app/contacts/:id error:", err);
    res.status(500).json({ error: "Erro ao atualizar contato" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query("DELETE FROM contacts WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /app/contacts/:id error:", err);
    res.status(500).json({ error: "Erro ao excluir contato" });
  }
});

export default router;
