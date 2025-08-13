/*








// routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.js';
import { logAction } from '../controllers/logController.js';

const router = express.Router();

// REGISTRO
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  // Adicione isso à sua rota de register
const role = req.body.role || 'user';

  try {
    const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length > 0) return res.status(400).json({ error: 'Email já cadastrado' });

    const hash = await bcrypt.hash(password, 10);
    
    await pool.query(
  'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
  [name, email, hash, role]
);

    
    
    

    await logAction(email, 'REGISTER_SUCCESS');

    res.json({ user: { name, email, role: 'user' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      await logAction(email, 'LOGIN_FAIL');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    await logAction(email, 'LOGIN_SUCCESS');

    res.json({ user: { id: user.id, name: user.name, email, role: user.role,profile_picture: user.profile_picture} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no login' });
  }
});

export default router;






*/