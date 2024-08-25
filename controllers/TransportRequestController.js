const oracledb = require('oracledb');
const { getOracleConnection } = require('../config/db');
const transporter = require('../config/email');
const { logAction } = require('../utils/logUtil');

async function addTransportRequest(req, res) {
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
        location
    } = req.body;

    const userName = req.userName || 'Unknown User';

    try {
        const connection = await getOracleConnection();
        const sql = `
            INSERT INTO transport_requests (
                id, request_date, origin, destination, expected_time, for_mr_ms, department, purpose, driver_name, vehicle_no,
                time_out, meter_reading_out, time_in, meter_reading_in, vehicle_condition, request_by, authorized_by, administrator,
                manager_hr, security_supervisor, location, status, approved_by
            ) VALUES (
                transport_requests_seq.NEXTVAL, TO_DATE(:request_date, 'YYYY-MM-DD'), :origin, :destination, :expected_time, :for_mr_ms, :department, :purpose, :driver_name, :vehicle_no,
                :time_out, :meter_reading_out, :time_in, :meter_reading_in, :vehicle_condition, :request_by, :authorized_by, :administrator, :manager_hr,
                :security_supervisor, :location, 'Pending', NULL
            )`;

        const binds = {
            request_date: date,
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
            location: location
        };

        await connection.execute(sql, binds, { autoCommit: true });
        await logAction('ADD', 'TRANSPORT_REQUESTS', null, userName); // Use userName for logging

        await connection.close();

        const mailOptions = {
            from: process.env.OUTLOOK_USER,
            to: process.env.ADMIN_EMAIL,
            subject: 'New Transport Request Submitted',
            text: `
                A new transport request has been submitted by ${requestBy}.
                Details:
                - Date: ${date}
                - From: ${from}
                - To: ${to}
                - Expected Time: ${expectedTime}
                - For Mr/Ms: ${forMrMs}
                - Department: ${department}
                - Purpose: ${purpose}
                - Driver Name: ${driverName}
                - Vehicle No: ${vehicleNo}
                - Time Out: ${timeOut}
                - Meter Reading Out: ${meterReadingOut}
                - Time In: ${timeIn}
                - Meter Reading In: ${meterReadingIn}
                - Vehicle Condition: ${vehicleCondition}
                - Location: ${location}
                - Status: Pending
            `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                res.status(500).json({ message: 'Transport request added but email notification failed', error: error.message });
            } else {
                console.log('Email sent:', info.response);
                res.status(201).json({ message: 'Transport request submitted successfully. Email notification sent to admin.' });
            }
        });
    } catch (err) {
        console.error('Error adding transport request:', err);
        res.status(500).json({ message: 'Error adding transport request', error: err.message });
    }
}

async function getAllTransportRequests(req, res) {
    try {
        const connection = await getOracleConnection();
        const result = await connection.execute(`
            SELECT 
                id, 
                TO_CHAR(request_date, 'YYYY-MM-DD') as request_date, 
                origin, 
                destination, 
                expected_time, 
                for_mr_ms, 
                department, 
                purpose,
                driver_name, 
                vehicle_no, 
                time_out, 
                meter_reading_out, 
                time_in, 
                meter_reading_in, 
                vehicle_condition, 
                request_by,
                location, 
                status
            FROM transport_requests
        `);

        await connection.close();

        const records = result.rows.map(row => ({
            id: row[0],
            request_date: row[1],
            origin: row[2],
            destination: row[3],
            expected_time: row[4],
            for_mr_ms: row[5],
            department: row[6],
            purpose: row[7],
            driver_name: row[8],
            vehicle_no: row[9],
            time_out: row[10],
            meter_reading_out: row[11],
            time_in: row[12],
            meter_reading_in: row[13],
            vehicle_condition: row[14],
            request_by: row[15],
            location: row[16],
            status: row[17],
        }));

        res.status(200).json(records);
    } catch (err) {
        console.error('Error fetching transport requests:', err);
        res.status(500).json({ message: 'Error fetching transport requests', error: err.message });
    }
}

