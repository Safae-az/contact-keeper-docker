#!/bin/bash

# Script de déploiement automatique pour Contact Keeper
echo "🚀 Démarrage du déploiement avec VOTRE configuration..."

# Arrêter les services existants
echo "⏹️  Arrêt des services existants..."
docker-compose down

# Construire les images (utilise VOS Dockerfiles)
echo "🏗️  Construction des images..."
docker-compose build

# Démarrer d'abord MongoDB seul
echo "🐳 Démarrage de MongoDB en premier..."
docker-compose up -d mongodb

# Attendre que MongoDB soit prêt
echo "⏳ Attente que MongoDB soit prêt..."
sleep 15

# Vérifier MongoDB
if docker exec mongodb mongosh --eval "db.adminCommand('ping')" | grep -q "ok"; then
    echo "✅ MongoDB est opérationnel"
else
    echo "❌ MongoDB ne répond pas"
    exit 1
fi

# Maintenant démarrer le backend
echo "🚀 Démarrage du backend..."
docker-compose up -d contact-backend

# Attendre que le backend démarre
echo "⏳ Attente du démarrage du backend (30 secondes)..."
sleep 30

# Vérifier le backend
echo "🔍 Vérification du backend..."
if curl -s http://localhost:5003/health | grep -q "healthy"; then
    echo "✅ Backend est opérationnel"
else
    echo "❌ Backend ne répond pas - vérification des logs..."
    docker logs contact-backend --tail 20
    echo "🔄 Tentative de redémarrage du backend..."
    docker-compose restart contact-backend
    sleep 15
    if curl -s http://localhost:5003/health | grep -q "healthy"; then
        echo "✅ Backend est maintenant opérationnel après redémarrage"
    else
        echo "❌ Backend toujours inaccessible après redémarrage"
        exit 1
    fi
fi

# Démarrer le frontend
echo "🌐 Démarrage du frontend..."
docker-compose up -d contact-frontend

sleep 10

# Vérifier le frontend
if curl -s http://localhost > /dev/null; then
    echo "✅ Frontend est opérationnel"
else
    echo "❌ Frontend ne répond pas"
    exit 1
fi

echo "🎉 Déploiement réussi! Application disponible sur http://localhost"
echo "📊 Backend API disponible sur http://localhost:5003"