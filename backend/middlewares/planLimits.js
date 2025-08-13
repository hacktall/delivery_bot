import { pool } from "../db.js";

export async function checkPlanLimits(req, res, next) {
  const { tenantId } = req.user || {}; // ou admin logado

  if (!tenantId) return res.status(403).json({ error: "Tenant não identificado" });

  try {
    const [rows] = await pool.query(
      `SELECT p.* FROM tenants t 
       JOIN plans p ON t.plan_id = p.id 
       WHERE t.id = ?`,
      [tenantId]
    );

    if (rows.length === 0) return res.status(404).json({ error: "Plano não encontrado" });

    req.plan = rows[0];
    next();
  } catch (err) {
    console.error("Erro ao verificar plano:", err);
    res.status(500).json({ error: "Erro interno ao validar plano" });
  }
}
