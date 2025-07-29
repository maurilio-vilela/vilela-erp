const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Rotas
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});