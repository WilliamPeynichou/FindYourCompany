require('dotenv').config();
const { Sequelize } = require('sequelize');

/**
 * Script pour créer la base de données et lancer les migrations
 */
async function setupDatabase() {
  const dbName = process.env.DB_NAME || 'findyourcompany';
  const dbUser = process.env.DB_USER || 'root';
  const dbPass = process.env.DB_PASS || 'root';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || 5432;

  console.log('🔧 Configuration de la base de données...');
  console.log(`   Host: ${dbHost}:${dbPort}`);
  console.log(`   User: ${dbUser}`);
  console.log(`   Database: ${dbName}\n`);

  // Se connecter à la base de données par défaut (postgres) pour créer la DB
  const adminSequelize = new Sequelize('postgres', dbUser, dbPass, {
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    logging: false
  });

  try {
    // Vérifier si la base existe déjà
    const [results] = await adminSequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`
    );

    if (results.length === 0) {
      console.log(`📦 Création de la base de données "${dbName}"...`);
      await adminSequelize.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Base de données "${dbName}" créée avec succès\n`);
    } else {
      console.log(`ℹ️  La base de données "${dbName}" existe déjà\n`);
    }

    await adminSequelize.close();

    // Maintenant lancer les migrations
    console.log('🔄 Lancement des migrations...\n');
    const { execSync } = require('child_process');
    
    execSync('npx sequelize-cli db:migrate', {
      stdio: 'inherit',
      cwd: __dirname + '/..'
    });

    console.log('\n✅ Base de données configurée et migrations appliquées avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
    process.exit(1);
  }
}

setupDatabase();

