// Importation des modules nécessaires
const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

// Créer une instance de l'application Express
const app = express();
app.use(express.json());  // Middleware pour parser les requêtes JSON

// Configurer la connexion à la base de données PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Vérifier la connexion à la base de données
pool.connect()
  .then(() => {
    console.log("Connecté à la base de données PostgreSQL");
  })
  .catch(err => {
    console.error("Impossible de se connecter à la base de données", err);
  });

// Route d'exemple pour récupérer des utilisateurs
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);  // Envoie la réponse JSON à l'application Android
  } catch (err) {
    console.error("Erreur lors de la récupération des utilisateurs", err);
    res.status(500).send("Erreur serveur");
  }
});

// Route pour enregistrer un utilisateur
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *', [email, password]);
    res.status(201).json(result.rows[0]);  // Retourner l'utilisateur créé
  } catch (err) {
    console.error("Erreur lors de l'enregistrement", err);
    res.status(500).send("Erreur serveur");
  }
});

// Route pour se connecter (login)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);  // L'utilisateur existe
    } else {
      res.status(404).send("Utilisateur non trouvé");
    }
  } catch (err) {
    console.error("Erreur lors de la connexion", err);
    res.status(500).send("Erreur serveur");
  }
});

// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});