const { getOracleConnection } = require('../config/db');

const authorize = (requiredPage, requiredRight) => {
    return async (req, res, next) => {
        const userId = req.userId;
        console.log(`Authorization attempt - User ID: ${userId}, Page: '${requiredPage}', Right: '${requiredRight.toUpperCase()}'`);

        try {
            const connection = await getOracleConnection();
            const result = await connection.execute(
                `SELECT CAN_EXECUTE, CAN_ADD, CAN_EDIT, CAN_DELETE, CAN_SPECIAL 
                 FROM user_page_rights 
                 WHERE USER_ID = :userId AND PAGE = :requiredPage`,
                { userId, requiredPage }
            );

            console.log(`Database query executed. Number of rows found: ${result.rows.length}`);
            console.log(`Database result:`, result.rows);

            await connection.close();

            if (result.rows.length > 0) {
                const rights = result.rows[0];
                console.log(`Retrieved rights from DB: CAN_EXECUTE=${rights[0]}, CAN_ADD=${rights[1]}, CAN_EDIT=${rights[2]}, CAN_DELETE=${rights[3]}, CAN_SPECIAL=${rights[4]}`);

                let hasRight = false;
                switch (requiredRight.toUpperCase()) {
                    case 'EXECUTE':
                    case 'CAN_EXECUTE':
                        hasRight = rights[0] === 'Y';
                        break;
                    case 'ADD':
                    case 'CAN_ADD':
                        hasRight = rights[1] === 'Y';
                        break;
                    case 'EDIT':
                    case 'CAN_EDIT':
                        hasRight = rights[2] === 'Y';
                        break;
                    case 'DELETE':
                    case 'CAN_DELETE':
                        hasRight = rights[3] === 'Y';
                        break;
                    case 'SPECIAL':
                    case 'CAN_SPECIAL':
                        hasRight = rights[4] === 'Y';
                        break;
                    default:
                        console.log(`Invalid right requested: ${requiredRight.toUpperCase()}`);
                }

                if (hasRight) {
                    console.log('User authorized');
                    return next(); // User is authorized
                } else {
                    console.log(`User not authorized for the right: ${requiredRight.toUpperCase()}`);
                    return res.status(403).json({ message: `Forbidden: You do not have the required ${requiredRight} rights.` });
                }
            } else {
                console.log(`No rights found for user ID: ${userId}, page: '${requiredPage}'`);
                return res.status(403).json({ message: 'Forbidden: No rights found for this page.' });
            }

        } catch (error) {
            console.error('Authorization error:', error);
            return res.status(500).json({ message: 'Internal server error during authorization.' });
        }
    };
};

module.exports = authorize;
