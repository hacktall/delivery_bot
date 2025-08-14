// server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import ticketRoutes from './routes/tickets1.js';
import authRoutes from './routes/auth.js';
import logsRoutes from './routes/logs.js';
import profileRoutes from "./routes/profile.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import path from "path";
import adminStatsRoutes from "./routes/adminStatsRoutes.js";
import adminAnalyticsRoutes from "./routes/adminAnalytics.js";
import ticketRoutes1 from "./routes/tickets.js";
import botSettingsRoutes from './routes/botSettings.js';
import contactsRoutes from "./routes/contact.js";
import botRoutes from "./routes/bot.js";
import operatorsRoutes from "./routes/operators.js";
import autoRepliesRoutes from "./routes/autoReplies.js";
import plansAndPaymentsRoutes from "./routes/plansAndPayments.js";
import webhookWhatsApp from "./routes/webhookWhatsApp.js";
import whatsappSend from "./routes/whatsappCloudSend.js";






const app = express();

app.use(cors({ origin: ['https://zapbot.com.br'], credentials: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/webhooks/whatsapp",webhookWhatsApp);
app.use("/api/whatsapp",whatsappSend);
app.use("/app", plansAndPaymentsRoutes);
app.use("/app/auto-replies", autoRepliesRoutes);
app.use("/app/operators", operatorsRoutes);
app.use("/app/bot", botRoutes);
app.use("/app/contacts", contactsRoutes);
app.use("/app/bot-settings", botSettingsRoutes);
app.use("/app/tickets",ticketRoutes1);
app.use("/api/adm", adminAnalyticsRoutes);
app.use("/api/admin", adminStatsRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/profile", profileRoutes);
app.use("/uploads", express.static(path.resolve("uploads")));
app.use('/api/logs', logsRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/auth', authRoutes);


const PORT = 3000;


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
