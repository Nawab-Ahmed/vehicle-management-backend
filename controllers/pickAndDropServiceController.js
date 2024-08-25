const oracledb = require('oracledb');
const { getOracleConnection } = require('../config/db');
const { logAction } = require('../utils/logUtil');

async function addPickAndDropService(req, res) {
    const {
        date,
        from,
        to,
        expectedTime,
        forMrMs,
        department,
        purpose,
        driverName,
        vehicleNo,
        timeOut,
        meterReadingOut,
        timeIn,
        meterReadingIn,
        vehicleCondition,
        requestBy,
        authorizedBy,
        administrator,
        managerHr,
        securitySupervisor,
        location,
        status,
        driverPhoto = null
    } = req.body;

    const userName = req.userName || 'Unknown User';

    if (!date) {
        return res.status(400).json({ message: 'SERVICE_DATE is required' });
    }

    let connection;

    try {
        connection = await getOracleConnection();

        const sql = `
            INSERT INTO pick_drop_service (
                ID, SERVICE_DATE, ORIGIN, DESTINATION, EXPECTED_TIME, FOR_MR_MS, DEPARTMENT, PURPOSE,
                DRIVER_NAME, VEHICLE_NO, TIME_OUT, METER_READING_OUT, TIME_IN, METER_READING_IN,
                VEHICLE_CONDITION, REQUEST_BY, AUTHORIZED_BY, ADMINISTRATOR, MANAGER_HR,
                SECURITY_SUPERVISOR, LOCATION, STATUS, DRIVER_PHOTO
            ) VALUES (
                pick_drop_service_seq.NEXTVAL, TO_DATE(:service_date, 'YYYY-MM-DD'), :origin, :destination, :expected_time,
                :for_mr_ms, :department, :purpose, :driver_name, :vehicle_no, :time_out, :meter_reading_out,
                :time_in, :meter_reading_in, :vehicle_condition, :request_by, :authorized_by, :administrator,
                :manager_hr, :security_supervisor, :location, :status, EMPTY_BLOB()
            ) RETURNING ID, DRIVER_PHOTO INTO :id, :driver_photo`;

        const binds = {
            service_date: date,
            origin: from,
            destination: to,
            expected_time: expectedTime,
            for_mr_ms: forMrMs,
            department: department,
            purpose: purpose,
            driver_name: driverName,
            vehicle_no: vehicleNo,
            time_out: timeOut,
            meter_reading_out: meterReadingOut,
            time_in: timeIn,
            meter_reading_in: meterReadingIn,
            vehicle_condition: vehicleCondition,
            request_by: requestBy,
            authorized_by: authorizedBy,
            administrator: administrator,
            manager_hr: managerHr,
            security_supervisor: securitySupervisor,
            location: location,
            status: status,
            id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
            driver_photo: { type: oracledb.BLOB, dir: oracledb.BIND_OUT }
        };

        const result = await connection.execute(sql, binds, { autoCommit: false });

        const lob = result.outBinds.driver_photo[0];
        const id = result.outBinds.id[0];

        if (driverPhoto && lob) {
            await new Promise((resolve, reject) => {
                lob.on('error', reject);
                lob.on('finish', resolve);
                lob.write(Buffer.from(driverPhoto, 'base64'));
                lob.end();
            });
        }

        await connection.commit();
        await logAction('ADD', 'PICK_DROP_SERVICE', id, userName); // Log the action with the username
        await connection.close();

        res.status(201).json({ message: 'Pick and drop service request added successfully' });
    } catch (err) {
        if (connection) {
            await connection.close();
        }
        console.error('Error adding pick and drop service request:', err);
        res.status(500).json({ message: 'Error adding pick and drop service request', error: err.message });
    }
}

async function getAllPickAndDropServices(req, res) {
    try {
        const connection = await getOracleConnection();
        console.log('Oracle connection established');

        const result = await connection.execute(`
            SELECT ID, TO_CHAR(SERVICE_DATE, 'YYYY-MM-DD') as SERVICE_DATE, ORIGIN, DESTINATION, EXPECTED_TIME, FOR_MR_MS,
                   DEPARTMENT, PURPOSE, DRIVER_NAME, VEHICLE_NO, TIME_OUT, METER_READING_OUT, TIME_IN,
                   METER_READING_IN, VEHICLE_CONDITION, REQUEST_BY, AUTHORIZED_BY, ADMINISTRATOR, MANAGER_HR,
                   SECURITY_SUPERVISOR, LOCATION, STATUS
            FROM pick_drop_service
        `);

        await connection.close();
        console.log('Pick and drop service requests fetched:', result.rows);

        const records = result.rows.map(row => ({
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
            timeOut: row[10],
            meterReadingOut: row[11],
            timeIn: row[12],
            meterReadingIn: row[13],
            vehicleCondition: row[14],
            requestBy: row[15],
            authorizedBy: row[16],
            administrator: row[17],
            managerHr: row[18],
            securitySupervisor: row[19],
            location: row[20],
            status: row[21]
        }));

        res.status(200).json(records);
    } catch (err) {
        console.error('Error fetching pick and drop service requests:', err);
        res.status(500).json({ message: 'Error fetching pick and drop service requests', error: err.message });
    }
}

