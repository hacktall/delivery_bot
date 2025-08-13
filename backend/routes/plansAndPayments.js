// routes/app/plansAndPayments.js
import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/**
 * GET /app/plans
 * → lista todos os planos disponíveis
 */
router.get("/plans", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, slug, name, price, features FROM plans");
    return res.json(rows);
  } catch (err) {
    console.error("GET /app/plans error:", err);
    return res.status(500).json({ error: "Erro ao buscar planos" });
  }
});

/**
 * GET /app/plan/current?tenant_id=1
 * → retorna o plano atual do tenant
 */
router.get("/plan/current", async (req, res) => {
  const { tenant_id } = req.query;
  if (!tenant_id) return res.status(400).json({ error: "tenant_id é obrigatório" });

  try {
    const [[tenantRow]] = await pool.query(
     "SELECT plan_id FROM tenants WHERE id = ? AND active = 1",
     [tenant_id]
   );
   // se não achar tenant ou plan_id nulo
   if (!tenantRow || !tenantRow.plan_id) {
     return res.json(null);
   }
   // busca os detalhes do plano
   const [[plan]] = await pool.query(
     "SELECT id, slug, name, price, features FROM plans WHERE id = ?",
     [tenantRow.plan_id]
   );
return res.json(plan || null);
  } catch (err) {
    console.error("GET /app/plan/current error:", err);
    return res.status(500).json({ error: "Erro ao buscar plano atual" });
  }
});

/**
 * POST /app/plan/change
 * → muda o plano do tenant e gera uma fatura pendente
 */
router.post("/plan/change", async (req, res) => {
  const { tenant_id, plan_id } = req.body;
  if (!tenant_id || !plan_id) {
    return res.status(400).json({ error: "tenant_id e plan_id são obrigatórios" });
  }

  try {
    // atualiza plano
    await pool.query("UPDATE tenants SET plan_id = ? WHERE id = ?", [plan_id, tenant_id]);
    // busca preço para gerar fatura
    const [[{ price }]] = await pool.query(
      "SELECT price FROM plans WHERE id = ?",
      [plan_id]
    );
    // insere fatura
    const [inv] = await pool.query(
      "INSERT INTO invoices (tenant_id, plan_id, amount) VALUES (?, ?, ?)",
      [tenant_id, plan_id, price]
    );
    return res.json({ success: true, invoice_id: inv.insertId });
  } catch (err) {
    console.error("POST /app/plan/change error:", err);
    return res.status(500).json({ error: "Erro ao alterar plano" });
  }
});

/**
 * GET /app/invoices?tenant_id=1
 * → lista faturas do tenant
 */
router.get("/invoices", async (req, res) => {
  const { tenant_id } = req.query;
  if (!tenant_id) return res.status(400).json({ error: "tenant_id é obrigatório" });

  try {
    const [rows] = await pool.query(
      `SELECT i.id, i.amount, i.status, i.issued_at, i.paid_at, p.name AS plan_name
       FROM invoices i
       JOIN plans p ON p.id = i.plan_id
       WHERE i.tenant_id = ?
       ORDER BY i.issued_at DESC`,
      [tenant_id]
    );
    return res.json(rows);
  } catch (err) {
    console.error("GET /app/invoices error:", err);
    return res.status(500).json({ error: "Erro ao buscar faturas" });
  }
});

export default router;
