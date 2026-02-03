/**
 * Point d'entrée Phusion Passenger pour o2switch/cPanel
 *
 * Passenger détecte automatiquement ce fichier et démarre l'application.
 * Il ne faut PAS appeler app.listen() — Passenger gère le binding du port.
 */
const app = require('./index.js');

// Passenger attend que l'app soit exportée
module.exports = app;
