const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Récupérer le token depuis l'en-tête
  const token = req.header('x-auth-token');

  // Vérifier si le token n'existe pas
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Vérifier le token avec la clé secrète depuis les variables d'environnement
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

