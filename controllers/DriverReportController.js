const { getOracleConnection } = require('../config/db');
const { logAction } = require('../utils/logUtil'); // Import log utility

async function searchDrivers(req, res) {
    const { name } = req.query;
    const userName = req.userName || 'Unknown User';

    try {
        const connection = await getOracleConnection();
        const result = await connection.execute(
            `SELECT * FROM drivers WHERE LOWER(name) LIKE :name`,
            { name: `%${name.toLowerCase()}%` }
        );

        await connection.close();
        await logAction('SEARCH', 'DRIVERS', null, userName, `Search query: ${name}`); // Log the search action
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error searching for drivers:', error);
        res.status(500).json({ message: 'Error searching for drivers', error });
    }
}

async function getDriverHistory(req, res) {
    const { id } = req.params;
    const userName = req.userName || 'Unknown User';

    try {
        const connection = await getOracleConnection();
        const result = await connection.execute(
            `SELECT * FROM driver_history WHERE driver_id = :id`,
            { id }
        );

        await connection.close();
        await logAction('VIEW_HISTORY', 'DRIVER_HISTORY', id, userName); // Log the action of viewing driver history
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching driver history:', error);
        res.status(500).json({ message: 'Error fetching driver history', error });
    }
}

async function getDriverReports(req, res) {
    const userName = req.userName || 'Unknown User';

    try {
        const connection = await getOracleConnection();
        const result = await connection.execute('SELECT * FROM DRIVERS'); // Adjust the query as necessary
        await connection.close();

        await logAction('VIEW_REPORTS', 'DRIVERS', null, userName); // Log the action of viewing driver reports
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching driver reports:', err);
        res.status(500).json({ message: 'Error fetching driver reports' });
    }
}

module.exports = {
    searchDrivers,
    getDriverHistory,
    getDriverReports
};
