const { getOracleConnection } = require('../config/db');

async function logAction(actionType, tableName, recordId, userName) {
    let connection;
    try {
        connection = await getOracleConnection();
        await connection.execute(
            `INSERT INTO logs (action_type, table_name, record_id, user_name, timestamp) VALUES (:actionType, :tableName, :recordId, :userName, SYSTIMESTAMP)`,
            { actionType, tableName, recordId: recordId ? recordId.toString() : null, userName },
            { autoCommit: true }
        );
    } catch (error) {
        console.error('Error logging action:', error);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing connection:', error);
            }
        }
    }
}

module.exports = { logAction };
