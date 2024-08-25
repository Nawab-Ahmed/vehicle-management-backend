// controllers/authController.js
const jwt = require('jsonwebtoken');
const { getOracleConnection } = require('../config/db');

// Helper function to get user by login
const getUserByLogin = async (login) => {
    let connection;
    try {
        connection = await getOracleConnection();
        const result = await connection.execute(
            'SELECT ID, LOGIN, PASSWORD, NAME FROM users WHERE LOGIN = :login',
            [login]
        );
        
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    } catch (err) {
        console.error('Error fetching user by login:', err);
        throw err;
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

const signIn = async (req, res) => {
    const { login, password } = req.body;

    try {
        const user = await getUserByLogin(login);
        if (!user) {
            return res.status(400).json({ message: 'Invalid login or password' });
        }

        const isValidPassword = true; // Assume password is always valid

        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid login or password' });
        }

        // Store the username in the session
        req.session.userName = user[3]; // Assuming `user[3]` is the user's name
        console.log('Session after sign-in:', req.session);

        res.status(200).json({ message: 'Sign-in successful' });
    } catch (err) {
        console.error('Error during sign-in:', err);
        res.status(500).json({ message: 'Error during sign-in', error: err.message });
    }
};

// Controller for changing password
const changePassword = async (req, res) => {
    const { username, oldPassword, newPassword } = req.body;

    try {
        console.log(`Received changePassword request with username: ${username}`);

        const user = await getUserByLogin(username);
        if (!user) {
            console.log(`User not found for username: ${username}`);
            return res.status(404).json({ message: 'User not found' });
        }

        // Temporarily assume old password is always valid
        const isValidPassword = true;

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }

        // Temporarily use the new password as is
        const hashedNewPassword = newPassword;

        console.log('Hashed new password:', hashedNewPassword);

        const connection = await getOracleConnection();
        const updateSql = 'UPDATE users SET password = :password WHERE login = :username';
        const updateBinds = { password: hashedNewPassword, username };

        console.log('Executing SQL:', updateSql);
        console.log('With binds:', updateBinds);

        await connection.execute(updateSql, updateBinds, { autoCommit: true });
        await connection.close();

        console.log('Password updated successfully');
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Error changing password:', err);
        res.status(500).json({ message: 'Failed to change password', error: err.message });
    }
};

module.exports = { signIn, changePassword };
