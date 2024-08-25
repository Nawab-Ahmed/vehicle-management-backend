const oracledb = require('oracledb');
const { getOracleConnection } = require('../config/db');
const { logAction } = require('../controllers/logsController');

async function addContractualService(req, res) {
    console.log('Received request body:', req.body);
    console.log('Received files:', req.file);

    const {
        serviceDate,
        origin,
        destination,
        expectedTime,
        forMrMs,
        department,
        purpose,
        driverName,
        vehicleNo,
        vehicleCondition,
        cnic,
        address,
        location
    } = req.body;

    console.log('User name in addContractualService:', req.userName);

    const userName = req.userName || 'Unknown User';

    console.log('Parsed fields:', {
        serviceDate,
        origin,
        destination,
        expectedTime,
        forMrMs,
        department,
        purpose,
        driverName,
        vehicleNo,
        vehicleCondition,
        cnic,
        address,
        location,
        driverPhoto
    });

    try {
        const connection = await getOracleConnection();
        const sql = `
            INSERT INTO contractual_service (
                ID, SERVICE_DATE, ORIGIN, DESTINATION, EXPECTED_TIME, FOR_MR_MS, DEPARTMENT, PURPOSE,
                DRIVER_NAME, VEHICLE_NO, VEHICLE_CONDITION, CNIC, ADDRESS, LOCATION, DRIVER_PHOTO
            ) VALUES (
                contractual_service_seq.NEXTVAL, TO_DATE(:service_date, 'YYYY-MM-DD'), :origin, :destination, :expected_time,
                :for_mr_ms, :department, :purpose, :driver_name, :vehicle_no, :vehicle_condition,
                :cnic, :address, :location, EMPTY_BLOB()
            ) RETURNING DRIVER_PHOTO INTO :driver_photo`;

        const binds = {
            service_date: serviceDate,
            origin,
            destination,
            expected_time: expectedTime,
            for_mr_ms: forMrMs,
            department,
            purpose,
            driver_name: driverName,
            vehicle_no: vehicleNo,
            vehicle_condition: vehicleCondition,
            cnic,
            address,
            location,
            driver_photo: { type: oracledb.BLOB, dir: oracledb.BIND_OUT }
        };

        console.log('Executing SQL with binds:', binds);
        const result = await connection.execute(sql, binds, { autoCommit: false });
        const lob = result.outBinds.driver_photo[0];

        if (driverPhoto && lob) {
            await new Promise((resolve, reject) => {
                lob.on('error', reject);
                lob.on('finish', resolve);
                lob.write(driverPhoto);
                lob.end();
            });
        }

        await connection.commit();
        await logAction('ADD', 'CONTRACTUAL_SERVICE', null, userName);
        await connection.close();

        res.status(201).json({ message: 'Contractual service request added successfully' });
    } catch (err) {
        console.error('Error adding contractual service request:', err);
        res.status(500).json({ message: 'Error adding contractual service request', error: err.message });
    }
}

async function approveRequest(req, res) {
    const { id } = req.params;
    const { approver, status } = req.body;

    console.log('User name in approveRequest:', req.userName);

    const userName = req.userName || 'Unknown User';

    try {
        const connection = await getOracleConnection();
        let sql = '';
        let binds = {};

        if (approver === 'managerHr') {
            sql = 'UPDATE contractual_service SET MANAGER_HR = :status WHERE ID = :id';
            binds = { status, id };
        } else if (approver === 'administrator') {
            sql = 'UPDATE contractual_service SET ADMINISTRATOR = :status WHERE ID = :id';
            binds = { status, id };
        }

        console.log('Executing SQL with binds:', binds);
        await connection.execute(sql, binds, { autoCommit: true });
        await logAction('APPROVE', 'CONTRACTUAL_SERVICE', id, userName);
        await connection.close();

        res.status(200).json({ message: 'Request approved successfully' });
    } catch (err) {
        console.error('Error approving contractual service request:', err);
        res.status(500).json({ message: 'Error approving contractual service request', error: err.message });
    }
}

