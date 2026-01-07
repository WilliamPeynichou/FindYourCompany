require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

/**
 * Script pour créer la base de données et les tables directement
 * Supporte MySQL et PostgreSQL selon la configuration
 */
async function migrateDatabase() {
  const dbName = process.env.DB_NAME || 'findyourcompany';
  const dbUser = process.env.DB_USER || 'root';
  const dbPass = process.env.DB_PASS || 'root';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT) || 3306;
  
  // Détecter le dialect selon le port (8889 = MySQL/MAMP, 5432 = PostgreSQL)
  const dialect = dbPort === 8889 || dbPort === 3306 ? 'mysql' : 'postgres';

  console.log('🔧 Configuration de la base de données...');
  console.log(`   Host: ${dbHost}:${dbPort}`);
  console.log(`   User: ${dbUser}`);
  console.log(`   Database: ${dbName}`);
  console.log(`   Dialect: ${dialect}\n`);

  try {
    // Essayer de se connecter directement à la base de données
    let sequelize;
    
    try {
      sequelize = new Sequelize(dbName, dbUser, dbPass, {
        host: dbHost,
        port: dbPort,
        dialect: dialect,
        logging: false
      });
      
      await sequelize.authenticate();
      console.log('✅ Connexion à la base de données réussie\n');
    } catch (connectError) {
      // Si la base n'existe pas, essayer de la créer
      if (connectError.message.includes('does not exist') || 
          connectError.message.includes('database') ||
          connectError.message.includes('Unknown database')) {
        console.log('📦 La base de données n\'existe pas. Création...\n');
        
        // Se connecter à la base système pour créer la DB
        const adminDb = dialect === 'mysql' ? 'mysql' : 'postgres';
        const adminSequelize = new Sequelize(adminDb, dbUser, dbPass, {
          host: dbHost,
          port: dbPort,
          dialect: dialect,
          logging: false
        });

        await adminSequelize.authenticate();
        
        if (dialect === 'mysql') {
          await adminSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        } else {
          await adminSequelize.query(`CREATE DATABASE "${dbName}"`);
        }
        
        await adminSequelize.close();
        
        console.log(`✅ Base de données "${dbName}" créée\n`);
        
        // Reconnecter à la nouvelle base
        sequelize = new Sequelize(dbName, dbUser, dbPass, {
          host: dbHost,
          port: dbPort,
          dialect: dialect,
          logging: false
        });
        await sequelize.authenticate();
      } else {
        throw connectError;
      }
    }

    // Créer la table companies
    console.log('🔄 Création de la table "companies"...\n');
    
    if (dialect === 'mysql') {
      await sequelize.query(`
        DROP TABLE IF EXISTS companies;
      `).catch(() => {});

      await sequelize.query(`
        CREATE TABLE companies (
          id INT AUTO_INCREMENT PRIMARY KEY,
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
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    } else {
      await sequelize.query(`
        DROP TABLE IF EXISTS companies CASCADE;
      `).catch(() => {});

      await sequelize.query(`
        CREATE TABLE companies (
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
    }

    console.log('✅ Table "companies" créée\n');

    // Créer les index
    console.log('🔄 Création des index...\n');
    
    await sequelize.query(`
      CREATE INDEX idx_companies_location ON companies(city, postcode);
    `).catch(() => {});
    
    await sequelize.query(`
      CREATE INDEX idx_companies_sector ON companies(sector);
    `).catch(() => {});
    
    await sequelize.query(`
      CREATE INDEX idx_companies_contacts ON companies(email, phone);
    `).catch(() => {});

    console.log('✅ Index créés\n');

    await sequelize.close();

    console.log('✅ Migration terminée avec succès !');
    console.log(`\n📊 Base de données "${dbName}" prête à l'emploi`);

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error.message);
    if (error.original) {
      console.error('   Détails:', error.original.message);
    }
    console.error('\n💡 Vérifiez que:');
    console.error('   1. Le serveur de base de données est démarré');
    console.error('   2. Les identifiants dans .env sont corrects');
    console.error('   3. Le port est correct');
    process.exit(1);
  }
}

migrateDatabase();
