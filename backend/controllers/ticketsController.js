// controllers/ticketsController.js
import { pool } from '../db.js';

export const getAllTickets = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tickets');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar tickets' });
  }
};

export const getTicketById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Ticket não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar ticket' });
  }
};

export const createTicket = async (req, res) => {
  const { titulo, descricao, status = 'aberto' } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO tickets (titulo, descricao, status) VALUES (?, ?, ?)',
      [titulo, descricao, status]
    );
    res.status(201).json({ id: result.insertId, titulo, descricao, status });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar ticket' });
  }
};

export const updateTicketStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const [result] = await pool.query('UPDATE tickets SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Ticket não encontrado' });
    res.json({ id, status });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar status do ticket' });
  }
};

export const deleteTicket = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM tickets WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Ticket não encontrado' });
    res.json({ message: 'Ticket deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar ticket' });
  }
};
