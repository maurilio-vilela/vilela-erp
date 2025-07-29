const request = require('supertest');
const express = require('express');
const adminRoutes = require('../src/routes/admin');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/admin', adminRoutes);

const prisma = new PrismaClient();
const token = jwt.sign({ userId: 1, tenantId: 1 }, process.env.JWT_SECRET);

describe('POST /admin/persons', () => {
  beforeAll(async () => {
    await prisma.tenant.create({
      data: { name: 'Test Tenant', cnpj: '12345678901234', plan: 'basic' },
    });
    await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@vilela.com',
        password: await require('bcrypt').hash('123456', 10),
        role: 'admin',
        tenantId: 1,
      },
    });
    await require('../src/services/tenantSetup').createTenantSchema(1, '12345678901234');
  });

  afterAll(async () => {
    const tenantPrisma = new PrismaClient({
      datasources: { db: { url: `${process.env.DATABASE_URL}&schema=tenant_1_12345678901234` } },
    });
    await tenantPrisma.person.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.$disconnect();
    await tenantPrisma.$disconnect();
  });

  it('deve criar uma pessoa', async () => {
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
        birthDate: '1990-01-01',
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
});