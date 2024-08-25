const { getOracleConnection } = require('../config/db');

const checkRights = (requiredRight) => {
    return async (req, res, next) => {
        const userId = req.user.id; // Assume req.user is set after authentication
        const page = req.baseUrl.split('/').pop(); // Get the page name from URL

        let connection;

        try {
            connection = await getOracleConnection();

            const sql = 'SELECT * FROM user_page_rights WHERE user_id = :user_id AND page = :page';
            const binds = { user_id: userId, page };

            const result = await connection.execute(sql, binds);
            const userRights = result.rows[0];

            if (userRights && userRights[requiredRight] === 'Y') {
                next();
            } else {
                res.status(403).json({ message: 'Forbidden' });
            }
        } catch (err) {
            console.error('Error checking user rights:', err);
            res.status(500).json({ message: 'Failed to check user rights', error: err.message });
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
};

module.exports = checkRights;
