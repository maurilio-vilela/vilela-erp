const { Client } = require('pg');

async function createTenantSchema(tenantId, tenantCnpj) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    const schemaName = `tenant_${tenantId}_${tenantCnpj.replace(/[^0-9]/g, '')}`;
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);

    // Criar tabela Person no schema do tenant
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${schemaName}.Person (
        id SERIAL PRIMARY KEY,
        type VARCHAR(2) NOT NULL,
        isClient BOOLEAN DEFAULT FALSE,
        isSupplier BOOLEAN DEFAULT FALSE,
        isEmployee BOOLEAN DEFAULT FALSE,
        name VARCHAR(255) NOT NULL,
        surname VARCHAR(255),
        cpfCnpj VARCHAR(14) UNIQUE NOT NULL,
        birthDate DATE,
        age INTEGER,
        gender VARCHAR(10),
        email VARCHAR(255),
        phone VARCHAR(20),
        addressCep VARCHAR(10),
        addressStreet VARCHAR(255),
        addressNumber VARCHAR(20),
        addressComplement VARCHAR(255),
        addressNeighborhood VARCHAR(255),
        addressCity VARCHAR(255),
        addressState VARCHAR(2),
        addressCountry VARCHAR(100) DEFAULT 'Brasil',
        bankDetails JSONB,
        observations TEXT,
        attachment VARCHAR(255),
        createdAt TIMESTAMP DEFAULT NOW(),
        updatedAt TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log(`Schema ${schemaName} e tabela Person criados com sucesso.`);
  } catch (error) {
    console.error('Erro ao criar schema/tabela:', error);
    throw new Error(`Falha ao criar schema para tenant ${tenantId}: ${error.message}`);
  } finally {
    await client.end();
  }
}

module.exports = { createTenantSchema };