import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();


const { Pool } = pg;

const app = express();
const PORT = 3001;

// Config de conexión
const pool = new Pool({
  user: 'postgres',
  host: 'db',
  database: 'mensajesdb',
  password: 'postgres',
  port: 5432,
});

app.use(cors());
app.use(bodyParser.json());

// Crear tabla si no existe
const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS mensajes (
      id SERIAL PRIMARY KEY,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL,
      mensaje TEXT NOT NULL,
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

app.post('/api/mensajes', async (req, res) => {
  const { nombre, email, mensaje, token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token de reCAPTCHA faltante' });
  }

  try {
    // Validar token con Google
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

    const response = await fetch(verifyURL, {
      method: 'POST'
    });

    const data = await response.json();

    if (!data.success) {
      return res.status(400).json({ error: 'Verificación de reCAPTCHA fallida' });
    }

    // Insertar en la base de datos si el captcha es válido
    await pool.query(
      'INSERT INTO mensajes (nombre, email, mensaje) VALUES ($1, $2, $3)',
      [nombre, email, mensaje]
    );

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error al guardar mensaje o verificar captcha:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});


app.get('/api/mensajes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mensajes ORDER BY fecha DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo los mensajes' });
  }
});

app.listen(PORT, '0.0.0.0', async () => {
  await initDB();
  console.log(`Backend escuchando en http://0.0.0.0:${PORT}`);
});
