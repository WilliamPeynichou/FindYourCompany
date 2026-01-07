'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('companies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      siret: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false
      },
      postcode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      website: {
        type: Sequelize.STRING,
        allowNull: true
      },
      sector: {
        type: Sequelize.STRING,
        allowNull: true
      },
      lat: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true
      },
      lon: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true
      },
      source: {
        type: Sequelize.STRING,
        defaultValue: 'sirene'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Index pour améliorer les performances de recherche
    await queryInterface.addIndex('companies', ['city', 'postcode'], {
      name: 'idx_companies_location'
    });
    await queryInterface.addIndex('companies', ['sector'], {
      name: 'idx_companies_sector'
    });
    await queryInterface.addIndex('companies', ['email', 'phone'], {
      name: 'idx_companies_contacts'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('companies');
  }
};
