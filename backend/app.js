const express = require('express');
const app = express();
const apiRoutes = require('./routes/api');

// Configuration d'Express et d'autres middleware

// Montage des routes de l'API sous "/api"
app.use('/api', apiRoutes);

// D'autres configurations et middleware

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
