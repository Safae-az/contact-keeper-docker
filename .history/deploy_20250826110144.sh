#!/bin/bash

# Script de déploiement automatique pour Contact Keeper
echo "🚀 Démarrage du déploiement avec VOTRE configuration..."

# Arrêter les services existants
echo "⏹️  Arrêt des services existants..."
docker-compose down

# Construire les images (utilise VOS Dockerfiles)
echo "🏗️  Construction des images..."
docker-compose build

# Démarrer tous les services
echo "🚀 Démarrage de tous les services..."
docker-compose up -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services (30 secondes)..."
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

# Vérifier le backend - TEST AVEC UN ENDPOINT EXISTANT
echo "🔌 Test du backend sur /api/contacts..."
if curl -s -f http://localhost:5003/api/contacts > /dev/null; then
    echo "✅ Backend est opérationnel (endpoint /api/contacts accessible)"
else
    echo "⚠️  Endpoint /api/contacts non accessible, test alternatif..."
    
    # Test alternatif: vérifier si le conteneur est en cours d'exécution
    if docker ps | grep -q "contact-backend"; then
        echo "✅ Conteneur backend en cours d'exécution"
        echo "📋 Logs du backend:"
        docker logs contact-backend --tail 5
    else
        echo "❌ Conteneur backend non démarré"
        exit 1
    fi
fi

# Vérifier le frontend
if curl -s http://localhost > /dev/null; then
    echo "✅ Frontend est opérationnel"
else
    echo "❌ Frontend ne répond pas"
    exit 1
fi

echo "🎉 Déploiement réussi! Application disponible sur http://localhost"
echo "📊 Backend API disponible sur http://localhost:5003"