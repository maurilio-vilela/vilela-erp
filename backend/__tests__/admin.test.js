const request = require('supertest');
const express = require('express');
const adminRoutes = require('../src/routes/admin');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { createTenantSchema } = require('../services/tenantSetup');

const app = express();
app.use(express.json());
app.use('/admin', adminRoutes);

const prisma = new PrismaClient();
let tenantId;
const cnpj = `1234567890${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`; // CNPJ único
const email = `test${Math.floor(Math.random() * 10000)}@vilela.com`; // E-mail único

describe('Admin Routes', () => {
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

  it('deve criar uma pessoa', async () => {
    const token = jwt.sign({ userId: 1, tenantId: tenantId, cnpj }, process.env.JWT_SECRET);
    const response = await request(app)
      .post('/admin/persons')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'PF',
        isClient: true,
        isSupplier: false,
        isEmployee: false,
        name: 'João',
        surname: 'Silva',
        cpfCnpj: '12345678901',
        birthDate: '1990-01-01T00:00:00.000Z',
        gender: 'M',
        email: 'joao@vilela.com',
        phone: '11999999999',
        addressCep: '12345-678',
        addressStreet: 'Rua Teste',
        addressNumber: '123',
        addressNeighborhood: 'Centro',
        addressCity: 'São Paulo',
        addressState: 'SP',
        addressCountry: 'Brasil',
        observations: 'Cliente VIP',
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('João');
  });

  it('deve listar pessoas', async () => {
    const token = jwt.sign({ userId: 1, tenantId: tenantId, cnpj }, process.env.JWT_SECRET);
    const response = await request(app)
      .get('/admin/persons')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('deve atualizar uma pessoa', async () => {
    const tenantPrisma = new PrismaClient({
      datasources: { db: { url: `${process.env.DATABASE_URL}&schema=tenant_${tenantId}_${cnpj.replace(/[^0-9]/g, '')}` } },
    });
    const person = await tenantPrisma.person.create({
      data: {
        type: 'PF',
        isClient: true,
        name: 'João',
        surname: 'Silva',
        cpfCnpj: '98765432101',
      },
    });
    const token = jwt.sign({ userId: 1, tenantId: tenantId, cnpj }, process.env.JWT_SECRET);
    const response = await request(app)
      .put(`/admin/persons/${person.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'PF',
        isClient: true,
        name: 'João Atualizado',
        surname: 'Silva',
        cpfCnpj: '98765432101',
      });
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('João Atualizado');
    await tenantPrisma.$disconnect();
  });

  it('deve excluir uma pessoa', async () => {
    const tenantPrisma = new PrismaClient({
      datasources: { db: { url: `${process.env.DATABASE_URL}&schema=tenant_${tenantId}_${cnpj.replace(/[^0-9]/g, '')}` } },
    });
    const person = await tenantPrisma.person.create({
      data: {
        type: 'PF',
        isClient: true,
        name: 'João',
        surname: 'Silva',
        cpfCnpj: '12345678902',
      },
    });
    const token = jwt.sign({ userId: 1, tenantId: tenantId, cnpj }, process.env.JWT_SECRET);
    const response = await request(app)
      .delete(`/admin/persons/${person.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(204);
    await tenantPrisma.$disconnect();
  });

  it('deve listar aniversariantes', async () => {
    const tenantPrisma = new PrismaClient({
      datasources: { db: { url: `${process.env.DATABASE_URL}&schema=tenant_${tenantId}_${cnpj.replace(/[^0-9]/g, '')}` } },
    });
    await tenantPrisma.person.create({
      data: {
        type: 'PF',
        isClient: true,
        name: 'Maria',
        surname: 'Santos',
        cpfCnpj: '12345678903',
        birthDate: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    });
    const token = jwt.sign({ userId: 1, tenantId: tenantId, cnpj }, process.env.JWT_SECRET);
    const response = await request(app)
      .get('/admin/reminders/birthdays')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    await tenantPrisma.$disconnect();
  });
});