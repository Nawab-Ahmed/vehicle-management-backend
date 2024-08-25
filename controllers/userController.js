const bcrypt = require('bcrypt');
const { getOracleConnection } = require('../config/db');
const { logAction } = require('../utils/logUtil'); // Import log utility

const registerUser = async (req, res) => {
    const { login, password, name, email, userType, location } = req.body;
    const userName = req.userName || 'Unknown User';
    let connection;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        connection = await getOracleConnection();

        const sql = 'INSERT INTO users (login, password, name, email, userType, location) VALUES (:login, :password, :name, :email, :userType, :location)';
        const binds = { login, password: hashedPassword, name, email, userType, location };
        const options = { autoCommit: true };

        const result = await connection.execute(sql, binds, options);

        if (result.rowsAffected === 1) {
            await logAction('REGISTER', 'USERS', null, userName); // Log action with the correct user
            res.status(201).json({ message: 'User registered successfully' });
        } else {
            throw new Error('Failed to register user, no rows affected');
        }
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ message: 'Failed to register user', error: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (closeError) {
                console.error('Error closing connection:', closeError);
            }
        }
    }
};

const addUser = async (req, res) => {
    const { login, password, name, email, userType, location } = req.body;
    const userName = req.userName || 'Unknown User';
    let connection;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        connection = await getOracleConnection();

        const sql = 'INSERT INTO users (login, password, name, email, userType, location) VALUES (:login, :password, :name, :email, :userType, :location)';
        const binds = { login, password: hashedPassword, name, email, userType, location };
        const options = { autoCommit: true };

        const result = await connection.execute(sql, binds, options);

        if (result.rowsAffected === 1) {
            await logAction('ADD', 'USERS', null, userName); // Log action with the correct user
            res.status(201).json({ message: 'User added successfully' });
        } else {
            throw new Error('Failed to insert user, no rows affected');
        }
    } catch (err) {
        console.error('Error adding user:', err);
        res.status(500).json({ message: 'Failed to add user', error: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (closeError) {
                console.error('Error closing connection:', closeError);
            }
        }
    }
};

