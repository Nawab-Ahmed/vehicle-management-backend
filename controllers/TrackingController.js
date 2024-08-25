const { getOracleConnection } = require('../config/db');
const { logAction } = require('../utils/logUtil');

async function createTracking(req, res) {
    const { companyName, companyContactNo, pocName, pocNumber } = req.body;
    const userName = req.userName || 'Unknown User';

    try {
        const connection = await getOracleConnection();
        await connection.execute(
            `INSERT INTO TRACKING (COMPANY_NAME, COMPANY_CONTACT_NO, POC_NAME, POC_NUMBER) 
            VALUES (:companyName, :companyContactNo, :pocName, :pocNumber)`,
            { companyName, companyContactNo, pocName, pocNumber },
            { autoCommit: true }
        );
        await logAction('ADD', 'TRACKING', null, userName); // Log action with the actual userName
        await connection.close();

        res.status(201).json({ message: 'Tracking information added successfully' });
    } catch (err) {
        console.error('Error adding tracking information:', err);
        res.status(500).json({ message: 'Error adding tracking information', error: err.message });
    }
}

async function getTrackingRecords(req, res) {
    try {
        const connection = await getOracleConnection();
        const result = await connection.execute('SELECT ID, COMPANY_NAME, COMPANY_CONTACT_NO, POC_NAME, POC_NUMBER, TRACKING_ID FROM TRACKING');
        await connection.close();

        const records = result.rows.map(row => ({
            id: row[0],
            companyName: row[1],
            companyContactNo: row[2],
            pocName: row[3],
            pocNumber: row[4],
            trackingId: row[5]
        }));

        res.status(200).json(records);
    } catch (err) {
        console.error('Error fetching tracking records:', err);
        res.status(500).json({ message: 'Error fetching tracking records', error: err.message });
    }
}

async function getTrackingOptions(req, res) {
    try {
        const connection = await getOracleConnection();
        const result = await connection.execute('SELECT TRACKING_ID, COMPANY_NAME FROM TRACKING');
        await connection.close();

        const options = result.rows.map(row => ({
            trackingId: row[0],
            companyName: row[1]
        }));

        res.status(200).json(options);
    } catch (err) {
        console.error('Error fetching tracking options:', err);
        res.status(500).json({ message: 'Error fetching tracking options', error: err.message });
    }
}

async function updateTracking(req, res) {
    const { companyName, companyContactNo, pocName, pocNumber } = req.body;
    const { id } = req.params;
    const userName = req.userName || 'Unknown User';

    try {
        const connection = await getOracleConnection();
        await connection.execute(
            `UPDATE TRACKING SET COMPANY_NAME = :companyName, COMPANY_CONTACT_NO = :companyContactNo, POC_NAME = :pocName, POC_NUMBER = :pocNumber WHERE ID = :id`,
            { companyName, companyContactNo, pocName, pocNumber, id },
            { autoCommit: true }
        );
        await logAction('UPDATE', 'TRACKING', id, userName); // Log action with the actual userName
        await connection.close();

        res.status(200).json({ message: 'Tracking information updated successfully' });
    } catch (err) {
        console.error('Error updating tracking information:', err);
        res.status(500).json({ message: 'Error updating tracking information', error: err.message });
    }
}

async function deleteTracking(req, res) {
    const { id } = req.params;
    const userName = req.userName || 'Unknown User';

    try {
        const connection = await getOracleConnection();
        await connection.execute(
            `DELETE FROM TRACKING WHERE ID = :id`,
            { id },
            { autoCommit: true }
        );
        await logAction('DELETE', 'TRACKING', id, userName); // Log action with the actual userName
        await connection.close();

        res.status(200).json({ message: 'Tracking information deleted successfully' });
    } catch (err) {
        console.error('Error deleting tracking information:', err);
        res.status(500).json({ message: 'Error deleting tracking information', error: err.message });
    }
}

module.exports = { createTracking, getTrackingRecords, getTrackingOptions, updateTracking, deleteTracking };
