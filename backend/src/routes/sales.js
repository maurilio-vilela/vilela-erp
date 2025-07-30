const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

router.use(verifyToken);

router.post('/sales', async (req, res) => {
  const { personId, status, total, discount, items } = req.body;
  try {
    const schemaName = `tenant_${req.user.tenantId}_${req.user.cnpj.replace(/[^0-9]/g, '')}`;
    console.log(`Usando schema: ${schemaName}`);
    const prisma = new PrismaClient({
      datasources: { db: { url: `${process.env.DATABASE_URL}&schema=${schemaName}` } },
    });
    const sale = await prisma.sale.create({
      data: {
        personId,
        userId: req.user.userId,
        status,
        total,
        discount,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: { items: true },
    });
    await prisma.$disconnect();
    res.status(201).json(sale);
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(400).json({ error: `Erro ao criar venda: ${error.message}` });
  }
});

router.get('/sales', async (req, res) => {
  try {
    const schemaName = `tenant_${req.user.tenantId}_${req.user.cnpj.replace(/[^0-9]/g, '')}`;
    console.log(`Usando schema: ${schemaName}`);
    const prisma = new PrismaClient({
      datasources: { db: { url: `${process.env.DATABASE_URL}&schema=${schemaName}` } },
    });
    const sales = await prisma.sale.findMany({
      include: { person: true, user: true, items: true },
    });
    await prisma.$disconnect();
    res.json(sales);
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    res.status(500).json({ error: 'Erro ao listar vendas' });
  }
});

module.exports = router;