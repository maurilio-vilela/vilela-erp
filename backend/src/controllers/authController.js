const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { createTenantSchema } = require('../services/tenantSetup');

const prisma = new PrismaClient();

const register = async (req, res) => {
  const { name, email, password, cnpj, tenantName } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const tenant = await prisma.tenant.create({
      data: { name: tenantName, cnpj, plan: 'basic' },
    });
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'admin', tenantId: tenant.id },
    });
    await createTenantSchema(tenant.id, tenant.cnpj);
    res.status(201).json({ user, tenant });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(400).json({ error: `Erro ao criar usuário/tenant: ${error.message}` });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Tentativa de login com:', { email });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('Usuário não encontrado:', email);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Senha inválida para:', email);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const token = jwt.sign({ userId: user.id, tenantId: user.tenantId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

const listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({ where: { tenantId: req.user.tenantId } });
    res.json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
};

module.exports = { register, login, listUsers };