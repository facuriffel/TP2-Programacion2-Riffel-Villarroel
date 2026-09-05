require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

app.use('/health', require('./routes/health.routes'));
app.use('/auth', require('./routes/auth.routes'));
app.use('/usuarios', require('./routes/usuario.routes'));
app.use('/sedes', require('./routes/sede.routes'));
app.use('/especialidades', require('./routes/especialidad.routes'));
app.use('/coberturas', require('./routes/cobertura.routes'));
app.use('/agenda', require('./routes/agenda.routes'));
app.use('/turnos', require('./routes/turno.routes'));
app.use('/historial', require('./routes/historial.routes'));
app.use('/notificaciones', require('./routes/notificacion.routes'));
app.use('/auditoria', require('./routes/auditoria.routes'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});