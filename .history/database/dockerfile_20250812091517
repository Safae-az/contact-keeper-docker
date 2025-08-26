# Utiliser l'image officielle MongoDB déjà téléchargée
FROM mongo:latest

# Variables d'environnement pour l'utilisateur root
ENV MONGO_INITDB_ROOT_USERNAME=admin
ENV MONGO_INITDB_ROOT_PASSWORD=admin123
ENV MONGO_INITDB_DATABASE=mydatabase

# Copier un script d'initialisation (optionnel)
# Ce script sera exécuté au démarrage pour créer collections ou insérer des données
COPY init.js /docker-entrypoint-initdb.d/

# Le port par défaut de MongoDB
EXPOSE 27017