async function updateTransportRequest(req, res) {
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
        status
    } = req.body;

    const userName = req.userName || 'Unknown User';
    const bindStatus = status || 'Pending';

    try {
        const connection = await getOracleConnection();
        const sql = `
            UPDATE transport_requests
            SET 
                request_date = TO_DATE(:request_date, 'YYYY-MM-DD'),
                origin = :origin,
                destination = :destination,
                expected_time = :expected_time,
                for_mr_ms = :for_mr_ms,
                department = :department,
                purpose = :purpose,
                driver_name = :driver_name,
                vehicle_no = :vehicle_no,
                time_out = :time_out,
                meter_reading_out = :meter_reading_out,
                time_in = :time_in,
                meter_reading_in = :meter_reading_in,
                vehicle_condition = :vehicle_condition,
                request_by = :request_by,
                authorized_by = :authorized_by,
                administrator = :administrator,
                manager_hr = :manager_hr,
                security_supervisor = :security_supervisor,
                location = :location,
                status = :status
            WHERE id = :id
        `;

        const binds = {
            id,
            request_date: date,
            origin: from,
            destination: to,
            expected_time: expectedTime,
            for_mr_ms: forMrMs,
            department,
            purpose,
            driver_name: driverName,
            vehicle_no: vehicleNo,
            time_out: timeOut,
            meter_reading_out: meterReadingOut,
            time_in: timeIn,
            meter_reading_in: meterReadingIn,
            vehicle_condition: vehicleCondition,
            request_by: requestBy,
            authorized_by: authorizedBy,
            administrator,
            manager_hr: managerHr,
            security_supervisor: securitySupervisor,
            location,
            status: bindStatus
        };

        const result = await connection.execute(sql, binds, { autoCommit: true });
        await logAction('UPDATE', 'TRANSPORT_REQUESTS', id, userName);

        await connection.close();

        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: 'No transport request found with this ID' });
        }

        res.status(200).json({ message: 'Transport request updated successfully' });
    } catch (err) {
        console.error('Error updating transport request:', err);
        res.status(500).json({ message: 'Error updating transport request', error: err.message });
    }
}

async function deleteTransportRequest(req, res) {
    const { id } = req.params;
    const { remarks } = req.body;
    const userName = req.userName || 'Unknown User';

    if (!remarks) {
        return res.status(400).json({ message: 'Remarks are required for deletion' });
    }

    try {
        const connection = await getOracleConnection();
        await connection.execute('DELETE FROM transport_requests WHERE id = :id', { id }, { autoCommit: true });

        // Log the deletion action with remarks
        await logAction('DELETE', 'TRANSPORT_REQUESTS', id, userName, remarks);

        await connection.close();
        res.status(200).json({ message: 'Transport request deleted successfully' });
    } catch (err) {
        console.error('Error deleting transport request:', err);
        res.status(500).json({ message: 'Error deleting transport request', error: err.message });
    }
}

async function getTransportRequestById(req, res) {
    const { id } = req.params;

    try {
        const connection = await getOracleConnection();
        const result = await connection.execute(
            `SELECT 
                id, 
                TO_CHAR(request_date, 'YYYY-MM-DD') as request_date, 
                origin, 
                destination, 
                expected_time, 
                for_mr_ms, 
                department, 
                purpose,
                driver_name, 
                vehicle_no, 
                time_out, 
                meter_reading_out, 
                time_in, 
                meter_reading_in, 
                vehicle_condition, 
                request_by,
                location 
            FROM transport_requests 
            WHERE id = :id`,
            { id }
        );

        await connection.close();

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Transport request not found' });
        }

        const record = result.rows[0];
        const formattedRecord = {
            id: record[0],
            date: record[1],
            from: record[2],
            to: record[3],
            expectedTime: record[4],
            forMrMs: record[5],
            department: record[6],
            purpose: record[7],
            driverName: record[8],
            vehicleNo: record[9],
            timeOut: record[10],
            meterReadingOut: record[11],
            timeIn: record[12],
            meterReadingIn: record[13],
            vehicleCondition: record[14],
            requestBy: record[15],
            location: record[16],
        };

        res.status(200).json(formattedRecord);
    } catch (err) {
        console.error('Error fetching transport request:', err);
        res.status(500).json({ message: 'Error fetching transport request', error: err.message });
    }
}

module.exports = {
    addTransportRequest,
    getAllTransportRequests,
    getTransportRequestById,
    updateTransportRequest,
    deleteTransportRequest
};
