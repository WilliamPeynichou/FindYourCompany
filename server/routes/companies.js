const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const sireneService = require('../services/sireneService');
const pappersService = require('../services/pappersService');
const rechercheEntreprisesService = require('../services/rechercheEntreprisesService');
const { Company } = require('../models');
const { validateSearchRequest, validateGetCompanies, handleValidationErrors } = require('../middleware/validation');

/**
 * Route de recherche d'entreprises
 * POST /api/companies/search
 * Body: { location: { lat, lon, city, postcode }, radius, sector }
 */
router.post('/search', validateSearchRequest, handleValidationErrors, async (req, res) => {
  console.log('📥 Requête reçue:', req.body);
  
  try {
    // Les données sont déjà validées et sanitizées par express-validator
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
 * Route de recherche d'entreprises via Pappers
 * POST /api/companies/search-pappers
 * Body: { location: { lat, lon, city, postcode }, radius, sector }
 * Retourne UNIQUEMENT les entreprises avec un email public
 */
router.post('/search-pappers', validateSearchRequest, handleValidationErrors, async (req, res) => {
  console.log('📥 Requête Pappers reçue:', req.body);
  
  try {
    // Vérifier que le token Pappers est configuré
    if (!process.env.PAPPERS_API_TOKEN) {
      return res.status(500).json({ 
        error: 'Configuration manquante',
        message: 'Le token API Pappers n\'est pas configuré. Ajoutez PAPPERS_API_TOKEN dans votre fichier .env'
      });
    }

    const { location, radius, sector } = req.body;

    if (!location || !location.postcode) {
      return res.status(400).json({ 
        error: 'Code postal requis pour la recherche Pappers' 
      });
    }

    // Géocoder le code postal pour avoir les coordonnées centrales
    let centerLat = parseFloat(location.lat);
    let centerLon = parseFloat(location.lon);

    // Si pas de coordonnées fournies, géocoder le code postal
    if (!centerLat || !centerLon) {
      console.log('🌍 Géocodage du code postal:', location.postcode);
      const geoData = await pappersService.geocodePostcode(location.postcode);
      centerLat = geoData.lat;
      centerLon = geoData.lon;
      console.log(`📍 Coordonnées: ${centerLat}, ${centerLon}`);
    }

    // Rechercher via Pappers
    console.log('🔍 Recherche Pappers...', { 
      postcode: location.postcode, 
      sector,
      radius 
    });
    
    const pappersResults = await pappersService.searchCompanies({
      postcode: location.postcode,
      sector: sector,
      radius: radius || 5,
      centerLat: centerLat,
      centerLon: centerLon
    });

    console.log(`✅ ${pappersResults.length} entreprises avec email trouvées`);

    // Statistiques
    const stats = {
      total: pappersResults.length,
      withEmail: pappersResults.filter(c => c.email).length,
      withPhone: pappersResults.filter(c => c.phone).length,
      withBoth: pappersResults.filter(c => c.email && c.phone).length,
      withWebsite: pappersResults.filter(c => c.website).length
    };

    // Retourner les résultats
    res.json({
      companies: pappersResults,
      total: pappersResults.length,
      stats: stats,
      message: pappersResults.length > 0 
        ? `${pappersResults.length} entreprises avec email trouvées dans un rayon de ${radius}km`
        : 'Aucune entreprise avec email public trouvée dans cette zone'
    });

  } catch (error) {
    console.error('❌ Erreur recherche Pappers:');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    
    // Déterminer le code de statut HTTP approprié
    let statusCode = 500;
    if (error.message.includes('Token') || error.message.includes('token')) {
      statusCode = 401;
    } else if (error.message.includes('Quota') || error.message.includes('quota')) {
      statusCode = 402;
    } else if (error.message.includes('Trop de requêtes')) {
      statusCode = 429;
    } else if (error.message.includes('Code postal')) {
      statusCode = 400;
    }
    
    res.status(statusCode).json({ 
      error: 'Erreur lors de la recherche Pappers',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * Route de recherche d'entreprises via l'API Recherche Entreprises (data.gouv.fr)
 * POST /api/companies/search-gouv
 * Body: { location: { lat, lon, city, postcode }, radius, sector }
 * API GRATUITE - Données légales françaises (pas d'emails/téléphones)
 */
router.post('/search-gouv', validateSearchRequest, handleValidationErrors, async (req, res) => {
  console.log('📥 Requête API Gouv reçue:', req.body);
  
  try {
    const { location, radius, sector } = req.body;

    if (!location || (!location.city && !location.postcode)) {
      return res.status(400).json({ 
        error: 'Ville ou code postal requis pour la recherche' 
      });
    }

    // Géocoder le code postal pour avoir les coordonnées centrales
    let centerLat = parseFloat(location.lat);
    let centerLon = parseFloat(location.lon);

    // Si pas de coordonnées fournies, géocoder le code postal
    if ((!centerLat || !centerLon) && location.postcode) {
      console.log('🌍 Géocodage du code postal:', location.postcode);
      try {
        const geoData = await rechercheEntreprisesService.geocodePostcode(location.postcode);
        centerLat = geoData.lat;
        centerLon = geoData.lon;
        console.log(`📍 Coordonnées: ${centerLat}, ${centerLon}`);
      } catch (geoError) {
        console.warn('⚠️ Géocodage échoué, recherche sans filtre de distance');
      }
    }

    // Rechercher via l'API Recherche Entreprises
    console.log('🔍 Recherche API Gouv...', { 
      city: location.city,
      postcode: location.postcode, 
      sector,
      radius 
    });
    
    const results = await rechercheEntreprisesService.searchCompanies({
      city: location.city,
      postcode: location.postcode,
      sector: sector,
      radius: radius || 5,
      centerLat: centerLat,
      centerLon: centerLon
    });

    console.log(`✅ ${results.length} entreprises trouvées`);

    // Statistiques
    const stats = {
      total: results.length,
      withCoordinates: results.filter(c => c.lat && c.lon).length,
      active: results.filter(c => c.etatAdministratif === 'A').length,
      withDirigeants: results.filter(c => c.dirigeants && c.dirigeants.length > 0).length
    };

    // Retourner les résultats
    res.json({
      companies: results,
      total: results.length,
      stats: stats,
      source: 'API Recherche Entreprises (data.gouv.fr)',
      note: 'Cette API gratuite ne fournit pas les emails/téléphones. Utilisez un service d\'enrichissement si nécessaire.',
      message: results.length > 0 
        ? `${results.length} entreprises trouvées dans un rayon de ${radius}km`
        : 'Aucune entreprise trouvée dans cette zone'
    });

  } catch (error) {
    console.error('❌ Erreur recherche API Gouv:');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    
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
router.get('/', validateGetCompanies, handleValidationErrors, async (req, res) => {
  try {
    // Les paramètres sont déjà validés et sanitizés
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

