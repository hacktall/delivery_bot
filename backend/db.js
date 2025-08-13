// db.js
import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'coR4S%@)(BN',
  database: 'delivery_bot',
  waitForConnections: true,
  connectionLimit: 10,
});
