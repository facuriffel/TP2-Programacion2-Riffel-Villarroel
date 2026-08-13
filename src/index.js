require('dotenv').config();
const express = require('express');
const app = express();
const coberturaRoutes = require('./routes/cobertura.routes');

app.use(express.json());

// rutas
app.use('/health', require('./routes/health.routes'));
app.use('/auth', require('./routes/auth.routes'));
app.use('/coberturas', coberturaRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});