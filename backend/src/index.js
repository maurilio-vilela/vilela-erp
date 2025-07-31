const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const salesRoutes = require('./routes/sales');
const multer = require('multer');
const { addBirthdayReminder } = require('./services/reminderQueue');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });
const port = process.env.PORT || 4000;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Rotas
app.use('/auth', authRoutes);
app.use('/admin', upload.fields([
  { name: 'attachment', maxCount: 1 },
  { name: 'data', maxCount: 1 }
]), adminRoutes);
app.use('/sales', salesRoutes);

// Agendar lembretes diários
setInterval(async () => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const tenants = await prisma.tenant.findMany();
    for (const tenant of tenants) {
      await addBirthdayReminder(tenant.id);
    }
  } catch (error) {
    console.error('Erro ao agendar lembretes:', error);
  } finally {
    await prisma.$disconnect();
  }
}, 24 * 60 * 60 * 1000); // Executa diariamente

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});