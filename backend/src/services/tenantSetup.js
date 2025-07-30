const { Client } = require('pg');

   async function createTenantSchema(tenantId, tenantCnpj) {
     const client = new Client({
       connectionString: process.env.DATABASE_URL,
     });

     try {
       console.log('Conectando ao banco de dados...');
       await client.connect();
       console.log('Conexão estabelecida com sucesso.');

       const schemaName = `tenant_${tenantId}_${tenantCnpj.replace(/[^0-9]/g, '')}`;
       console.log(`Criando schema ${schemaName}`);

       // Iniciar transação
       await client.query('BEGIN');
       console.log('Transação iniciada.');

       // Criar schema
       await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
       console.log(`Schema "${schemaName}" criado`);

       // Verificar se o schema foi criado
       const schemaResult = await client.query(`
         SELECT EXISTS (
           SELECT FROM information_schema.schemata 
           WHERE schema_name = $1
         );
       `, [schemaName]);
       const schemaExists = schemaResult.rows[0].exists;
       console.log(`Verificação: Schema "${schemaName}" existe? ${schemaExists}`);
       if (!schemaExists) {
         throw new Error(`Schema "${schemaName}" não foi criado`);
       }

       // Criar tabela Person
       console.log(`Criando tabela "${schemaName}"."Person"`);
       await client.query(`
         CREATE TABLE IF NOT EXISTS "${schemaName}"."Person" (
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
       console.log(`Tabela "${schemaName}"."Person" criada`);

       // Verificar se a tabela Person foi criada
       const personTableResult = await client.query(`
         SELECT EXISTS (
           SELECT FROM information_schema.tables 
           WHERE table_schema = $1 
           AND table_name = 'Person'
         );
       `, [schemaName]);
       const personTableExists = personTableResult.rows[0].exists;
       console.log(`Verificação: Tabela "${schemaName}"."Person" existe? ${personTableExists}`);
       if (!personTableExists) {
         throw new Error(`Tabela "${schemaName}"."Person" não foi criada`);
       }

       // Confirmar transação
       await client.query('COMMIT');
       console.log(`Transação confirmada. Schema "${schemaName}" e tabela Person criadas com sucesso.`);

       // Criar outras tabelas
       const tables = [
         {
           name: 'Product',
           query: `
             CREATE TABLE IF NOT EXISTS "${schemaName}"."Product" (
               id SERIAL PRIMARY KEY,
               name VARCHAR(255) NOT NULL,
               code VARCHAR(255) UNIQUE NOT NULL,
               price FLOAT NOT NULL,
               category VARCHAR(255),
               stock INTEGER DEFAULT 0,
               expiration TIMESTAMP,
               createdAt TIMESTAMP DEFAULT NOW(),
               updatedAt TIMESTAMP DEFAULT NOW()
             )
           `
         },
         {
           name: 'Sale',
           query: `
             CREATE TABLE IF NOT EXISTS "${schemaName}"."Sale" (
               id SERIAL PRIMARY KEY,
               personId INTEGER REFERENCES "${schemaName}"."Person"(id),
               userId INTEGER NOT NULL,
               status VARCHAR(20) NOT NULL,
               total FLOAT NOT NULL,
               discount FLOAT DEFAULT 0,
               createdAt TIMESTAMP DEFAULT NOW(),
               updatedAt TIMESTAMP DEFAULT NOW()
             )
           `
         },
         {
           name: 'SaleItem',
           query: `
             CREATE TABLE IF NOT EXISTS "${schemaName}"."SaleItem" (
               id SERIAL PRIMARY KEY,
               saleId INTEGER REFERENCES "${schemaName}"."Sale"(id),
               productId INTEGER REFERENCES "${schemaName}"."Product"(id),
               quantity INTEGER NOT NULL,
               unitPrice FLOAT NOT NULL,
               createdAt TIMESTAMP DEFAULT NOW()
             )
           `
         },
         {
           name: 'Commission',
           query: `
             CREATE TABLE IF NOT EXISTS "${schemaName}"."Commission" (
               id SERIAL PRIMARY KEY,
               userId INTEGER NOT NULL,
               saleId INTEGER REFERENCES "${schemaName}"."Sale"(id),
               percentage FLOAT NOT NULL,
               amount FLOAT NOT NULL,
               createdAt TIMESTAMP DEFAULT NOW()
             )
           `
         },
         {
           name: 'FinancialTransaction',
           query: `
             CREATE TABLE IF NOT EXISTS "${schemaName}"."FinancialTransaction" (
               id SERIAL PRIMARY KEY,
               type VARCHAR(20) NOT NULL,
               personId INTEGER REFERENCES "${schemaName}"."Person"(id),
               amount FLOAT NOT NULL,
               dueDate TIMESTAMP NOT NULL,
               status VARCHAR(20) NOT NULL,
               category VARCHAR(255),
               costCenter VARCHAR(255),
               createdAt TIMESTAMP DEFAULT NOW(),
               updatedAt TIMESTAMP DEFAULT NOW()
             )
           `
         },
         {
           name: 'Invoice',
           query: `
             CREATE TABLE IF NOT EXISTS "${schemaName}"."Invoice" (
               id SERIAL PRIMARY KEY,
               type VARCHAR(20) NOT NULL,
               personId INTEGER REFERENCES "${schemaName}"."Person"(id),
               number VARCHAR(255) UNIQUE NOT NULL,
               amount FLOAT NOT NULL,
               issueDate TIMESTAMP NOT NULL,
               xml TEXT,
               createdAt TIMESTAMP DEFAULT NOW()
             )
           `
         },
         {
           name: 'Task',
           query: `
             CREATE TABLE IF NOT EXISTS "${schemaName}"."Task" (
               id SERIAL PRIMARY KEY,
               title VARCHAR(255) NOT NULL,
               description TEXT,
               userId INTEGER NOT NULL,
               status VARCHAR(20) NOT NULL,
               dueDate TIMESTAMP,
               createdAt TIMESTAMP DEFAULT NOW(),
               updatedAt TIMESTAMP DEFAULT NOW()
             )
           `
         }
       ];

       await client.query('BEGIN');
       for (const table of tables) {
         console.log(`Criando tabela "${schemaName}"."${table.name}"`);
         await client.query(table.query);
         console.log(`Tabela "${schemaName}"."${table.name}" criada`);

         const tableResult = await client.query(`
           SELECT EXISTS (
             SELECT FROM information_schema.tables 
             WHERE table_schema = $1 
             AND table_name = $2
           );
         `, [schemaName, table.name]);
         const tableExists = tableResult.rows[0].exists;
         console.log(`Verificação: Tabela "${schemaName}"."${table.name}" existe? ${tableExists}`);
         if (!tableExists) {
           throw new Error(`Tabela "${schemaName}"."${table.name}" não foi criada`);
         }
       }
       await client.query('COMMIT');
       console.log(`Todas as tabelas criadas com sucesso no schema "${schemaName}".`);
     } catch (error) {
       await client.query('ROLLBACK');
       console.error('Erro ao criar schema/tabelas:', error);
       throw new Error(`Falha ao criar schema para tenant ${tenantId}: ${error.message}`);
     } finally {
       await client.end();
       console.log('Conexão com o banco de dados fechada.');
     }
   }

   module.exports = { createTenantSchema };