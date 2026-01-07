/**
 * Fonction utilitaire pour échapper les caractères HTML et prévenir les attaques XSS
 */
export const escapeHtml = (text) => {
  if (!text) return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
};

/**
 * Fonction pour sanitizer une URL
 */
export const sanitizeUrl = (url) => {
  if (!url) return '';
  
  // Vérifier que c'est une URL valide (http ou https)
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return '';
    }
    return parsedUrl.toString();
  } catch {
    return '';
  }
};

/**
 * Fonction pour sanitizer un email
 */
export const sanitizeEmail = (email) => {
  if (!email) return '';
  
  // Vérifier le format de l'email et échapper les caractères spéciaux
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return '';
  }
  
  return escapeHtml(email);
};

/**
 * Fonction pour sanitizer un numéro de téléphone
 */
export const sanitizePhone = (phone) => {
  if (!phone) return '';
  
  // Garder uniquement les chiffres, espaces, +, - et parenthèses
  return String(phone).replace(/[^0-9\s\+\-\(\)]/g, '');
};

