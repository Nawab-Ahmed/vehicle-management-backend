const { getOracleConnection } = require('../config/db');

async function getVehicleReports(req, res) {
    try {
        const connection = await getOracleConnection();
        const result = await connection.execute('SELECT * FROM Vehicle_management'); // Adjust the query as necessary
        await connection.close();

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching vehicle reports:', err);
        res.status(500).json({ message: 'Error fetching vehicle reports' });
    }
}

module.exports = { getVehicleReports };