async function getPickAndDropServiceById(req, res) {
    const { id } = req.params;

    try {
        const connection = await getOracleConnection();
        const result = await connection.execute(
            `SELECT ID, TO_CHAR(SERVICE_DATE, 'YYYY-MM-DD') as SERVICE_DATE, ORIGIN, DESTINATION, EXPECTED_TIME, FOR_MR_MS,
                    DEPARTMENT, PURPOSE, DRIVER_NAME, VEHICLE_NO, TIME_OUT, METER_READING_OUT, TIME_IN,
                    METER_READING_IN, VEHICLE_CONDITION, REQUEST_BY, AUTHORIZED_BY, ADMINISTRATOR, MANAGER_HR,
                    SECURITY_SUPERVISOR, LOCATION, STATUS
             FROM pick_drop_service
             WHERE ID = :id`,
            { id: Number(id) }
        );

        await connection.close();

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Pick and drop service not found' });
        }

        const row = result.rows[0];
        const record = {
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
            timeOut: row[10],
            meterReadingOut: row[11],
            timeIn: row[12],
            meterReadingIn: row[13],
            vehicleCondition: row[14],
            requestBy: row[15],
            authorizedBy: row[16],
            administrator: row[17],
            managerHr: row[18],
            securitySupervisor: row[19],
            location: row[20],
            status: row[21]
        };

        res.status(200).json(record);
    } catch (err) {
        console.error('Error fetching pick and drop service by ID:', err);
        res.status(500).json({ message: 'Error fetching pick and drop service by ID', error: err.message });
    }
}

async function updatePickAndDropService(req, res) {
    const { id } = req.params;
    const {
        date,
        from,
        to,
        expectedTime,
        forMrMs,
        department,
        purpose,
        driverName,
        vehicleNo,
        timeOut,
        meterReadingOut,
        timeIn,
        meterReadingIn,
        vehicleCondition,
        requestBy,
        authorizedBy,
        administrator,
        managerHr,
        securitySupervisor,
        location,
        status,
        driverPhoto
    } = req.body;

    const userName = req.userName || 'Unknown User';

    try {
        const connection = await getOracleConnection();
        const sql = `
            UPDATE pick_drop_service
            SET service_date = TO_DATE(:service_date, 'YYYY-MM-DD'), origin = :origin, destination = :destination, expected_time = :expected_time,
                for_mr_ms = :for_mr_ms, department = :department, purpose = :purpose, driver_name = :driver_name,
                vehicle_no = :vehicle_no, time_out = :time_out, meter_reading_out = :meter_reading_out, time_in = :time_in,
                meter_reading_in = :meter_reading_in, vehicle_condition = :vehicle_condition, security_supervisor = :security_supervisor,
                administrator = :administrator, manager_hr = :manager_hr, request_by = :request_by, authorized_by = :authorized_by,
                location = :location, status = :status
            WHERE id = :id`;

        const binds = {
            id: Number(id),
            service_date: date,
            origin: from,
            destination: to,
            expected_time: expectedTime,
            for_mr_ms: forMrMs,
            department: department,
            purpose: purpose,
            driver_name: driverName,
            vehicle_no: vehicleNo,
            time_out: timeOut,
            meter_reading_out: meterReadingOut,
            time_in: timeIn,
            meter_reading_in: meterReadingIn,
            vehicle_condition: vehicleCondition,
            security_supervisor: securitySupervisor,
            administrator: administrator,
            manager_hr: managerHr,
            request_by: requestBy,
            authorized_by: authorizedBy,
            location: location,
            status: status
        };

        await connection.execute(sql, binds, { autoCommit: true });
        await logAction('UPDATE', 'PICK_DROP_SERVICE', id, userName); // Log the update action with the username
        await connection.close();

        res.status(200).json({ message: 'Pick and Drop service request updated successfully' });
    } catch (err) {
        console.error('Error updating pick and drop service request:', err);
        res.status(500).json({ message: 'Error updating pick and drop service request', error: err.message });
    }
}

async function deletePickAndDropService(req, res) {
    const { id } = req.params;
    const userName = req.userName || 'Unknown User';

    try {
        const connection = await getOracleConnection();
        await connection.execute('DELETE FROM pick_drop_service WHERE id = :id', { id: Number(id) }, { autoCommit: true });
        await logAction('DELETE', 'PICK_DROP_SERVICE', id, userName); // Log the delete action with the username
        await connection.close();

        res.status(200).json({ message: 'Pick and Drop service request deleted successfully' });
    } catch (err) {
        console.error('Error deleting pick and drop service request:', err);
        res.status(500).json({ message: 'Error deleting pick and drop service request', error: err.message });
    }
}

module.exports = {
    addPickAndDropService,
    getAllPickAndDropServices,
    getPickAndDropServiceById,
    updatePickAndDropService,
    deletePickAndDropService
};
