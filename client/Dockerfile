# Utiliser Node.js version LTS
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Changer le propriétaire des fichiers
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Exposer le port
EXPOSE 5000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV DOCKER_ENV=true

# Commande de démarrage
CMD ["node", "server.js"]