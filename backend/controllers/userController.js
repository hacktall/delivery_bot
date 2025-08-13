import { pool} from "../db.js";
import bcrypt from "bcrypt";

export async function updateUser(req, res) {
  const { id } = req.params;
  const { name, password } = req.body;

  try {
    const updates = [];
    const values = [];

    if (name) {
      updates.push("name = ?");
      values.push(name);
    }

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.push("password = ?");
      values.push(hashed);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "Nada para atualizar" });
    }

    values.push(id);
    const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    await pool.query(sql, values);

    res.json({ message: "Atualizado com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    res.status(500).json({ error: "Erro interno" });
  }
}
