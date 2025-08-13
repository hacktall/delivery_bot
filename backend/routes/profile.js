import express from "express";
import multer from "multer";
import path from "path";
import { pool } from "../db.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

router.post("/upload/:userId", upload.single("avatar"), async (req, res) => {
  const { userId } = req.params;
  const filePath = req.file.filename;

  try {
    await pool.query("UPDATE users SET profile_picture = ? WHERE id = ?", [
      filePath,
      userId,
    ]);
    res.json({ message: "Imagem atualizada", filePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar imagem" });
  }
});

router.get("/img/:filename", (req, res) => {
  const { filename } = req.params;
  res.sendFile(path.resolve("uploads", filename));
});

export default router;
