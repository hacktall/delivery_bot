import { pool} from "../db.js";

export async function getAdminStats(req, res) {
  const tenant_id = req.query.tenant_id;

  if (!tenant_id) {
    return res.status(400).json({ error: "tenant_id é obrigatório" });
  }

  try {
    const [[{ totalMessages }]] = await pool.query(
      `SELECT COUNT(*) AS totalMessages FROM messages WHERE tenant_id = ?`,
      [tenant_id]
    );

    const [[{ totalUsers }]] = await pool.query(
      `SELECT COUNT(*) AS totalUsers FROM users WHERE tenant_id = ? AND role = 'user'`,
      [tenant_id]
    );

    const [[{ totalContacts }]] = await pool.query(
      `SELECT COUNT(*) AS totalContacts FROM contacts WHERE tenant_id = ?`,
      [tenant_id]
    );

    const [[{ totalTickets }]] = await pool.query(
      `SELECT COUNT(*) AS totalTickets FROM tickets WHERE tenant_id = ?`,
      [tenant_id]
    );

    res.json({ totalMessages, totalUsers, totalContacts, totalTickets });
  } catch (err) {
    console.error("Erro ao buscar estatísticas do admin:", err);
    res.status(500).json({ error: "Erro interno" });
  }
}
