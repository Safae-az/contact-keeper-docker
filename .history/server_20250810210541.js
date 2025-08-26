const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); // Ajout de l'import CORS

const app = express();

// Configuration avec valeurs par défaut sécurisées
const DEFAULT_PORT = 5000;
const DEFAULT_MONGO_URI = 'mongodb://localhost:27017/contactkeeper';

// Configuration MongoDB
const mongoUri = process.env.MONGO_URI || DEFAULT_MONGO_URI;

// Connexion à MongoDB avec gestion d'erreur améliorée
const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Database connection error:', err.message);
    // Réessai après 5 secondes
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Middleware
app.use(cors()); // Activation de CORS - doit être avant les routes
app.use(express.json({ extended: false }));

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contacts', require('./routes/contacts'));

// Production Configuration
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Port Configuration
const PORT = process.env.PORT || DEFAULT_PORT;

// Démarrage du serveur avec gestion d'erreur
const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB URI: ${mongoUri}`);
});

// Gestion des erreurs
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});