const { getOracleConnection } = require('../config/db');

async function getLocations(req, res) {
    try {
        const connection = await getOracleConnection();
        const result = await connection.execute('SELECT locationName FROM locations');
        await connection.close();

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching locations:', err);
        res.status(500).json({ message: 'Error fetching locations' });
    }
}

module.exports = { getLocations };
