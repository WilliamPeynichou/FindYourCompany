const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const sireneService = require('../services/sireneService');
const { Company } = require('../models');

/**
 * Route de recherche d'entreprises
 * POST /api/companies/search
 * Body: { location: { lat, lon, city, postcode }, radius, sector }
 */
router.post('/search', async (req, res) => {
  console.log('📥 Requête reçue:', req.body);
  
  try {
    const { location, radius, sector } = req.body;

    if (!location || !location.lat || !location.lon) {
      return res.status(400).json({ 
        error: 'Localisation requise' 
      });
    }

    // Rechercher dans Sirene
    console.log('🔍 Recherche Sirene...', { 
      city: location.city, 
      postcode: location.postcode, 
      sector,
      radius 
    });
    
    const sireneResults = await sireneService.searchCompanies({
      city: location.city,
      postcode: location.postcode,
      sector: sector,
      radius: radius,
      lat: parseFloat(location.lat),
      lon: parseFloat(location.lon)
    });

    console.log(`✅ ${sireneResults.length} entreprises trouvées`);

    // Filtrer les entreprises avec des données valides (pas de [ND] dans les champs critiques)
    const validCompanies = sireneResults.filter(company => {
      // Vérifier que les champs essentiels ne sont pas vides ou [ND]
      const hasValidName = company.name && 
                          company.name !== '[ND]' && 
                          company.name !== 'Entreprise sans nom';
      const hasValidCity = company.city && company.city !== '[ND]';
      const hasValidAddress = company.address && 
                             company.address !== '[ND]' && 
                             company.address !== 'Adresse non disponible';
      
      return hasValidName && hasValidCity && hasValidAddress;
    });

    console.log(`✅ ${validCompanies.length} entreprises valides (${sireneResults.length - validCompanies.length} filtrées)`);

    // Retourner les résultats filtrés
    res.json({
      companies: validCompanies,
      total: validCompanies.length,
      message: validCompanies.length > 0 
        ? `${validCompanies.length} entreprises trouvées`
        : 'Aucune entreprise trouvée avec des données valides'
    });

  } catch (error) {
    console.error('❌ Erreur recherche:', error.message);
    res.status(500).json({ 
      error: 'Erreur lors de la recherche',
      message: error.message 
    });
  }
});

/**
 * Route pour récupérer les entreprises depuis la base de données
 * GET /api/companies?city=&sector=
 */
router.get('/', async (req, res) => {
  try {
    const { city, sector } = req.query;
    
    const where = {};
    if (city) where.city = city;
    if (sector) where.sector = sector;
    
    // Récupérer toutes les entreprises
    const companies = await Company.findAll({
      where: where,
      limit: 100
    });

    res.json({
      companies,
      total: companies.length
    });
  } catch (error) {
    console.error('Erreur récupération entreprises:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

