'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    static associate(models) {
      // associations can be defined here
    }
  }
  Company.init({
    siret: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    postcode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sector: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lat: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      get() {
        const value = this.getDataValue('lat');
        return value ? parseFloat(value) : null;
      }
    },
    lon: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      get() {
        const value = this.getDataValue('lon');
        return value ? parseFloat(value) : null;
      }
    },
    source: {
      type: DataTypes.STRING,
      defaultValue: 'sirene'
    }
  }, {
    sequelize,
    modelName: 'Company',
    tableName: 'companies',
    underscored: true, // Utiliser snake_case pour les colonnes
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['city', 'postcode']
      },
      {
        fields: ['sector']
      },
      {
        fields: ['email', 'phone']
      }
    ]
  });
  return Company;
};

