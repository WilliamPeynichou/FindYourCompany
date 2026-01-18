const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const sireneService = require('../services/sireneService');
const pappersService = require('../services/pappersService');
const rechercheEntreprisesService = require('../services/rechercheEntreprisesService');
const { Company } = require('../models');
const { validateSearchRequest, validateGetCompanies, handleValidationErrors } = require('../middleware/validation');

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Fonction utilitaire pour logger de manière sécurisée
 * Ne log pas les données sensibles en production
 */
const secureLog = (message, data = null) => {
  if (isProduction) {
    console.log(`[API] ${message}`);
  } else {
    console.log(`[API] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
};

/**
 * Fonction utilitaire pour formater les erreurs de manière sécurisée
 */
const formatError = (error, defaultMessage = 'Une erreur est survenue') => {
  return {
    error: defaultMessage,
    message: isProduction ? defaultMessage : error.message,
    // Ne jamais exposer le stack trace en production
    ...((!isProduction && error.stack) ? { stack: error.stack } : {})
  };
};

/**
 * Fonction pour valider et sanitizer les résultats avant envoi
 */
const sanitizeCompanyResults = (companies) => {
  if (!Array.isArray(companies)) return [];
  
  return companies.map(company => {
    // Ne retourner que les champs attendus
    const sanitized = {
      siren: String(company.siren || '').replace(/[^0-9]/g, '').substring(0, 9),
      siret: String(company.siret || '').replace(/[^0-9]/g, '').substring(0, 14),
      name: String(company.name || 'Nom inconnu').substring(0, 200),
      address: String(company.address || 'Adresse inconnue').substring(0, 300),
      city: String(company.city || '').substring(0, 100),
      postcode: String(company.postcode || '').replace(/[^0-9]/g, '').substring(0, 5),
      sector: String(company.sector || '').substring(0, 100),
      sectorLabel: String(company.sectorLabel || '').substring(0, 200),
      source: String(company.source || '').substring(0, 50),
    };

    // Ajouter les champs optionnels s'ils existent
    if (company.email && typeof company.email === 'string') {
      sanitized.email = company.email.substring(0, 254);
    }
    if (company.phone && typeof company.phone === 'string') {
      sanitized.phone = String(company.phone).replace(/[^0-9+\-\s()]/g, '').substring(0, 20);
    }
    if (company.website && typeof company.website === 'string') {
      // Valider que c'est une URL http/https
      try {
        const url = new URL(company.website);
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          sanitized.website = url.toString().substring(0, 500);
        }
      } catch {
        // URL invalide, ne pas inclure
      }
    }
    if (company.lat !== undefined && company.lat !== null) {
      const lat = parseFloat(company.lat);
      if (!isNaN(lat) && lat >= -90 && lat <= 90) {
        sanitized.lat = lat;
      }
    }
    if (company.lon !== undefined && company.lon !== null) {
      const lon = parseFloat(company.lon);
      if (!isNaN(lon) && lon >= -180 && lon <= 180) {
        sanitized.lon = lon;
      }
    }
    if (company.distance !== undefined && company.distance !== null) {
      const distance = parseFloat(company.distance);
      if (!isNaN(distance) && distance >= 0) {
        sanitized.distance = Math.round(distance * 10) / 10;
      }
    }
    if (company.dateCreation) {
      sanitized.dateCreation = String(company.dateCreation).substring(0, 20);
    }
    if (company.formeJuridique) {
      sanitized.formeJuridique = String(company.formeJuridique).substring(0, 100);
    }
    if (company.effectif) {
      sanitized.effectif = String(company.effectif).substring(0, 50);
    }
    if (company.etatAdministratif) {
      sanitized.etatAdministratif = String(company.etatAdministratif).substring(0, 10);
    }
    if (Array.isArray(company.dirigeants)) {
      sanitized.dirigeants = company.dirigeants.slice(0, 10).map(d => ({
        nom: String(d.nom || '').substring(0, 100),
        prenoms: String(d.prenoms || '').substring(0, 100),
        qualite: String(d.qualite || '').substring(0, 100)
      }));
    }

    return sanitized;
  });
};

/**
 * Route de recherche d'entreprises via Sirene
 * POST /api/companies/search
 * Body: { location: { lat, lon, city, postcode }, radius, sector }
 */
router.post('/search', validateSearchRequest, handleValidationErrors, async (req, res) => {
  secureLog('Requête recherche Sirene reçue');
  
  try {
    // Les données sont déjà validées et sanitizées par express-validator
    const { location, radius, sector } = req.body;

    if (!location || !location.lat || !location.lon) {
      return res.status(400).json({ 
        error: 'Localisation requise',
        message: 'Les coordonnées lat/lon sont obligatoires'
      });
    }

    secureLog('Recherche Sirene', { 
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

    // Filtrer les entreprises avec des données valides
    const validCompanies = sireneResults.filter(company => {
      const hasValidName = company.name && 
                          company.name !== '[ND]' && 
                          company.name !== 'Entreprise sans nom';
      const hasValidCity = company.city && company.city !== '[ND]';
      const hasValidAddress = company.address && 
                             company.address !== '[ND]' && 
                             company.address !== 'Adresse non disponible';
      
      return hasValidName && hasValidCity && hasValidAddress;
    });

    secureLog(`${validCompanies.length} entreprises valides trouvées`);

    // Sanitizer et retourner les résultats
    const sanitizedCompanies = sanitizeCompanyResults(validCompanies);

    res.json({
      companies: sanitizedCompanies,
      total: sanitizedCompanies.length,
      message: sanitizedCompanies.length > 0 
        ? `${sanitizedCompanies.length} entreprises trouvées`
        : 'Aucune entreprise trouvée avec des données valides'
    });

  } catch (error) {
    console.error('[ERROR] Recherche Sirene:', error.message);
    res.status(500).json(formatError(error, 'Erreur lors de la recherche'));
  }
});

/**
 * Route de recherche d'entreprises via Pappers
 * POST /api/companies/search-pappers
 * Body: { location: { lat, lon, city, postcode }, radius, sector }
 * Retourne UNIQUEMENT les entreprises avec un email public
 */
router.post('/search-pappers', validateSearchRequest, handleValidationErrors, async (req, res) => {
  secureLog('Requête Pappers reçue');
  
  try {
    // Vérifier que le token Pappers est configuré
    if (!process.env.PAPPERS_API_TOKEN) {
      return res.status(503).json({ 
        error: 'Service indisponible',
        message: 'Le service de recherche Pappers n\'est pas configuré'
      });
    }

    const { location, radius, sector } = req.body;

    if (!location || !location.postcode) {
      return res.status(400).json({ 
        error: 'Code postal requis',
        message: 'Le code postal est obligatoire pour la recherche Pappers'
      });
    }

    // Géocoder le code postal pour avoir les coordonnées centrales
    let centerLat = parseFloat(location.lat);
    let centerLon = parseFloat(location.lon);

    if (!centerLat || !centerLon) {
      secureLog('Géocodage du code postal:', location.postcode);
      const geoData = await pappersService.geocodePostcode(location.postcode);
      centerLat = geoData.lat;
      centerLon = geoData.lon;
    }

    const pappersResults = await pappersService.searchCompanies({
      postcode: location.postcode,
      sector: sector,
      radius: radius || 5,
      centerLat: centerLat,
      centerLon: centerLon
    });

    secureLog(`${pappersResults.length} entreprises avec email trouvées`);

    // Statistiques
    const stats = {
      total: pappersResults.length,
      withEmail: pappersResults.filter(c => c.email).length,
      withPhone: pappersResults.filter(c => c.phone).length,
      withBoth: pappersResults.filter(c => c.email && c.phone).length,
      withWebsite: pappersResults.filter(c => c.website).length
    };

    // Sanitizer les résultats
    const sanitizedCompanies = sanitizeCompanyResults(pappersResults);

    res.json({
      companies: sanitizedCompanies,
      total: sanitizedCompanies.length,
      stats: stats,
      message: sanitizedCompanies.length > 0 
        ? `${sanitizedCompanies.length} entreprises avec email trouvées`
        : 'Aucune entreprise avec email public trouvée dans cette zone'
    });

  } catch (error) {
    console.error('[ERROR] Recherche Pappers:', error.message);
    
    // Déterminer le code de statut HTTP approprié
    let statusCode = 500;
    let errorMessage = 'Erreur lors de la recherche Pappers';
    
    if (error.message.includes('Token') || error.message.includes('token')) {
      statusCode = 503;
      errorMessage = 'Service de recherche temporairement indisponible';
    } else if (error.message.includes('Quota') || error.message.includes('quota')) {
      statusCode = 503;
      errorMessage = 'Quota de recherche atteint';
    } else if (error.message.includes('Trop de requêtes')) {
      statusCode = 429;
      errorMessage = 'Trop de requêtes, veuillez réessayer plus tard';
    } else if (error.message.includes('Code postal')) {
      statusCode = 400;
      errorMessage = 'Code postal invalide';
    }
    
    res.status(statusCode).json(formatError(error, errorMessage));
  }
});

/**
 * Route de recherche d'entreprises via l'API Recherche Entreprises (data.gouv.fr)
 * POST /api/companies/search-gouv
 * Body: { location: { lat, lon, city, postcode }, radius, sector }
 * API GRATUITE - Données légales françaises (pas d'emails/téléphones)
 */
router.post('/search-gouv', validateSearchRequest, handleValidationErrors, async (req, res) => {
  secureLog('Requête API Gouv reçue');
  
  try {
    const { location, radius, sector } = req.body;

    if (!location || (!location.city && !location.postcode)) {
      return res.status(400).json({ 
        error: 'Localisation requise',
        message: 'Ville ou code postal requis pour la recherche'
      });
    }

    // Géocoder le code postal pour avoir les coordonnées centrales
    let centerLat = parseFloat(location.lat);
    let centerLon = parseFloat(location.lon);

    if ((!centerLat || !centerLon) && location.postcode) {
      try {
        const geoData = await rechercheEntreprisesService.geocodePostcode(location.postcode);
        centerLat = geoData.lat;
        centerLon = geoData.lon;
      } catch (geoError) {
        secureLog('Géocodage échoué, recherche sans filtre de distance');
      }
    }

    const results = await rechercheEntreprisesService.searchCompanies({
      city: location.city,
      postcode: location.postcode,
      sector: sector,
      radius: radius || 5,
      centerLat: centerLat,
      centerLon: centerLon
    });

    secureLog(`${results.length} entreprises trouvées`);

    // Statistiques
    const stats = {
      total: results.length,
      withCoordinates: results.filter(c => c.lat && c.lon).length,
      active: results.filter(c => c.etatAdministratif === 'A').length,
      withDirigeants: results.filter(c => c.dirigeants && c.dirigeants.length > 0).length
    };

    // Sanitizer les résultats
    const sanitizedCompanies = sanitizeCompanyResults(results);

    res.json({
      companies: sanitizedCompanies,
      total: sanitizedCompanies.length,
      stats: stats,
      source: 'API Recherche Entreprises (data.gouv.fr)',
      note: 'Cette API gratuite ne fournit pas les emails/téléphones.',
      message: sanitizedCompanies.length > 0 
        ? `${sanitizedCompanies.length} entreprises trouvées`
        : 'Aucune entreprise trouvée dans cette zone'
    });

  } catch (error) {
    console.error('[ERROR] Recherche API Gouv:', error.message);
    res.status(500).json(formatError(error, 'Erreur lors de la recherche'));
  }
});

/**
 * Route pour récupérer les entreprises depuis la base de données
 * GET /api/companies?city=&sector=&limit=&page=
 */
router.get('/', validateGetCompanies, handleValidationErrors, async (req, res) => {
  try {
    const { city, sector, limit = 50, page = 1 } = req.query;
    
    const where = {};
    if (city) where.city = city;
    if (sector) where.sector = sector;
    
    // Pagination sécurisée
    const safeLimit = Math.min(Math.max(1, parseInt(limit) || 50), 100);
    const safePage = Math.max(1, parseInt(page) || 1);
    const offset = (safePage - 1) * safeLimit;
    
    const { count, rows: companies } = await Company.findAndCountAll({
      where: where,
      limit: safeLimit,
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    // Sanitizer les résultats
    const sanitizedCompanies = sanitizeCompanyResults(companies);

    res.json({
      companies: sanitizedCompanies,
      total: count,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(count / safeLimit)
    });
  } catch (error) {
    console.error('[ERROR] Récupération entreprises:', error.message);
    res.status(500).json(formatError(error, 'Erreur lors de la récupération'));
  }
});

module.exports = router;
