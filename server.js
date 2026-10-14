const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de la conexión a PostgreSQL usando DATABASE_URL o variables individuales
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Requerido por la mayoría de proveedores en la nube como Render
      }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'sucursales_db',
        password: process.env.DB_PASSWORD || 'password',
        port: process.env.DB_PORT || 5432,
      }
);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint: Obtener listado general de sucursales (para que funcione la vista principal)
app.get('/api/sucursales', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM sucursales ORDER BY nombre ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener sucursales' });
    }
});

// Endpoint: Detalle ejecutivo completo de una sucursal
app.get('/api/sucursales/:id/detalle', async (req, res) => {
    try {
        const sucursalId = req.params.id;

        const sucQuery = await pool.query('SELECT * FROM sucursales WHERE id = $1', [sucursalId]);
        if (sucQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Sucursal no encontrada' });
        }
        const sucursal = sucQuery.rows[0];

        const [edificiosQuery, equiposQuery, otQuery] = await Promise.all([
            pool.query('SELECT * FROM edificios WHERE sucursal_id = $1 AND activo = TRUE', [sucursalId]),
            pool.query('SELECT * FROM activos WHERE sucursal_id = $1', [sucursalId]),
            pool.query('SELECT * FROM ordenes_trabajo WHERE sucursal_id = $1 ORDER BY created_at DESC', [sucursalId])
        ]);

        const otRows = otQuery.rows;
        const stats = {
            total_edificios: edificiosQuery.rows.length,
            total_equipos: equiposQuery.rows.length,
            total_ot: otRows.length,
            ot_pendientes: otRows.filter(ot => ot.estado_ot !== 'Completada' && ot.estado_ot !== 'Cerrada').length
        };

        res.json({
            sucursal,
            stats,
            edificios: edificiosQuery.rows,
            equipos: equiposQuery.rows,
            ordenes_trabajo: otRows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener el detalle ejecutivo de la sucursal' });
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
