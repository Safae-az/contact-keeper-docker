#!/bin/bash
echo "🎯 DÉPLOIEMENT SERVEUR DE TEST DEPUIS GITHUB"

# Configuration
GITHUB_URL="https://github.com/Safae-az/contact-keeper-docker.git"
APP_DIR="/opt/contact-keeper"
SERVER_IP=$(hostname -I | awk '{print $1}')

echo "📍 IP du serveur: $SERVER_IP"
echo "📦 Clonage depuis GitHub..."

# Installation des dépendances
sudo apt update
sudo apt install -y git docker.io docker-compose

# Arrêt des services existants
sudo docker-compose down 2>/dev/null || true

# Clonage ou mise à jour du repository
if [ -d "$APP_DIR" ]; then
    echo "🔄 Mise à jour du repository existant..."
    cd "$APP_DIR"
    git pull origin main
else
    echo "📥 Clonage du repository..."
    sudo mkdir -p "$APP_DIR"
    sudo chown $USER:$USER "$APP_DIR"
    git clone "$GITHUB_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# Construction et démarrage
echo "🐳 Construction des images..."
docker-compose build

echo "🚀 Démarrage des services..."
docker-compose up -d

# Attente et vérification
echo "⏳ Attente du démarrage (30 secondes)..."
sleep 30

# Tests de validation
echo "🔍 VALIDATION DU DÉPLOIEMENT..."

# Test des services
if curl -s http://localhost > /dev/null; then
    echo "✅ Frontend: OPÉRATIONNEL"
else
    echo "❌ Frontend: ÉCHEC"
    exit 1
fi

if curl -s http://localhost:5003/api/contacts > /dev/null; then
    echo "✅ Backend: OPÉRATIONNEL"
else
    echo "❌ Backend: ÉCHEC"
    exit 1
fi

if docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')" | grep -q "ok"; then
    echo "✅ MongoDB: OPÉRATIONNEL"
else
    echo "❌ MongoDB: ÉCHEC"
    exit 1
fi

echo "🎉 DÉPLOIEMENT RÉUSSI!"
echo "🌐 Frontend: http://$SERVER_IP"
echo "🔌 Backend: http://$SERVER_IP:5003"
echo "🗄️  MongoDB: $SERVER_IP:27017"
