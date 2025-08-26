#!/bin/bash

# Script de test du déploiement
echo "🧪 Test du déploiement..."

# Test de l'API
echo "📊 Test de l'API..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5003/health)

if [ "$response" -eq 200 ]; then
    echo "✅ API fonctionnelle"
else
    echo "❌ API ne répond pas: HTTP $response"
    exit 1
fi

# Test de la base de données
echo "🗄️ Test de la base de données..."
if docker exec mongodb mongosh --eval "db.stats()" > /dev/null 2>&1; then
    echo "✅ Base de données fonctionnelle"
else
    echo "❌ Problème avec la base de données"
    exit 1
fi

# Test de l'interface web
echo "🌐 Test de l'interface web..."
if curl -s http://localhost > /dev/null; then
    echo "✅ Interface web accessible"
else
    echo "❌ Interface web inaccessible"
    exit 1
fi

echo "🎉 Tous les tests sont passés avec succès!"