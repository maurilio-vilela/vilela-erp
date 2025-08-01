const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { cpf, cnpj } = require('cpf-cnpj-validator');
const verifyToken = require('../middleware/auth');
const router = express.Router();

router.use(verifyToken);

// Função para validar e-mail
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email ? emailRegex.test(email) : true; // E-mail é opcional
};

// Função para validar telefone (formato brasileiro: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX)
const validatePhone = (phone) => {
  const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/;
  return phone ? phoneRegex.test(phone) : true; // Telefone é opcional
};

router.post('/persons', async (req, res) => {
  let tenantPrisma;
  try {
    const schemaName = `tenant_${req.user.tenantId}_${req.user.cnpj.replace(/[^0-9]/g, '')}`;
    console.log('SchemaName usado:', schemaName); // Adicionado para depuração
    console.log('User info:', req.user); // Adicionado para depuração
    tenantPrisma = new PrismaClient({
      datasources: { db: { url: `${process.env.DATABASE_URL}&schema=${schemaName}` } },
    });

    let data = req.body;
    if (req.body.data) {
      data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
    }

    console.log('Dados recebidos:', data);

    const {
      type,
      isClient = false,
      isSupplier = false,
      isEmployee = false,
      nationality = 'Brasileira',
      name,
      surname,
      cpfCnpj,
      passport,
      birthDate,
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
      addressCountry = 'Brasil',
      bankDetails,
      observations,
    } = data;

    const isClientBool = isClient === 'true' || isClient === true;
    const isSupplierBool = isSupplier === 'true' || isSupplier === true;
    const isEmployeeBool = isEmployee === 'true' || isEmployee === true;

    const age = birthDate ? Math.floor((new Date() - new Date(birthDate)) / (1000 * 60 * 60 * 24 * 365)) : null;

    const person = await tenantPrisma.person.create({
      data: {
        type,
        isClient: isClientBool,
        isSupplier: isSupplierBool,
        isEmployee: isEmployeeBool,
        nationality,
        name,
        surname,
        cpfCnpj: nationality === 'Brasileira' ? cpfCnpj : (type === 'PJ' ? cpfCnpj : null),
        passport: nationality === 'Estrangeira' && type === 'PF' && isClientBool ? passport : null,
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
        bankDetails: bankDetails ? JSON.parse(JSON.stringify(bankDetails)) : null,
        observations,
        attachment: req.files?.attachment ? req.files.attachment[0].path : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    res.status(201).json(person);
  } catch (error) {
    console.error('Erro ao criar pessoa:', error);
    res.status(400).json({ error: `Erro ao criar pessoa: ${error.message}` });
  } finally {
    if (tenantPrisma) {
      await tenantPrisma.$disconnect();
    }
  }
});

router.put('/persons/:id', async (req, res) => {
  let tenantPrisma;
  try {
    const schemaName = `tenant_${req.user.tenantId}_${req.user.cnpj.replace(/[^0-9]/g, '')}`;
    console.log('SchemaName usado:', schemaName); // Adicionado para depuração
    console.log('User info:', req.user); // Adicionado para depuração
    tenantPrisma = new PrismaClient({
      datasources: { db: { url: `${process.env.DATABASE_URL}&schema=${schemaName}` } },
    });

    let data = req.body;
    if (req.body.data) {
      data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
    }

    console.log('Dados recebidos para atualização:', data); // Log para depuração

    const {
      type,
      isClient = false,
      isSupplier = false,
      isEmployee = false,
      nationality,
      name,
      surname,
      cpfCnpj,
      passport,
      birthDate,
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
    } = data;

    const isClientBool = isClient === 'true' || isClient === true;
    const isSupplierBool = isSupplier === 'true' || isSupplier === true;
    const isEmployeeBool = isEmployee === 'true' || isEmployee === true;

    const age = birthDate ? Math.floor((new Date() - new Date(birthDate)) / (1000 * 60 * 60 * 24 * 365)) : null;

    const person = await tenantPrisma.person.update({
      where: { id: parseInt(req.params.id) },
      data: {
        type,
        isClient: isClientBool,
        isSupplier: isSupplierBool,
        isEmployee: isEmployeeBool,
        nationality,
        name,
        surname,
        cpfCnpj: nationality === 'Brasileira' ? cpfCnpj : (type === 'PJ' ? cpfCnpj : null),
        passport: nationality === 'Estrangeira' && type === 'PF' && isClientBool ? passport : null,
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
        bankDetails: bankDetails ? JSON.parse(JSON.stringify(bankDetails)) : null,
        observations,
        attachment: req.files?.attachment ? req.files.attachment[0].path : null,
        updatedAt: new Date(),
      },
    });

    res.json(person);
  } catch (error) {
    console.error('Erro ao atualizar pessoa:', error);
    res.status(400).json({ error: `Erro ao atualizar pessoa: ${error.message}` });
  } finally {
    if (tenantPrisma) {
      await tenantPrisma.$disconnect();
    }
  }
});

router.get('/persons', async (req, res) => {
  let tenantPrisma;
  try {
    const schemaName = `tenant_${req.user.tenantId}_${req.user.cnpj.replace(/[^0-9]/g, '')}`;
    console.log('SchemaName usado:', schemaName); // Adicionado para depuração
    console.log('User info:', req.user); // Adicionado para depuração
    tenantPrisma = new PrismaClient({
      datasources: { db: { url: `${process.env.DATABASE_URL}&schema=${schemaName}` } },
    });

    const persons = await tenantPrisma.person.findMany();
    res.json(persons);
  } catch (error) {
    console.error('Erro ao listar pessoas:', error);
    res.status(500).json({ error: 'Erro ao listar pessoas' });
  } finally {
    if (tenantPrisma) {
      await tenantPrisma.$disconnect();
    }
  }
});

router.delete('/persons/:id', async (req, res) => {
  let tenantPrisma;
  try {
    const schemaName = `tenant_${req.user.tenantId}_${req.user.cnpj.replace(/[^0-9]/g, '')}`;
    console.log('SchemaName usado:', schemaName); // Adicionado para depuração
    console.log('User info:', req.user); // Adicionado para depuração
    tenantPrisma = new PrismaClient({
      datasources: { db: { url: `${process.env.DATABASE_URL}&schema=${schemaName}` } },
    });

    await tenantPrisma.person.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir pessoa:', error);
    res.status(400).json({ error: `Erro ao excluir pessoa: ${error.message}` });
  } finally {
    if (tenantPrisma) {
      await tenantPrisma.$disconnect();
    }
  }
});

router.get('/reminders/birthdays', async (req, res) => {
  let tenantPrisma;
  try {
    const schemaName = `tenant_${req.user.tenantId}_${req.user.cnpj.replace(/[^0-9]/g, '')}`;
    console.log('SchemaName usado:', schemaName); // Adicionado para depuração
    console.log('User info:', req.user); // Adicionado para depuração
    tenantPrisma = new PrismaClient({
      datasources: { db: { url: `${process.env.DATABASE_URL}&schema=${schemaName}` } },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const birthdays = await tenantPrisma.person.findMany({
      where: {
        birthDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    res.json(birthdays);
  } catch (error) {
    console.error('Erro ao listar aniversariantes:', error);
    res.status(500).json({ error: 'Erro ao listar aniversariantes' });
  } finally {
    if (tenantPrisma) {
      await tenantPrisma.$disconnect();
    }
  }
});

module.exports = router;