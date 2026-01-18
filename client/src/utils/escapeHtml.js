/**
 * Utilitaires de sécurité pour l'échappement et la validation des données
 * Prévention des attaques XSS et injection
 */

/**
 * Caractères HTML dangereux à échapper
 */
const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

/**
 * Échappe les caractères HTML pour prévenir les attaques XSS
 * @param {*} text - Le texte à échapper
 * @returns {string} - Le texte échappé
 */
export const escapeHtml = (text) => {
  if (text === null || text === undefined) return '';
  if (typeof text !== 'string') {
    text = String(text);
  }
  
  // Supprimer les caractères de contrôle (sauf les espaces normaux)
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Échapper les caractères HTML
  return text.replace(/[&<>"'`=\/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
};

/**
 * Valide et sanitize une URL
 * @param {string} url - L'URL à valider
 * @returns {string} - L'URL sanitizée ou une chaîne vide si invalide
 */
export const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  
  // Supprimer les espaces
  url = url.trim();
  
  // Liste des protocoles autorisés
  const allowedProtocols = ['http:', 'https:'];
  
  // Liste des patterns dangereux
  const dangerousPatterns = [
    /^javascript:/i,
    /^data:/i,
    /^vbscript:/i,
    /^file:/i,
    /^blob:/i
  ];
  
  // Vérifier les patterns dangereux
  for (const pattern of dangerousPatterns) {
    if (pattern.test(url)) {
      return '';
    }
  }
  
  try {
    const parsedUrl = new URL(url);
    
    // Vérifier le protocole
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return '';
    }
    
    // Vérifier que le hostname n'est pas vide
    if (!parsedUrl.hostname || parsedUrl.hostname.length === 0) {
      return '';
    }
    
    // Limiter la longueur
    const sanitizedUrl = parsedUrl.toString();
    if (sanitizedUrl.length > 2048) {
      return '';
    }
    
    return sanitizedUrl;
  } catch {
    return '';
  }
};

/**
 * Regex stricte pour validation d'email selon RFC 5322 (simplifiée)
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Valide et sanitize un email
 * @param {string} email - L'email à valider
 * @returns {string} - L'email sanitizé ou une chaîne vide si invalide
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  
  // Supprimer les espaces et convertir en minuscules
  email = email.trim().toLowerCase();
  
  // Limiter la longueur (RFC 5321)
  if (email.length > 254) {
    return '';
  }
  
  // Vérifier le format
  if (!EMAIL_REGEX.test(email)) {
    return '';
  }
  
  // Vérifier qu'il n'y a pas de caractères dangereux
  if (/[<>"'\\]/.test(email)) {
    return '';
  }
  
  return email;
};

/**
 * Valide et sanitize un numéro de téléphone
 * @param {string} phone - Le numéro à valider
 * @returns {string} - Le numéro sanitizé ou une chaîne vide si invalide
 */
export const sanitizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  
  // Garder uniquement les chiffres, espaces, +, - et parenthèses
  const sanitized = String(phone).replace(/[^0-9\s+\-()]/g, '');
  
  // Limiter la longueur
  if (sanitized.length > 20) {
    return sanitized.substring(0, 20);
  }
  
  // Vérifier qu'il y a au moins quelques chiffres
  const digitsOnly = sanitized.replace(/[^0-9]/g, '');
  if (digitsOnly.length < 6) {
    return '';
  }
  
  return sanitized;
};

/**
 * Vérifie si une chaîne contient des caractères potentiellement dangereux
 * @param {string} text - Le texte à vérifier
 * @returns {boolean} - true si le texte est sûr
 */
export const isSafeText = (text) => {
  if (!text || typeof text !== 'string') return true;
  
  // Patterns dangereux à détecter
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick=, onerror=, etc.
    /data:/i,
    /vbscript:/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<link/i,
    /<meta/i,
    /expression\s*\(/i, // CSS expression()
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(text)) {
      return false;
    }
  }
  
  return true;
};

/**
 * Tronque un texte de manière sécurisée
 * @param {string} text - Le texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} - Le texte tronqué
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') return '';
  
  const sanitized = escapeHtml(text);
  
  if (sanitized.length <= maxLength) {
    return sanitized;
  }
  
  return sanitized.substring(0, maxLength - 3) + '...';
};

/**
 * Sanitize un objet complet (utile pour les données d'API)
 * @param {object} obj - L'objet à sanitizer
 * @param {number} maxDepth - Profondeur maximale de récursion
 * @returns {object} - L'objet sanitizé
 */
export const sanitizeObject = (obj, maxDepth = 5) => {
  if (maxDepth <= 0) return null;
  
  if (obj === null || obj === undefined) return null;
  
  if (typeof obj === 'string') {
    return escapeHtml(obj);
  }
  
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.slice(0, 1000).map(item => sanitizeObject(item, maxDepth - 1));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    const keys = Object.keys(obj).slice(0, 100); // Limiter le nombre de clés
    
    for (const key of keys) {
      // Sanitizer la clé aussi
      const safeKey = escapeHtml(String(key)).substring(0, 100);
      sanitized[safeKey] = sanitizeObject(obj[key], maxDepth - 1);
    }
    
    return sanitized;
  }
  
  return null;
};