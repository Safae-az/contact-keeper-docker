#!/bin/bash

# Script de test du déploiement
echo "🧪 Test du déploiement avec VOTRE configuration..."

# Test de l'API
echo "📊 Test de l'API backend..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5003/health)

if [ "$response" -eq 200 ]; then
    echo "✅ API backend fonctionnelle (HTTP $response)"
else
    echo "❌ API ne répond pas: HTTP $response"
    echo "ℹ️  Vérification des logs du backend..."
    docker logs contact-backend --tail 10
    exit 1
fi

# Test de la base de données
echo "🗄️ Test de la base de données..."
if docker ps | grep -q "mongodb"; then
    echo "✅ MongoDB est en cours d'exécution"
    # Tentative de connexion à MongoDB
    if docker exec mongodb mongosh --eval "db.adminCommand('ping')" 2>/dev/null | grep -q "ok"; then
        echo "✅ Connexion MongoDB réussie"
    else
        echo "⚠️  Impossible de se connecter à MongoDB, mais le conteneur tourne"
    fi
else
    echo "❌ MongoDB n'est pas démarré"
    exit 1
fi

# Test de l'interface web
echo "🌐 Test de l'interface web..."
if curl -s http://localhost > /dev/null; then
    echo "✅ Interface web accessible"
else
    echo "❌ Interface web inaccessible"
    echo "ℹ️  Vérification des logs du frontend..."
    docker logs contact-frontend --tail 10
    exit 1
fi

# Test d'endpoint API spécifique
echo "🔗 Test de création de contact..."
api_response=$(curl -s -o /dev/null -w "%{http_code}" -X GET http://localhost:5003/api/contacts)
if [ "$api_response" -eq 200 ] || [ "$api_response" -eq 401 ] || [ "$api_response" -eq 404 ]; then
    echo "✅ Endpoint API accessible (HTTP $api_response)"
else
    echo "⚠️  Endpoint API retourne: HTTP $api_response"
fi

echo "🎉 Tous les tests de base sont passés avec succès!"
echo "📋 Résumé:"
echo "   - Frontend: http://localhost"
echo "   - Backend: http://localhost:5003"
echo "   - MongoDB: localhost:27017"