const { body, query, validationResult } = require('express-validator');

/**
 * Middleware pour valider les données de recherche d'entreprises
 */
const validateSearchRequest = [
  // Validation de la localisation
  body('location')
    .exists()
    .withMessage('La localisation est requise')
    .isObject()
    .withMessage('La localisation doit être un objet'),
  
  body('location.lat')
    .exists()
    .withMessage('La latitude est requise')
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitude doit être un nombre entre -90 et 90')
    .customSanitizer(value => {
      // Sanitizer : s'assurer que c'est un nombre valide
      const num = parseFloat(value);
      return isNaN(num) ? null : num.toFixed(8);
    }),
  
  body('location.lon')
    .exists()
    .withMessage('La longitude est requise')
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitude doit être un nombre entre -180 et 180')
    .customSanitizer(value => {
      const num = parseFloat(value);
      return isNaN(num) ? null : num.toFixed(8);
    }),
  
  body('location.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Le nom de la ville ne doit pas dépasser 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s\-'\.]+$/)
    .withMessage('Le nom de la ville contient des caractères invalides')
    .customSanitizer(value => {
      // Échapper les caractères spéciaux pour éviter XSS
      if (!value) return null;
      return value.replace(/[<>\"']/g, '');
    }),
  
  body('location.postcode')
    .optional()
    .trim()
    .matches(/^[0-9]{5}$/)
    .withMessage('Le code postal doit contenir exactement 5 chiffres')
    .customSanitizer(value => {
      // S'assurer que c'est uniquement des chiffres
      if (!value) return null;
      return value.replace(/[^0-9]/g, '');
    }),
  
  body('location.label')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Le label ne doit pas dépasser 200 caractères')
    .customSanitizer(value => {
      if (!value) return null;
      // Échapper les caractères HTML pour éviter XSS
      return value.replace(/[<>\"']/g, '');
    }),
  
  // Validation du rayon
  body('radius')
    .optional()
    .isInt({ min: 0, max: 200 })
    .withMessage('Le rayon doit être un nombre entre 0 et 200 km')
    .customSanitizer(value => {
      const num = parseInt(value);
      return isNaN(num) ? 20 : Math.max(0, Math.min(200, num));
    }),
  
  // Validation du secteur
  body('sector')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Le secteur ne doit pas dépasser 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\/\-\.]+$/)
    .withMessage('Le secteur contient des caractères invalides')
    .customSanitizer(value => {
      if (!value) return null;
      // Échapper les caractères spéciaux
      return value.replace(/[<>\"']/g, '');
    }),
];

/**
 * Middleware pour valider les paramètres de requête GET
 */
const validateGetCompanies = [
  query('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Le nom de la ville ne doit pas dépasser 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s\-'\.]+$/)
    .withMessage('Le nom de la ville contient des caractères invalides')
    .customSanitizer(value => {
      if (!value) return null;
      return value.replace(/[<>\"']/g, '');
    }),
  
  query('sector')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Le secteur ne doit pas dépasser 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ0-9\s\/\-\.]+$/)
    .withMessage('Le secteur contient des caractères invalides')
    .customSanitizer(value => {
      if (!value) return null;
      return value.replace(/[<>\"']/g, '');
    }),
];

/**
 * Middleware pour gérer les erreurs de validation
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Erreur de validation',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  validateSearchRequest,
  validateGetCompanies,
  handleValidationErrors
};

