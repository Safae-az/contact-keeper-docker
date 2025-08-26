#!/bin/bash

# Script de déploiement automatique pour Contact Keeper
echo "🚀 Démarrage du déploiement..."

# Arrêter les services existants
echo "⏹️  Arrêt des services existants..."
docker-compose down

# Construire les images
echo "🏗️  Construction des images..."
docker-compose build

# Démarrer les services
echo "🚀 Démarrage des services..."
docker-compose up -d

# Attendre que les services soient opérationnels
echo "⏳ Attente du démarrage des services..."
sleep 30

# Vérification du déploiement
echo "🔍 Vérification du déploiement..."

# Vérifier MongoDB
if docker exec mongodb mongosh --eval "db.adminCommand('ping')" | grep -q "ok"; then
    echo "✅ MongoDB est opérationnel"
else
    echo "❌ MongoDB ne répond pas"
    exit 1
fi

# Vérifier le backend
if curl -s http://localhost:5003/health | grep -q "healthy"; then
    echo "✅ Backend est opérationnel"
else
    echo "❌ Backend ne répond pas"
    exit 1
fi

# Vérifier le frontend
if curl -s http://localhost > /dev/null; then
    echo "✅ Frontend est opérationnel"
else
    echo "❌ Frontend ne répond pas"
    exit 1
fi

echo "🎉 Déploiement réussi! Application disponible sur http://localhost"