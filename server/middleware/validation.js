const { body, query, validationResult } = require('express-validator');

/**
 * Liste blanche des secteurs d'activité valides
 * Doit correspondre aux IDs définis dans SectorSelect.jsx
 */
const VALID_SECTORS = [
  'tech', 'btp', 'sante', 'social', 'commerce', 'commerce-gros',
  'restauration', 'hotellerie', 'banque', 'assurance', 'industrie',
  'agriculture', 'transport', 'logistique', 'conseil', 'juridique',
  'comptabilite', 'immobilier', 'communication', 'design', 'formation',
  'beaute', 'sport', 'reparation', 'nettoyage', 'securite'
];

/**
 * Fonction utilitaire pour nettoyer les chaînes de caractères
 */
const sanitizeString = (value, maxLength = 100) => {
  if (!value || typeof value !== 'string') return null;
  // Supprimer les caractères de contrôle et limiter la longueur
  return value
    .replace(/[\x00-\x1F\x7F]/g, '') // Supprimer les caractères de contrôle
    .replace(/[<>\"'`\\]/g, '') // Supprimer les caractères dangereux
    .trim()
    .substring(0, maxLength);
};

/**
 * Fonction utilitaire pour valider et nettoyer les coordonnées GPS
 */
const sanitizeCoordinate = (value, min, max) => {
  const num = parseFloat(value);
  if (isNaN(num) || num < min || num > max) {
    return null;
  }
  // Limiter à 8 décimales (précision suffisante)
  return parseFloat(num.toFixed(8));
};

/**
 * Middleware pour valider les données de recherche d'entreprises
 */
const validateSearchRequest = [
  // Validation de la localisation
  body('location')
    .exists()
    .withMessage('La localisation est requise')
    .isObject()
    .withMessage('La localisation doit être un objet')
    .custom((value) => {
      // Vérifier que l'objet ne contient pas de propriétés inattendues
      const allowedKeys = ['lat', 'lon', 'city', 'postcode', 'label', 'codeCommune', 'departement', 'codeDepartement'];
      const keys = Object.keys(value || {});
      const invalidKeys = keys.filter(k => !allowedKeys.includes(k));
      if (invalidKeys.length > 0) {
        throw new Error(`Propriétés non autorisées: ${invalidKeys.join(', ')}`);
      }
      return true;
    }),
  
  body('location.lat')
    .exists()
    .withMessage('La latitude est requise')
    .custom((value) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < -90 || num > 90) {
        throw new Error('La latitude doit être un nombre entre -90 et 90');
      }
      return true;
    })
    .customSanitizer(value => sanitizeCoordinate(value, -90, 90)),
  
  body('location.lon')
    .exists()
    .withMessage('La longitude est requise')
    .custom((value) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < -180 || num > 180) {
        throw new Error('La longitude doit être un nombre entre -180 et 180');
      }
      return true;
    })
    .customSanitizer(value => sanitizeCoordinate(value, -180, 180)),
  
  body('location.city')
    .optional()
    .isString()
    .withMessage('La ville doit être une chaîne de caractères')
    .isLength({ max: 100 })
    .withMessage('Le nom de la ville ne doit pas dépasser 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s\-'\.]+$/)
    .withMessage('Le nom de la ville contient des caractères invalides')
    .customSanitizer(value => sanitizeString(value, 100)),
  
  body('location.postcode')
    .optional()
    .isString()
    .withMessage('Le code postal doit être une chaîne de caractères')
    .matches(/^[0-9]{5}$/)
    .withMessage('Le code postal doit contenir exactement 5 chiffres')
    .customSanitizer(value => {
      if (!value) return null;
      // S'assurer que c'est uniquement des chiffres
      const clean = String(value).replace(/[^0-9]/g, '');
      return clean.length === 5 ? clean : null;
    }),
  
  body('location.label')
    .optional()
    .isString()
    .withMessage('Le label doit être une chaîne de caractères')
    .isLength({ max: 200 })
    .withMessage('Le label ne doit pas dépasser 200 caractères')
    .customSanitizer(value => sanitizeString(value, 200)),

  body('location.codeCommune')
    .optional()
    .isString()
    .matches(/^[0-9A-Za-z]{5}$/)
    .withMessage('Le code commune doit être un code INSEE valide')
    .customSanitizer(value => sanitizeString(value, 5)),

  body('location.departement')
    .optional()
    .isString()
    .isLength({ max: 50 })
    .customSanitizer(value => sanitizeString(value, 50)),

  body('location.codeDepartement')
    .optional()
    .isString()
    .matches(/^[0-9]{2,3}$/)
    .withMessage('Le code département doit contenir 2 ou 3 chiffres')
    .customSanitizer(value => sanitizeString(value, 3)),
  
  // Validation du rayon
  body('radius')
    .optional()
    .custom((value) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 0 || num > 200) {
        throw new Error('Le rayon doit être un nombre entre 0 et 200 km');
      }
      return true;
    })
    .customSanitizer(value => {
      const num = parseInt(value, 10);
      if (isNaN(num)) return 20; // Valeur par défaut
      return Math.max(0, Math.min(200, num));
    }),
  
  // Validation du secteur avec whitelist
  body('sector')
    .optional()
    .isString()
    .withMessage('Le secteur doit être une chaîne de caractères')
    .custom((value) => {
      if (value && value.trim() !== '' && !VALID_SECTORS.includes(value)) {
        throw new Error(`Secteur invalide. Valeurs acceptées: ${VALID_SECTORS.join(', ')}`);
      }
      return true;
    })
    .customSanitizer(value => {
      if (!value || !VALID_SECTORS.includes(value)) return null;
      return value;
    }),
];

/**
 * Middleware pour valider les paramètres de requête GET
 */
const validateGetCompanies = [
  query('city')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Le nom de la ville ne doit pas dépasser 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s\-'\.]+$/)
    .withMessage('Le nom de la ville contient des caractères invalides')
    .customSanitizer(value => sanitizeString(value, 100)),
  
  query('sector')
    .optional()
    .isString()
    .custom((value) => {
      if (value && value.trim() !== '' && !VALID_SECTORS.includes(value)) {
        throw new Error('Secteur invalide');
      }
      return true;
    })
    .customSanitizer(value => {
      if (!value || !VALID_SECTORS.includes(value)) return null;
      return value;
    }),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100')
    .customSanitizer(value => {
      const num = parseInt(value, 10);
      return isNaN(num) ? 50 : Math.max(1, Math.min(100, num));
    }),

  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('La page doit être entre 1 et 1000')
    .customSanitizer(value => {
      const num = parseInt(value, 10);
      return isNaN(num) ? 1 : Math.max(1, Math.min(1000, num));
    }),
];

/**
 * Middleware pour gérer les erreurs de validation
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Logger les erreurs de validation de manière sécurisée
    const sanitizedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    
    console.warn(`[VALIDATION] Requête invalide: ${JSON.stringify(sanitizedErrors)}`);
    
    return res.status(400).json({
      error: 'Erreur de validation',
      details: sanitizedErrors
    });
  }
  next();
};

/**
 * Export des secteurs valides pour utilisation dans d'autres modules
 */
module.exports = {
  validateSearchRequest,
  validateGetCompanies,
  handleValidationErrors,
  VALID_SECTORS
};
