const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const { PrismaClient } = require('@prisma/client');

const connection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
//  password: process.env.REDIS_PASSWORD || undefined // Adicione se usar autenticação
});

const reminderQueue = new Queue('reminders', { connection });

const addBirthdayReminder = async (tenantId) => {
  const prisma = new PrismaClient({
    datasources: { db: { url: `${process.env.DATABASE_URL}&schema=tenant_${tenantId}` } },
  });
  const today = new Date();
  const birthdays = await prisma.person.findMany({
    where: {
      birthDate: {
        gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        lte: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59),
      },
    },
  });

  for (const person of birthdays) {
    await reminderQueue.add('send-birthday', {
      tenantId,
      name: person.name,
      email: person.email,
    });
  }
  await prisma.$disconnect();
};

const worker = new Worker('reminders', async (job) => {
  const { name, email } = job.data;
  console.log(`Enviando lembrete de aniversário para ${name} (${email})`);
  // Implementar integração com WhatsApp Business API aqui
  // Exemplo: await sendWhatsAppMessage(name, email, 'http://localhost:3000/api/reminders');
}, { connection });

module.exports = { addBirthdayReminder };