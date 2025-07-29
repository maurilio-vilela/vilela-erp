const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const upload = require('../middleware/upload');

router.use(authenticateToken);

router.post('/persons', async (req, res) => {
  const {
    type, isClient, isSupplier, isEmployee, name, surname, cpfCnpj, birthDate, gender,
    email, phone, addressCep, addressStreet, addressNumber, addressComplement,
    addressNeighborhood, addressCity, addressState, addressCountry, bankDetails,
    observations, attachment,
  } = req.body;

  try {
    const prisma = new PrismaClient({
      datasources: { db: { url: `${process.env.DATABASE_URL}&schema=tenant_${req.user.tenantId}` } },
    });
    const age = birthDate ? Math.floor((new Date() - new Date(birthDate)) / (1000 * 60 * 60 * 24 * 365)) : null;
    const person = await prisma.person.create({
      data: {
        type,
        isClient: !!isClient,
        isSupplier: !!isSupplier,
        isEmployee: !!isEmployee,
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
        bankDetails: bankDetails ? JSON.parse(bankDetails) : null,
        observations,
        attachment: req.file ? req.file.path : null,
      },
    });

    // Se for colaborador, criar ou vincular usuário
    if (isEmployee) {
      const globalPrisma = new PrismaClient();
      const existingUser = await globalPrisma.user.findUnique({ where: { email } });
      if (!existingUser) {
        const hashedPassword = await require('bcrypt').hash('default123', 10); // Senha padrão inicial
        await globalPrisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: 'employee',
            tenantId: req.user.tenantId,
            personId: person.id,
          },
        });
      }
    }

    res.status(201).json(person);
  } catch (error) {
    console.error('Erro ao criar pessoa:', error);
    res.status(400).json({ error: `Erro ao criar pessoa: ${error.message}` });
  }
});

router.get('/persons', async (req, res) => {
  try {
    const prisma = new PrismaClient({
      datasources: { db: { url: `${process.env.DATABASE_URL}&schema=tenant_${req.user.tenantId}` } },
    });
    const persons = await prisma.person.findMany();
    res.json(persons);
  } catch (error) {
    console.error('Erro ao listar pessoas:', error);
    res.status(500).json({ error: 'Erro ao listar pessoas' });
  }
});

router.put('/users/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    const prisma = new PrismaClient();
    const user = await prisma.user.update({
      where: { id: parseInt(id), tenantId: req.user.tenantId },
      data: { role },
    });
    res.json(user);
  } catch (error) {
    console.error('Erro ao atualizar role:', error);
    res.status(400).json({ error: `Erro ao atualizar role: ${error.message}` });
  }
});



module.exports = router;