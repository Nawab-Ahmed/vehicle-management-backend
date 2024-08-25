const { getOracleConnection } = require('../config/db');

async function getAllRequests(req, res) {
    try {
        const connection = await getOracleConnection();
        const result = await connection.execute('SELECT * FROM vehicle_requests');
        await connection.close();
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests', error });
    }
}

async function approveRequest(req, res) {
    const { id } = req.params;
    try {
        const connection = await getOracleConnection();
        await connection.execute('UPDATE vehicle_requests SET status = :status WHERE id = :id', {
            status: 'approved',
            id: id
        }, { autoCommit: true });
        await connection.close();
        res.status(200).json({ message: 'Request approved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error approving request', error });
    }
}

async function disapproveRequest(req, res) {
    const { id } = req.params;
    try {
        const connection = await getOracleConnection();
        await connection.execute('UPDATE vehicle_requests SET status = :status WHERE id = :id', {
            status: 'disapproved',
            id: id
        }, { autoCommit: true });
        await connection.close();
        res.status(200).json({ message: 'Request disapproved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error disapproving request', error });
    }
}

module.exports = {
    getAllRequests,
    approveRequest,
    disapproveRequest
};
