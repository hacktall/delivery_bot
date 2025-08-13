import {pool} from "../db.js";

export async function getMessages(req, res) {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "userId é obrigatório" });

  try {
    const [rows] = await pool.query(
      "SELECT * FROM messages WHERE user_id = ? ORDER BY received_at DESC",
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar mensagens:", err);
    res.status(500).json({ error: "Erro interno" });
  }
}

export async function getMessageHistory(req, res) {
  const { userId, cliente, data } = req.query;
  let query = "SELECT * FROM messages WHERE user_id = ?";
  const params = [userId];

  if (cliente) {
    query += " AND client_name LIKE ?";
    params.push(`%${cliente}%`);
  }

  if (data) {
    query += " AND DATE(received_at) = ?";
    params.push(data);
  }

  query += " ORDER BY received_at DESC";

  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar histórico:", err);
    res.status(500).json({ error: "Erro interno" });
  }
}
