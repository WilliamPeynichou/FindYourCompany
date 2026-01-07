require('dotenv').config();
const { Sequelize } = require('sequelize');

/**
 * Script pour créer la base de données directement avec Sequelize
 */
async function createDatabase() {
  const dbName = process.env.DB_NAME || 'findyourcompany';
  const dbUser = process.env.DB_USER || 'root';
  const dbPass = process.env.DB_PASS || 'root';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT) || 5432;

  console.log('🔧 Configuration de la base de données...');
  console.log(`   Host: ${dbHost}:${dbPort}`);
  console.log(`   User: ${dbUser}`);
  console.log(`   Database: ${dbName}\n`);

  try {
    // Se connecter à la base de données par défaut pour créer la DB
    const adminSequelize = new Sequelize('postgres', dbUser, dbPass, {
      host: dbHost,
      port: dbPort,
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        connectTimeout: 10000
      }
    });

    // Tester la connexion
    await adminSequelize.authenticate();
    console.log('✅ Connexion à PostgreSQL réussie\n');

    // Vérifier si la base existe
    const [results] = await adminSequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      { bind: [dbName] }
    );

    if (results.length === 0) {
      console.log(`📦 Création de la base de données "${dbName}"...`);
      await adminSequelize.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Base de données "${dbName}" créée avec succès\n`);
    } else {
      console.log(`ℹ️  La base de données "${dbName}" existe déjà\n`);
    }

    await adminSequelize.close();

    // Maintenant créer les tables directement
    console.log('🔄 Création des tables...\n');
    
    const sequelize = new Sequelize(dbName, dbUser, dbPass, {
      host: dbHost,
      port: dbPort,
      dialect: 'postgres',
      logging: console.log
    });

    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie\n');

    // Créer la table companies
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        siret VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(255) NOT NULL,
        postcode VARCHAR(255) NOT NULL,
        phone VARCHAR(255),
        email VARCHAR(255),
        website VARCHAR(255),
        sector VARCHAR(255),
        lat DECIMAL(10, 8),
        lon DECIMAL(11, 8),
        source VARCHAR(255) DEFAULT 'sirene',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Table "companies" créée\n');

    // Créer les index
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_companies_location ON companies(city, postcode);
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_companies_contacts ON companies(email, phone);
    `);

    console.log('✅ Index créés\n');

    await sequelize.close();

    console.log('✅ Base de données configurée avec succès !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    if (error.original) {
      console.error('   Détails:', error.original.message);
    }
    process.exit(1);
  }
}

createDatabase();

