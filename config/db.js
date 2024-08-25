const oracledb = require('oracledb');
require('dotenv').config();

const getOracleConnection = async () => {
    try {
        console.log('Connecting to Oracle with:', {
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECTION_STRING
        });

        const connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECTION_STRING
        });
        console.log('Oracle connection established');
        return connection;
    } catch (err) {
        console.error('Error getting Oracle connection:', err);
        throw err;
    }
};

module.exports = { getOracleConnection };
