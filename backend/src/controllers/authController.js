const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createTenantSchema } = require('../services/tenantSetup');

const prisma = new PrismaClient();

const register = async (req, res) => {
  const { name, email, password, cnpj, tenantName } = req.body;
  console.log('Iniciando registro:', { name, email, cnpj, tenantName });
  try {
    console.log('Criptografando senha...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Criando tenant...');
    const tenant = await prisma.tenant.create({
      data: { name: tenantName, cnpj, plan: 'basic' },
    });
    console.log('Tenant criado:', tenant);
    console.log('Criando schema do tenant...');
    await createTenantSchema(tenant.id, tenant.cnpj);
    console.log('Schema do tenant criado com sucesso.');
    console.log('Criando usuário...');
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'admin', tenantId: tenant.id },
    });
    console.log('Usuário criado:', user);
    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, cnpj: tenant.cnpj },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(201).json({ user, tenant, token });
  } catch (error) {
    console.error('Erro no registro:', error);
    if (error.code === 'P2002' && error.meta.target.includes('cnpj')) {
      res.status(400).json({ error: 'CNPJ já registrado' });
    } else {
      res.status(400).json({ error: `Erro ao criar usuário/tenant: ${error.message}` });
    }
  } finally {
    await prisma.$disconnect();
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Tentativa de login com:', { email });

  try {
    const user = await prisma.user.findUnique({ where: { email }, include: { tenant: true } });
    if (!user) {
      console.log('Usuário não encontrado:', email);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Senha inválida para:', email);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, cnpj: user.tenant.cnpj },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    await prisma.$disconnect();
  }
};

const listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({ where: { tenantId: req.user.tenantId } });
    res.json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  } finally {
    await prisma.$disconnect();
  }
};

const getUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId });
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = { register, login, listUsers, getUser };