async function getAllContractualServices(req, res) {
    try {
        const connection = await getOracleConnection();
        const result = await connection.execute(`
            SELECT ID, TO_CHAR(SERVICE_DATE, 'YYYY-MM-DD') as SERVICE_DATE, ORIGIN, DESTINATION, EXPECTED_TIME, FOR_MR_MS,
                   DEPARTMENT, PURPOSE, DRIVER_NAME, VEHICLE_NO, VEHICLE_CONDITION, ADMINISTRATOR, MANAGER_HR,
                   CNIC, ADDRESS, LOCATION
            FROM contractual_service
        `);

        await connection.close();

        const records = result.rows.map(row => ({
            id: row[0],
            service_date: row[1],
            origin: row[2],
            destination: row[3],
            expected_time: row[4],
            for_mr_ms: row[5],
            department: row[6],
            purpose: row[7],
            driver_name: row[8],
            vehicle_no: row[9],
            vehicle_condition: row[10],
            administrator: row[11],
            manager_hr: row[12],
            cnic: row[13],
            address: row[14],
            location: row[15]
        }));

        res.status(200).json(records);
    } catch (err) {
        console.error('Error fetching contractual service requests:', err);
        res.status(500).json({ message: 'Error fetching contractual service requests', error: err.message });
    }
}

async function getContractualServiceById(req, res) {
    const { id } = req.params;

    try {
        const connection = await getOracleConnection();
        const result = await connection.execute(`
            SELECT ID, TO_CHAR(SERVICE_DATE, 'YYYY-MM-DD') as SERVICE_DATE, ORIGIN, DESTINATION, EXPECTED_TIME, FOR_MR_MS,
                   DEPARTMENT, PURPOSE, DRIVER_NAME, VEHICLE_NO, VEHICLE_CONDITION, ADMINISTRATOR, MANAGER_HR,
                   CNIC, ADDRESS, LOCATION
            FROM contractual_service
            WHERE ID = :id
        `, { id });

        await connection.close();

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Contractual service request not found' });
        }

        const record = result.rows.map(row => ({
            id: row[0],
            serviceDate: row[1],
            origin: row[2],
            destination: row[3],
            expectedTime: row[4],
            forMrMs: row[5],
            department: row[6],
            purpose: row[7],
            driverName: row[8],
            vehicleNo: row[9],
            vehicleCondition: row[10],
            administrator: row[11],
            managerHr: row[12],
            cnic: row[13],
            address: row[14],
            location: row[15]
        }))[0];

        res.status(200).json(record);
    } catch (err) {
        console.error('Error fetching contractual service request by ID:', err);
        res.status(500).json({ message: 'Error fetching contractual service request by ID', error: err.message });
    }
}

async function updateContractualService(req, res) {
    const { id } = req.params;
    const {
        service_date,
        origin,
        destination,
        expected_time,
        for_mr_ms,
        department,
        purpose,
        driver_name,
        vehicle_no,
        vehicle_condition,
        cnic,
        address,
        location
    } = req.body;

    console.log('User name in updateContractualService:', req.userName);

    const userName = req.userName || 'Unknown User';

    try {
        const connection = await getOracleConnection();
        const sql = `
            UPDATE contractual_service
            SET service_date = TO_DATE(:service_date, 'YYYY-MM-DD'), origin = :origin, destination = :destination, expected_time = :expected_time,
                for_mr_ms = :for_mr_ms, department = :department, purpose = :purpose, driver_name = :driver_name,
                vehicle_no = :vehicle_no, vehicle_condition = :vehicle_condition, cnic = :cnic, address = :address, location = :location
            WHERE id = :id`;

        const binds = {
            id: Number(id),
            service_date,
            origin,
            destination,
            expected_time,
            for_mr_ms,
            department,
            purpose,
            driver_name,
            vehicle_no,
            vehicle_condition,
            cnic,
            address,
            location
        };

        console.log('Executing SQL with binds:', binds);  
        await connection.execute(sql, binds, { autoCommit: true });
        await logAction('UPDATE', 'CONTRACTUAL_SERVICE', id, userName);
        await connection.close();

        res.status(200).json({ message: 'Contractual service request updated successfully' });
    } catch (err) {
        console.error('Error updating contractual service request:', err);
        res.status(500).json({ message: 'Error updating contractual service request', error: err.message });
    }
}

async function deleteContractualService(req, res) {
    const { id } = req.params;
    const { remarks } = req.body;

    console.log('User name in deleteContractualService:', req.userName);

    const userName = req.userName || 'Unknown User';

    try {
        const connection = await getOracleConnection();
        await logAction('DELETE', 'CONTRACTUAL_SERVICE', id, userName, remarks);
        await connection.execute('DELETE FROM contractual_service WHERE id = :id', { id: Number(id) }, { autoCommit: true });
        await connection.close();

        res.status(200).json({ message: 'Contractual service request deleted successfully' });
    } catch (err) {
        console.error('Error deleting contractual service request:', err);
        res.status(500).json({ message: 'Error deleting contractual service request', error: err.message });
    }
}

module.exports = {
    addContractualService,
    approveRequest,
    getAllContractualServices,
    getContractualServiceById,
    updateContractualService,
    deleteContractualService
};
