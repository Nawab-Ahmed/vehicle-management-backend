const bcrypt = require('bcrypt');
const { getOracleConnection } = require('../config/db');

const hashPasswords = async () => {
    let connection;
    try {
        connection = await getOracleConnection();
        const sql = 'SELECT id, password FROM users';
        const result = await connection.execute(sql);

        for (const row of result.rows) {
            const [id, plainPassword] = row;
            const hashedPassword = await bcrypt.hash(plainPassword, 10);

            const updateSql = 'UPDATE users SET password = :password WHERE id = :id';
            const binds = { password: hashedPassword, id };
            await connection.execute(updateSql, binds, { autoCommit: true });

            console.log(`Updated password for user ID: ${id}`);
        }
    } catch (err) {
        console.error('Error hashing passwords:', err);
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

hashPasswords();
