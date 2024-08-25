const getOracleConnection = require('../config/db');

async function getAllLocations() {
    const connection = await getOracleConnection();
    const result = await connection.execute(`SELECT locationName FROM locations`);
    await connection.close();
    return result.rows;
}

module.exports = { getAllLocations };
