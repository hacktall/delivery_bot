// controllers/logController.js
import { pool } from '../db.js';

export async function logAction(email, acao) {
  try {
    await pool.query(
      'INSERT INTO logs (user_email, acao) VALUES (?, ?)',
      [email, acao]
    );
  } catch (err) {
    console.error("Erro ao registrar log:", err);
  }
}
