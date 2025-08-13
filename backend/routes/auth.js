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

    
    /*await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [
      name,
      email,
      hash,
    ]);*/

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
    // Busca agora também o tenant_id
    const [[user]] = await pool.query(
     'SELECT id, name, email, password, role, profile_picture, tenant_id FROM users WHERE email = ?',
     [email]
   );
  
    if (!user) {
      await logAction(email, 'LOGIN_FAIL');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Supondo senha em hash bcrypt
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      await logAction(email, 'LOGIN_FAIL');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    await logAction(email, 'LOGIN_SUCCESS');

    // Remova o campo password antes de enviar
    delete user.password;

    // Envie o user incluindo tenant_id
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_picture: user.profile_picture,
        tenant_id: user.tenant_id
      },
      // se você gerencia tokens, mande também o token
      token: '...'
    });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
});

export default router;