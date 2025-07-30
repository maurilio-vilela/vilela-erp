const request = require('supertest');
const express = require('express');
const authRoutes = require('../src/routes/auth');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { createTenantSchema } = require('../services/tenantSetup');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

const prisma = new PrismaClient();
let tenantId;
const cnpj = `1234567890${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`; // CNPJ único
const email = `test${Math.floor(Math.random() * 10000)}@vilela.com`; // E-mail único

describe('Auth Routes', () => {
  beforeAll(async () => {
    console.log('Iniciando configuração do beforeAll...');
    try {
      // Limpar dados existentes
      console.log('Limpando dados existentes...');
      await prisma.user.deleteMany();
      await prisma.tenant.deleteMany();

      // Criar tenant
      console.log('Criando tenant...');
      const tenant = await prisma.tenant.create({
        data: { name: 'Test Tenant', cnpj: cnpj, plan: 'basic' },
      });
      tenantId = tenant.id;
      console.log('Tenant criado:', tenant);

      // Criar schema do tenant
      console.log('Criando schema do tenant...');
      await createTenantSchema(tenantId, cnpj);
      console.log('Schema do tenant criado com sucesso.');

      // Criar usuário
      console.log('Criando usuário...');
      await prisma.user.create({
        data: {
          name: 'Test User',
          email: email,
          password: await require('bcrypt').hash('123456', 10),
          role: 'admin',
          tenantId: tenantId,
        },
      });
      console.log('Usuário criado com sucesso.');
    } catch (error) {
      console.error('Erro no beforeAll:', error);
      throw error;
    }
  });

  afterAll(async () => {
    console.log('Iniciando limpeza do afterAll...');
    try {
      // Deletar schema do tenant
      console.log('Deletando schema do tenant...');
      await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS tenant_${tenantId}_${cnpj.replace(/[^0-9]/g, '')} CASCADE`);
      console.log('Schema do tenant deletado.');
      await prisma.user.deleteMany();
      await prisma.tenant.deleteMany();
    } catch (error) {
      console.error('Erro ao deletar schema do tenant:', error);
    } finally {
      await prisma.$disconnect();
      console.log('Conexão Prisma desconectada.');
    }
  });

  it('deve retornar um token para credenciais válidas', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: email,
        password: '123456',
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('deve retornar erro para credenciais inválidas', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: email,
        password: 'wrongpassword',
      });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Credenciais inválidas');
  });

  it('deve listar usuários', async () => {
    const token = jwt.sign({ userId: 1, tenantId: tenantId, cnpj }, process.env.JWT_SECRET);
    const response = await request(app)
      .get('/auth/users')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('deve obter informações do usuário autenticado', async () => {
    const token = jwt.sign({ userId: 1, tenantId: tenantId, cnpj }, process.env.JWT_SECRET);
    const response = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('email');
  });
});