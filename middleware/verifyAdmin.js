const jwt = require('jsonwebtoken');
const { getOracleConnection } = require('../config/db');

const verifyAdmin = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const connection = await getOracleConnection();
        const sql = 'SELECT userType FROM users WHERE id = :id';
        const result = await connection.execute(sql, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userType = result.rows[0][0];

        if (userType !== 'Admin') {
            return res.status(403).json({ message: 'Require Admin Role' });
        }

        next();
    } catch (err) {
        console.error('Error verifying admin role:', err);
        res.status(500).json({ message: 'Internal server error', error: err.message });
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

module.exports = verifyAdmin;
