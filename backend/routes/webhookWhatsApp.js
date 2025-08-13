import express from "express";
import { pool } from "../db.js";
import dotenv from 'dotenv';

dotenv.config({path:'../settings/.env'});

const router = express.Router();

// Verificação do webhook
router.get("/", (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN||"fullfight";
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verificado com sucesso!");
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// Recebimento de mensagens
router.post("/", async (req, res) => {
  const body = req.body;

  if (body.object) {
    try {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0]?.value;
      const message = change?.messages?.[0];

      if (message && message.type === "text") {
        const phone = message.from;
        const text = message.text.body;
        const name = change.contacts?.[0]?.profile?.name || "";

        console.log(`📩 Mensagem recebida de ${phone}: ${text}`);

        await pool.query(
          "INSERT INTO messages (user_id, client_name, client_phone, message, received_at, tenant_id, replied_to) VALUES (?, ?, ?, ?, NOW(), ?, NULL)",
          [null, name, phone, text, 1]
        );
      }
    } catch (err) {
      console.error("Erro ao processar mensagem:", err);
    }
    return res.sendStatus(200);
  }
  res.sendStatus(404);
});

export default router;
