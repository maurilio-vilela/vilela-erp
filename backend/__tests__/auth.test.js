const request = require('supertest');
const express = require('express');
const authRoutes = require('../src/routes/auth');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('POST /auth/login', () => {
  let tenantId;

  beforeAll(async () => {
    // Criar tenant e capturar o ID
    const tenant = await prisma.tenant.create({
      data: { name: 'Test Tenant', cnpj: '12345678901234', plan: 'basic' },
    });
    tenantId = tenant.id;

    // Criar usuário associado ao tenant
    const hashedPassword = await bcrypt.hash('123456', 10);
    await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@vilela.com',
        password: hashedPassword,
        role: 'admin',
        tenantId: tenantId,
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.$disconnect();
  });

  it('deve retornar um token para credenciais válidas', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@vilela.com', password: '123456' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('deve retornar erro para credenciais inválidas', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@vilela.com', password: 'wrong' });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Credenciais inválidas');
  });
});