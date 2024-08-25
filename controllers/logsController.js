const { getOracleConnection } = require('../config/db');

const logAction = async (actionType, tableName, recordId, userName) => {
    let connection;
    try {
        connection = await getOracleConnection();
        await connection.execute(
            `INSERT INTO logs (action_type, table_name, record_id, user_name, timestamp) VALUES (:actionType, :tableName, :recordId, :userName, SYSTIMESTAMP)`,
            { actionType, tableName, recordId, userName },
            { autoCommit: true }
        );
    } catch (err) {
        console.error('Error logging action:', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
};

const getLogs = async (req, res) => {
    let connection;
    try {
        connection = await getOracleConnection();
        const result = await connection.execute('SELECT ACTION_TYPE, TABLE_NAME, RECORD_ID, USER_NAME, TIMESTAMP FROM logs ORDER BY TIMESTAMP DESC');
        const logs = result.rows.map(row => ({
            actionType: row[0],
            tableName: row[1],
            recordId: row[2],
            userName: row[3],
            timestamp: row[4]
        }));
        res.status(200).json(logs);
    } catch (err) {
        console.error('Error fetching logs:', err);
        res.status(500).json({ message: 'Error fetching logs', error: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
};

module.exports = { logAction, getLogs };
