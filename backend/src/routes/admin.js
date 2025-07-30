const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const verifyToken = require('../middleware/auth');

router.use(verifyToken);

// Criar uma pessoa
router.post('/persons', async (req, res) => {
  const {
    type, isClient, isSupplier, isEmployee, name, surname, cpfCnpj, birthDate, gender,
    email, phone, addressCep, addressStreet, addressNumber, addressComplement,
    addressNeighborhood, addressCity, addressState, addressCountry, bankDetails,
    observations, attachment,
  } = req.body;

  try {
    const schemaName = `tenant_${req.user.tenantId}_${req.user.cnpj.replace(/[^0-9]/g, '')}`;
    console.log(`Usando schema: ${schemaName}`);

    const tenantPrisma = new PrismaClient({
      datasources: { db: { url: `${process.env.DATABASE_URL}&schema=${schemaName}` } },
    });

    const age = birthDate ? Math.floor((new Date() - new Date(birthDate)) / (1000 * 60 * 60 * 24 * 365)) : null;
    const person = await tenantPrisma.person.create({
      data: {
        type,
        isClient,
        isSupplier,
        isEmployee,
        name,
        surname,
        cpfCnpj,
        birthDate: birthDate ? new Date(birthDate) : null,
        age,
        gender,
        email,
        phone,
        addressCep,
        addressStreet,
        addressNumber,
        addressComplement,
        addressNeighborhood,
        addressCity,
        addressState,
        addressCountry,
        bankDetails,
        observations,
        attachment,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await tenantPrisma.$disconnect();
    res.status(201).json(person);
  } catch (error) {
    console.error('Erro ao criar pessoa:', error);
    res.status(400).json({ error: `Erro ao criar pessoa: ${error.message}` });
  }
});

// Listar pessoas
router.get('/persons', async (req, res) => {
  try {
    const schemaName = `tenant_${req.user.tenantId}_${req.user.cnpj.replace(/[^0-9]/g, '')}`;
    console.log(`Usando schema: ${schemaName}`);

    const tenantPrisma = new PrismaClient({
      datasources: { db: { url: `${process.env.DATABASE_URL}&schema=${schemaName}` } },
    });

    const persons = await tenantPrisma.person.findMany();
    await tenantPrisma.$disconnect();
    res.json(persons);
  } catch (error) {
    console.error('Erro ao listar pessoas:', error);
    res.status(500).json({ error: 'Erro ao listar pessoas' });
  }
});

// Atualizar uma pessoa
router.put('/persons/:id', async (req, res) => {
  const { id } = req.params;
  const {
    type, isClient, isSupplier, isEmployee, name, surname, cpfCnpj, birthDate, gender,
    email, phone, addressCep, addressStreet, addressNumber, addressComplement,
    addressNeighborhood, addressCity, addressState, addressCountry, bankDetails,
    observations, attachment,
  } = req.body;

  try {
    const schemaName = `tenant_${req.user.tenantId}_${req.user.cnpj.replace(/[^0-9]/g, '')}`;
    console.log(`Usando schema: ${schemaName}`);

    const tenantPrisma = new PrismaClient({
      datasources: { db: { url: `${process.env.DATABASE_URL}&schema=${schemaName}` } },
    });

    const age = birthDate ? Math.floor((new Date() - new Date(birthDate)) / (1000 * 60 * 60 * 24 * 365)) : null;
    const person = await tenantPrisma.person.update({
      where: { id: parseInt(id) },
      data: {
        type,
        isClient,
        isSupplier,
        isEmployee,
        name,
        surname,
        cpfCnpj,
        birthDate: birthDate ? new Date(birthDate) : null,
        age,
        gender,
        email,
        phone,
        addressCep,
        addressStreet,
        addressNumber,
        addressComplement,
        addressNeighborhood,
        addressCity,
        addressState,
        addressCountry,
        bankDetails,
        observations,
        attachment,
        updatedAt: new Date(),
      },
    });

    await tenantPrisma.$disconnect();
    res.json(person);
  } catch (error) {
    console.error('Erro ao atualizar pessoa:', error);
    res.status(400).json({ error: `Erro ao atualizar pessoa: ${error.message}` });
  }
});

// Excluir uma pessoa
router.delete('/persons/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const schemaName = `tenant_${req.user.tenantId}_${req.user.cnpj.replace(/[^0-9]/g, '')}`;
    console.log(`Usando schema: ${schemaName}`);

    const tenantPrisma = new PrismaClient({
      datasources: { db: { url: `${process.env.DATABASE_URL}&schema=${schemaName}` } },
    });

    await tenantPrisma.person.delete({ where: { id: parseInt(id) } });
    await tenantPrisma.$disconnect();
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir pessoa:', error);
    res.status(400).json({ error: `Erro ao excluir pessoa: ${error.message}` });
  }
});

// Listar aniversariantes
router.get('/reminders/birthdays', async (req, res) => {
  try {
    const schemaName = `tenant_${req.user.tenantId}_${req.user.cnpj.replace(/[^0-9]/g, '')}`;
    console.log(`Usando schema: ${schemaName}`);

    const tenantPrisma = new PrismaClient({
      datasources: { db: { url: `${process.env.DATABASE_URL}&schema=${schemaName}` } },
    });

    const today = new Date();
    const persons = await tenantPrisma.person.findMany({
      where: {
        birthDate: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          lte: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
        },
      },
    });

    await tenantPrisma.$disconnect();
    res.json(persons);
  } catch (error) {
    console.error('Erro ao listar aniversariantes:', error);
    res.status(500).json({ error: 'Erro ao listar aniversariantes' });
  }
});

module.exports = router;