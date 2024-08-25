const { getOracleConnection } = require('../config/db');

async function createUser(email, hashedPassword) {
    const connection = await getOracleConnection();
    const result = await connection.execute(
        `INSERT INTO users (email, password) VALUES (:email, :password)`,
        [email, hashedPassword],
        { autoCommit: true }
    );
    await connection.close();
    return result;
}

async function getUserByLogin(login) {
    const connection = await getOracleConnection();
    const result = await connection.execute(
        `SELECT ID, LOGIN, PASSWORD, PLAIN_PASSWORD FROM users WHERE LOGIN = :login`,
        [login]
    );
    await connection.close();
    if (result.rows.length === 0) {
        return null;
    }

    const user = result.rows[0];
    return {
        id: user[0],
        login: user[1],
        password: user[2],
        plainPassword: user[3],
    };
}

module.exports = { createUser, getUserByLogin };
