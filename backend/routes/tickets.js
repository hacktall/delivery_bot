// routes/tickets.js
import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// Criar novo ticket
router.post('/', async (req, res) => {
  const { title, message, user_id, tenant_id } = req.body;

  if (!title || !message || !user_id || !tenant_id) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }

  try {
    await pool.query(
      'INSERT INTO tickets (title, message, user_id, tenant_id) VALUES (?, ?, ?, ?)',
      [title, message, user_id, tenant_id]
    );
    res.status(201).json({ success: true, message: 'Ticket criado com sucesso.' });
  } catch (err) {
    console.error('Erro ao criar ticket:', err);
    res.status(500).json({ error: 'Erro ao criar ticket.' });
  }
});

// Listar tickets por tenant_id
router.get("/", async (req, res) => {
  const { tenant_id } = req.query;

  if (!tenant_id) {
    return res.status(400).json({ error: "tenant_id é obrigatório" });
  }

  try {
    const [rows] = await pool.query(`
      SELECT t.id, t.title, t.message, t.status, t.criado_em, u.name AS user_name
      FROM tickets t
      JOIN users u ON t.user_id = u.id
      WHERE t.tenant_id = ?
      ORDER BY t.criado_em DESC
    `, [tenant_id]);

    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar tickets:", err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Atualizar status do ticket
// PATCH - Atualizar status
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["aberto", "em_andamento", "resolvido"].includes(status)) {
    return res.status(400).json({ error: "Status inválido" });
  }

  try {
    await pool.query(
      "UPDATE tickets SET status = ? WHERE id = ?",
      [status, id]
    );
    res.json({ message: "Status atualizado com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar status:", err);
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
