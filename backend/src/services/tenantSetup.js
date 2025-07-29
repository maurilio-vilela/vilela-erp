const { Client } = require('pg');

async function createTenantSchema(tenantId, tenantCnpj) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    const schemaName = `tenant_${tenantId}_${tenantCnpj.replace(/[^0-9]/g, '')}`;
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
    console.log(`Schema ${schemaName} criado com sucesso.`);
  } catch (error) {
    console.error('Erro ao criar schema:', error);
    throw new Error(`Falha ao criar schema para tenant ${tenantId}: ${error.message}`);
  } finally {
    await client.end();
  }
}

module.exports = { createTenantSchema };