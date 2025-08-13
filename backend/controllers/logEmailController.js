import { pool } from "../db.js";
import nodemailer from "nodemailer";
import { format } from "date-fns";
import fs from "fs";
import path from "path";

export async function sendLogsByEmail(req, res) {
  const { to, formato = "txt" } = req.body;

  try {
    const [logs] = await pool.query("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100");

    const lines = logs.map((log) => {
      const data = format(new Date(log.timestamp), "dd/MM/yyyy HH:mm");
      return `[${data}] ${log.user_email} → ${log.acao}`;
    });

    const filename = `logs_${Date.now()}.${formato}`;
    const filePath = path.join("/tmp", filename);
    const fileContent =
      formato === "json"
        ? JSON.stringify(logs, null, 2)
        : formato === "csv"
        ? ["ID,Email,Ação,Data"].concat(
            logs.map((l) =>
              [l.id, l.user_email, l.acao, format(new Date(l.timestamp), "dd/MM/yyyy HH:mm")].join(",")
            )
          ).join("\n")
        : lines.join("\n");

    fs.writeFileSync(filePath, fileContent);

    const transporter = nodemailer.createTransport({
      service: "gmail", // ou smtp personalizado
      auth: {
        user: "seuemail@gmail.com",
        pass: "senha_do_app_ou_token",
      },
    });

    await transporter.sendMail({
      from: '"Sistema de Logs" <seuemail@gmail.com>',
      to,
      subject: "Relatório de Logs",
      text: "Segue em anexo o relatório de logs recente.",
      attachments: [
        {
          filename,
          path: filePath,
        },
      ],
    });

    fs.unlinkSync(filePath);

    res.json({ message: "Logs enviados com sucesso para " + to });
  } catch (err) {
    console.error("Erro ao enviar logs:", err);
    res.status(500).json({ error: "Erro ao enviar logs por e-mail" });
  }
}
