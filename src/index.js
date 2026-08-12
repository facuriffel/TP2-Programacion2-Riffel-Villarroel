require('dotenv').config();
const express = require('express');
const app = express();

// Middleware para entender los datos que lleguen en formato JSON
app.use(express.json());

// Importamos y usamos nuestra ruta de prueba
app.use('/health', require('./routes/health.routes'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor de la clínica corriendo en el puerto ${PORT}`);
});