const getUsers = async (req, res) => {
    let connection;

    try {
        connection = await getOracleConnection();
        const result = await connection.execute(`
            SELECT u.id, u.login, u.name, u.email, u.usertype, l.location_name
            FROM users u
            LEFT JOIN locations l ON u.location = l.id
        `);

        if (!result.rows) {
            throw new Error('No rows returned');
        }

        const users = result.rows.map(row => ({
            id: row[0],
            login: row[1],
            name: row[2],
            email: row[3],
            userType: row[4],
            location: row[5], // This will now be the location name
        }));

        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Failed to fetch users', error: err.message });
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

const getUserRights = async (req, res) => {
    const { userId } = req.params;
    let connection;

    try {
        console.log(`Fetching rights for user: ${userId}`);
        connection = await getOracleConnection();
        const result = await connection.execute(
            `SELECT page, can_execute, can_add, can_edit, can_delete, can_special 
             FROM user_page_rights 
             WHERE user_id = :userId`, 
            [userId]
        );
        console.log("Fetched user rights:", result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching user rights:', err);
        res.status(500).json({ message: 'Failed to fetch user rights', error: err.message });
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

const updateUserRights = async (req, res) => {
    const { userId, rights } = req.body;
    const userName = req.userName || 'Unknown User';
    let connection;

    try {
        console.log(`Updating rights for user: ${userId}`); // Log the userId to ensure it's correct

        connection = await getOracleConnection();
        
        // Check if user exists
        const userCheckResult = await connection.execute(
            'SELECT id FROM users WHERE id = :id',
            { id: userId }
        );

        if (userCheckResult.rows.length === 0) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        const pages = Object.keys(rights);
        for (const page of pages) {
            const pageRights = rights[page];
            const { can_execute, can_add, can_edit, can_delete, can_special } = pageRights;

            const sql = `
                MERGE INTO user_page_rights upr
                USING DUAL
                ON (upr.user_id = :userId AND upr.page = :page)
                WHEN MATCHED THEN
                    UPDATE SET can_execute = :can_execute, can_add = :can_add, can_edit = :can_edit, can_delete = :can_delete, can_special = :can_special
                WHEN NOT MATCHED THEN
                    INSERT (user_id, page, can_execute, can_add, can_edit, can_delete, can_special)
                    VALUES (:userId, :page, :can_execute, :can_add, :can_edit, :can_delete, :can_special)
            `;
            const binds = {
                userId,
                page,
                can_execute: can_execute ? 'Y' : 'N',
                can_add: can_add ? 'Y' : 'N',
                can_edit: can_edit ? 'Y' : 'N',
                can_delete: can_delete ? 'Y' : 'N',
                can_special: can_special ? 'Y' : 'N',
            };
            const options = { autoCommit: true };

            await connection.execute(sql, binds, options);
        }

        await logAction('UPDATE', 'USER_PAGE_RIGHTS', userId, userName); // Log action with the correct user
        res.status(200).json({ message: 'User rights updated successfully' });
    } catch (err) {
        console.error('Error updating user rights:', err);
        res.status(500).json({ message: 'Failed to update user rights', error: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('Oracle connection closed');
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
};

const updateUser = async (req, res) => {
    const { id, login, password, name, email, userType, location } = req.body;
    const userName = req.userName || 'Unknown User';
    let connection;

    try {
        console.log(`Received updateUser request with id: ${id}, login: ${login}, name: ${name}, email: ${email}, userType: ${userType}, location: ${location}`);
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword);

        connection = await getOracleConnection();
        console.log('Oracle connection established for updateUser');

        const sql = 'UPDATE users SET login = :login, password = :password, name = :name, email = :email, userType = :userType, location = :location WHERE id = :id';
        const binds = { id, login, password: hashedPassword, name, email, userType, location };
        const options = { autoCommit: true };

        console.log('Executing SQL:', sql);
        console.log('With binds:', binds);
        console.log('With options:', options);

        const result = await connection.execute(sql, binds, options);
        console.log('Update result:', result);

        await logAction('UPDATE', 'USERS', id, userName); // Log action with the correct user
        res.status(200).json({ message: 'User updated successfully' });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Failed to update user', error: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('Oracle connection closed for updateUser');
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    const userName = req.userName || 'Unknown User';
    let connection;

    try {
        console.log(`Received deleteUser request with id: ${id}`);

        connection = await getOracleConnection();
        console.log('Oracle connection established for deleteUser');

        const sql = `
            BEGIN
                DELETE FROM user_page_rights WHERE user_id = :id;
                DELETE FROM users WHERE id = :id;
            END;
        `;
        const binds = { id };
        const options = { autoCommit: true };

        console.log('Executing SQL:', sql);
        console.log('With binds:', binds);
        console.log('With options:', options);

        const result = await connection.execute(sql, binds, options);
        console.log('Delete result:', result);

        await logAction('DELETE', 'USERS', id, userName); // Log action with the correct user
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Failed to delete user', error: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('Oracle connection closed for deleteUser');
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
};

const getAllUserRights = async (req, res) => {
    let connection;

    try {
        console.log("Fetching all user rights from database...");
        connection = await getOracleConnection();
        const result = await connection.execute(`
            SELECT u.login AS username, upr.page, upr.can_execute, upr.can_add, upr.can_edit, upr.can_delete, upr.can_special
            FROM user_page_rights upr
            JOIN users u ON upr.user_id = u.id
        `);
        console.log("Fetched all user rights:", result.rows); // Log the results
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching all user rights:', err);
        res.status(500).json({ message: 'Failed to fetch all user rights', error: err.message });
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

const getUserRightsPreview = async (req, res) => {
    let connection;

    try {
        console.log("Fetching user rights preview from database...");
        connection = await getOracleConnection();
        const result = await connection.execute(`
            SELECT u.login, upr.page, upr.can_execute, upr.can_add, upr.can_edit, upr.can_delete, upr.can_special
            FROM user_page_rights upr
            JOIN users u ON upr.user_id = u.id
        `);
        console.log("Fetched user rights preview:", result.rows); // Log the results
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching user rights preview:', err);
        res.status(500).json({ message: 'Failed to fetch user rights preview', error: err.message });
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

module.exports = {
    registerUser,
    addUser,
    getUsers,
    updateUser,
    deleteUser,
    getUserRights,
    updateUserRights,
    getAllUserRights,
    getUserRightsPreview
};
