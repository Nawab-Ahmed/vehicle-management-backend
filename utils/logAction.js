const oracledb = require('oracledb');
const { getOracleConnection } = require('../config/db');

async function logAction(actionType, tableName, recordId, userName) {
    const connection = await getOracleConnection();
    await connection.execute(
        `INSERT INTO logs (action_type, table_name, record_id, user_name) VALUES (:actionType, :tableName, :recordId, :userName)`,
        { actionType, tableName, recordId: String(recordId), userName },  // `String(recordId)` ensures it's treated as a string
        { autoCommit: true }
    );
    await connection.close();
}

module.exports = logAction;
