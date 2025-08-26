const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

console.log('🚀 Starting Contact Keeper Server...');

const app = express();

// Configuration
const DEFAULT_PORT = 5000;
const DEFAULT_MONGO_URI = 'mongodb+srv://Safae:Safae%26Azizi123@cluster0.bzczjev.mongodb.net/contactkeeper?retryWrites=true&w=majority';

const mongoUri = process.env.MONGO_URI || DEFAULT_MONGO_URI;

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
    timestamp: new Date().toISOString() 
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

// MongoDB connection (optional for testing routes)
const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    console.log('⚠️  Continuing without database...');
  }
};

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
});

// Error handling
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
