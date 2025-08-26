const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config(); // Charge les variables d'environnement


console.log('🚀 Starting Contact Keeper Server...');

const app = express();

// Configuration
const DEFAULT_PORT = 5000;
const mongoUri = process.env.MONGO_URI; // Utilise uniquement la variable d'environnement
if (!mongoUri) {
  console.error('❌ MONGO_URI is not defined in .env');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json({ extended: false }));

console.log('✅ Basic middleware loaded');

// Route racine simple pour la page d'accueil (ou test)
app.get('/', (req, res) => {
  res.send('Bienvenue sur Contact Keeper API. Utilisez /api/users, /api/auth ou /api/contacts');
});

// Test route to confirm server is working
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is working!', 
    timestamp: new Date().toISOString(),
    mongoUri: mongoUri // Ajout pour debug
  });
});

// Check if route files exist before loading
const routeFiles = [
  { path: './routes/users.js', route: '/api/users' },
  { path: './routes/auth.js', route: '/api/auth' },
  { path: './routes/contacts.js', route: '/api/contacts' }
];

routeFiles.forEach(({ path: routePath, route }) => {
  const fullPath = path.join(__dirname, routePath);
  console.log(`🔍 Checking route file: ${fullPath}`);
  
  if (fs.existsSync(fullPath)) {
    try {
      console.log(`📁 File exists, attempting to load: ${routePath}`);
      const routeModule = require(routePath);
      app.use(route, routeModule);
      console.log(`✅ Successfully loaded route: ${route}`);
    } catch (error) {
      console.error(`❌ Error loading route ${route}:`, error.message);
      console.error(`   Full error:`, error);
    }
  } else {
    console.error(`❌ Route file not found: ${fullPath}`);
  }
});

// List all registered routes for debugging
console.log('\n📋 Registered routes:');
app._router.stack.forEach((middleware, index) => {
  if (middleware.route) {
    // Direct route
    console.log(`   ${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    // Router middleware
    console.log(`   Router middleware at index ${index}`);
    if (middleware.regexp.source) {
      console.log(`   Pattern: ${middleware.regexp.source}`);
    }
  }
});

// Catch all route for debugging
app.use('*', (req, res) => {
  console.log(`⚠️  Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: routeFiles.map(r => r.route),
    serverTime: new Date().toISOString()
  });
});

// MongoDB connection - Configuration pour Docker Compose
const connectDB = async () => {
  try {
    console.log(`🔌 Attempting to connect to MongoDB: ${mongoUri}`);
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Augmenté pour Docker
      connectTimeoutMS: 30000,
      maxPoolSize: 10, // Limite du pool de connexions
      retryWrites: true,
    };

    await mongoose.connect(mongoUri, options);
    
    console.log('✅ MongoDB Connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🏠 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    console.log('💡 Make sure MongoDB container is running and accessible');
    console.log('🐳 In Docker: mongodb://mongodb:27017');
    console.log('🏠 Locally: mongodb://localhost:27017');
    console.log('⚠️  Continuing without database...');
    
    // Retry connection after delay
    setTimeout(connectDB, 5000);
  }
};

// Gestion des événements de connexion MongoDB
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose disconnected');
});

connectDB();

// Start server
const PORT = process.env.PORT || DEFAULT_PORT;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server started successfully!`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`🧪 Test URL: http://localhost:${PORT}/test`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📞 Contacts API: http://localhost:${PORT}/api/contacts`);
  console.log(`\n💡 MongoDB URI: ${mongoUri}`);
  console.log(`🐳 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.DOCKER_ENV) {
    console.log(`🚢 Running in Docker container`);
  }
});

// Error handling
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  mongoose.connection.close(() => {
    server.close(() => {
      console.log('Process terminated');
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully');
  mongoose.connection.close(() => {
    server.close(() => {
      console.log('Process terminated');
    });
  });
});