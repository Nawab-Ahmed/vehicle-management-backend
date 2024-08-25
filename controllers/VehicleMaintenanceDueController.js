const { getOracleConnection } = require('../config/db');
const { logAction } = require('../utils/logUtil'); // Import log utility

async function getVehicleMaintenanceDueReport(req, res) {
    try {
        const connection = await getOracleConnection();
        const result = await connection.execute(`
            SELECT regn_no, owner_name, maintenance_due_date
            FROM vehicles
            WHERE maintenance_due_date IS NOT NULL
        `);
        await connection.close();

        const vehicles = result.rows.map(row => ({
            regn_no: row[0],
            owner_name: row[1],
            maintenance_due_date: row[2],
        }));

        // Log action
        await logAction('VIEW', 'VEHICLES', null, 'system'); // Default to 'system' as the username

        res.status(200).json(vehicles);
    } catch (err) {
        console.error('Error fetching vehicle maintenance due report:', err);
        res.status(500).json({ message: 'Error fetching vehicle maintenance due report', error: err.message });
    }
}

module.exports = {
    getVehicleMaintenanceDueReport
};
