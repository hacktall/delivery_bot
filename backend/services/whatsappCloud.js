import axios from "axios";
import dotenv from 'dotenv';

dotenv.config({path:'../settings/.env'});

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

export async function sendWhatsAppMessage(to, text) {
  try {
    const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;
    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    };

    const res = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Mensagem enviada:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Erro ao enviar mensagem:", err.response?.data || err);
    throw err;
  }
}
