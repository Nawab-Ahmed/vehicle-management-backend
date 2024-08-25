const oracledb = require('oracledb');
const { getOracleConnection } = require('../config/db');
const { logAction } = require('../utils/logUtil'); // Import log utility

async function getAllDrivers(req, res) {
    try {
        const connection = await getOracleConnection();
        const result = await connection.execute('SELECT * FROM DRIVERS');
        await connection.close();

        const drivers = result.rows.map(row => ({
            id: row[0],
            name: row[1],
            father_husband_name: row[2],
            address: row[3],
            date_of_birth: row[4],
            blood_group: row[5],
            identification_mark: row[6],
            cnic_no: row[7],
            cnic_issue_date: row[8],
            cnic_expiry: row[9],
            license_no: row[10],
            license_issue_date: row[11],
            license_expiry_date: row[12],
            category: row[13],
            location: row[14]
        }));

        res.status(200).json(drivers);
    } catch (err) {
        console.error('Error fetching drivers:', err);
        res.status(500).json({ message: 'Error fetching drivers', error: err.message });
    }
}

async function addDriver(req, res) {
    const {
        name,
        father_husband_name,
        address,
        date_of_birth,
        blood_group,
        identification_mark,
        cnic_no,
        cnic_issue_date,
        cnic_expiry,
        license_no,
        license_issue_date,
        license_expiry_date,
        category,
        location
    } = req.body;

    const userName = req.userName || 'Unknown User';

    try {
        const connection = await getOracleConnection();
        await connection.execute(
            `INSERT INTO drivers (NAME, FATHER_HUSBAND_NAME, ADDRESS, DATE_OF_BIRTH, BLOOD_GROUP, IDENTIFICATION_MARK, CNIC_NO, CNIC_ISSUE_DATE, CNIC_EXPIRY, LICENSE_NO, LICENSE_ISSUE_DATE, LICENSE_EXPIRY_DATE, CATEGORY, LOCATION) 
            VALUES (:name, :father_husband_name, :address, TO_DATE(:date_of_birth, 'YYYY-MM-DD'), :blood_group, :identification_mark, :cnic_no, TO_DATE(:cnic_issue_date, 'YYYY-MM-DD'), TO_DATE(:cnic_expiry, 'YYYY-MM-DD'), :license_no, TO_DATE(:license_issue_date, 'YYYY-MM-DD'), TO_DATE(:license_expiry_date, 'YYYY-MM-DD'), :category, :location)`,
            {
                name,
                father_husband_name,
                address,
                date_of_birth,
                blood_group,
                identification_mark,
                cnic_no,
                cnic_issue_date,
                cnic_expiry,
                license_no,
                license_issue_date,
                license_expiry_date,
                category,
                location
            },
            { autoCommit: true }
        );

        await connection.close();
        await logAction('ADD', 'DRIVERS', null, userName); // Log the action with the username
        res.status(201).json({ message: 'Driver added successfully' });
    } catch (err) {
        console.error('Error adding driver:', err);
        res.status(500).json({ message: 'Error adding driver' });
    }
}

async function getDriverById(req, res) {
    const { id } = req.params;

    try {
        const connection = await getOracleConnection();
        const result = await connection.execute('SELECT * FROM DRIVERS WHERE id = :id', [id]);
        await connection.close();

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching driver:', err);
        res.status(500).json({ message: 'Error fetching driver', error: err.message });
    }
}

async function updateDriver(req, res) {
    const { id } = req.params;
    const {
        name,
        father_husband_name,
        address,
        date_of_birth,
        blood_group,
        identification_mark,
        cnic_no,
        cnic_issue_date,
        cnic_expiry,
        license_no,
        license_issue_date,
        license_expiry_date,
        category,
        location
    } = req.body;

    const userName = req.userName || 'Unknown User';

    try {
        const connection = await getOracleConnection();
        await connection.execute(
            `UPDATE DRIVERS
            SET name = :name, father_husband_name = :father_husband_name, address = :address, 
                date_of_birth = TO_DATE(:date_of_birth, 'YYYY-MM-DD'), blood_group = :blood_group, 
                identification_mark = :identification_mark, cnic_no = :cnic_no, 
                cnic_issue_date = TO_DATE(:cnic_issue_date, 'YYYY-MM-DD'), cnic_expiry = TO_DATE(:cnic_expiry, 'YYYY-MM-DD'), 
                license_no = :license_no, license_issue_date = TO_DATE(:license_issue_date, 'YYYY-MM-DD'), 
                license_expiry_date = TO_DATE(:license_expiry_date, 'YYYY-MM-DD'), category = :category, 
                location = :location
            WHERE id = :id`,
            {
                id, name, father_husband_name, address, date_of_birth, blood_group, identification_mark,
                cnic_no, cnic_issue_date, cnic_expiry, license_no, license_issue_date, license_expiry_date,
                category, location
            },
            { autoCommit: true }
        );

        await connection.close();
        await logAction('UPDATE', 'DRIVERS', id, userName); // Log the action with the username
        res.status(200).json({ message: 'Driver updated successfully' });
    } catch (err) {
        console.error('Error updating driver:', err);
        res.status(500).json({ message: 'Error updating driver', error: err.message });
    }
}

async function deleteDriver(req, res) {
    const { id } = req.params;
    const { remarks } = req.body;

    const userName = req.userName || 'Unknown User';

    if (!remarks) {
        return res.status(400).json({ message: 'Remarks are required for deletion' });
    }

    try {
        const connection = await getOracleConnection();
        await connection.execute('DELETE FROM DRIVERS WHERE id = :id', { id }, { autoCommit: true });

        // Log the deletion action with remarks
        await logAction('DELETE', 'DRIVERS', id, userName, remarks);

        await connection.close();
        res.status(200).json({ message: 'Driver deleted successfully' });
    } catch (err) {
        console.error('Error deleting driver:', err);
        res.status(500).json({ message: 'Error deleting driver', error: err.message });
    }
}

module.exports = {
    getAllDrivers,
    addDriver,
    getDriverById,
    updateDriver,
    deleteDriver
};
