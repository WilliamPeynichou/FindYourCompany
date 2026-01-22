'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
require('dotenv').config();

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const db = {};

// Vérifier si la base de données est configurée
const isDatabaseConfigured = () => {
  // En production, vérifier DATABASE_URL
  if (env === 'production') {
    return !!process.env.DATABASE_URL;
  }
  // En développement, vérifier les variables d'environnement ou utiliser les valeurs par défaut
  return !!(process.env.DB_NAME || process.env.DB_HOST);
};

let sequelize = null;

try {
  if (!isDatabaseConfigured()) {
    console.log('⚠️  Base de données non configurée - Le serveur fonctionnera sans BDD');
  } else {
    const config = require(__dirname + '/../config/config.json')[env];
    
    if (config.use_env_variable && process.env[config.use_env_variable]) {
      sequelize = new Sequelize(process.env[config.use_env_variable], config);
    } else if (process.env.DB_NAME || config.database) {
      const dbPort = parseInt(process.env.DB_PORT) || config.port || 3306;
      const dialect = dbPort === 8889 || dbPort === 3306 ? 'mysql' : 'postgres';
      
      sequelize = new Sequelize(
        process.env.DB_NAME || config.database,
        process.env.DB_USER || config.username,
        process.env.DB_PASS || config.password,
        {
          host: process.env.DB_HOST || config.host,
          port: dbPort,
          dialect: dialect,
          logging: config.logging
        }
      );
    }

    if (sequelize) {
      // Charger les modèles uniquement si sequelize est configuré
      fs
        .readdirSync(__dirname)
        .filter(file => {
          return (
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js' &&
            file.indexOf('.test.js') === -1
          );
        })
        .forEach(file => {
          const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
          db[model.name] = model;
        });

      Object.keys(db).forEach(modelName => {
        if (db[modelName].associate) {
          db[modelName].associate(db);
        }
      });
    }
  }
} catch (error) {
  console.log('⚠️  Erreur de configuration BDD:', error.message);
  console.log('   Le serveur continuera sans base de données');
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
