const oracledb = require('oracledb');
const { getOracleConnection } = require('../config/db');
const transporter = require('../config/email');
const { logAction } = require('../utils/logUtil'); // Ensure correct import for logAction

async function addVehicleMaintenance(req, res) {
    const {
        date,
        userName,
        vehicleNo,
        make,
        model,
        meterReadingPresent,
        meterReadingPrevious,
        maintenanceInterval,
        maintenanceDetail,
        estimatedCost,
        submittedBy,
        location,
        vendorType,
        standardVendor,
        localVendor,
        signature
    } = req.body;

    const user = req.userName || 'Unknown User'; // Use the user from session

    try {
        const connection = await getOracleConnection();
        const sql = `
            DECLARE
                v_signature BLOB;
            BEGIN
                INSERT INTO vehicle_maintenance (
                    id, maintenance_date, user_name, vehicle_no, make, model, meter_reading_present, meter_reading_previous,
                    maintenance_interval, maintenance_detail, estimated_cost, submitted_by, location,
                    vendor_type, standard_vendor, local_vendor, signature
                ) VALUES (
                    vehicle_maintenance_seq.NEXTVAL, TO_DATE(:date, 'YYYY-MM-DD'), :userName, :vehicleNo, :make, :model, :meterReadingPresent,
                    :meterReadingPrevious, :maintenanceInterval, :maintenanceDetail, :estimatedCost, :submittedBy,
                    :location, :vendorType, :standardVendor, :localVendor, EMPTY_BLOB()
                ) RETURNING signature INTO v_signature;
                :signature := v_signature;
            END;`;

        const binds = {
            date,
            userName,
            vehicleNo,
            make,
            model,
            meterReadingPresent,
            meterReadingPrevious,
            maintenanceInterval,
            maintenanceDetail,
            estimatedCost,
            submittedBy,
            location,
            vendorType,
            standardVendor,
            localVendor,
            signature: { type: oracledb.BLOB, dir: oracledb.BIND_OUT }
        };

        const result = await connection.execute(sql, binds, { autoCommit: true });
        const maintenanceId = result.lastRowid;

        await logAction('ADD', 'VEHICLE_MAINTENANCE', maintenanceId, user); // Log action with the correct user

        await connection.close();

        // Send email notification to admin
        const mailOptions = {
            from: process.env.OUTLOOK_USER,
            to: process.env.ADMIN_EMAIL,
            subject: 'New Vehicle Maintenance Request Submitted',
            text: `
                A new vehicle maintenance request has been submitted by ${submittedBy}.
                Details:
                - Date: ${date}
                - User Name: ${userName}
                - Vehicle No: ${vehicleNo}
                - Make: ${make}
                - Model: ${model}
                - Present Meter Reading: ${meterReadingPresent}
                - Previous Meter Reading: ${meterReadingPrevious}
                - Maintenance Interval: ${maintenanceInterval}
                - Maintenance Detail: ${maintenanceDetail}
                - Estimated Cost: ${estimatedCost}
                - Location: ${location}
                - Vendor Type: ${vendorType}
                - Standard Vendor: ${standardVendor}
                - Local Vendor: ${localVendor}
            `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                res.status(500).json({ message: 'Vehicle maintenance record added but email notification failed', error: error.message });
            } else {
                console.log('Email sent:', info.response);
                res.status(201).json({ message: 'Vehicle maintenance record added successfully. Email notification sent to admin.' });
            }
        });
    } catch (err) {
        console.error('Error adding vehicle maintenance record:', err);
        res.status(500).json({ message: 'Error adding vehicle maintenance record', error: err.message });
    }
}

async function getAllVehicleMaintenance(req, res) {
    try {
        const connection = await getOracleConnection();
        console.log('Oracle connection established');

        const result = await connection.execute(`
            SELECT id, TO_CHAR(maintenance_date, 'YYYY-MM-DD') as maintenance_date, 
                   user_name, vehicle_no, make, model, meter_reading_present, 
                   meter_reading_previous, maintenance_interval, maintenance_detail, 
                   estimated_cost, submitted_by, location, vendor_type, standard_vendor, 
                   local_vendor, status, gate_pass_generated
            FROM vehicle_maintenance
        `);
        
        await connection.close();
        console.log('Vehicle maintenance records fetched:', result.rows);

        const records = result.rows.map(row => ({
            ID: row[0],
            MAINTENANCE_DATE: row[1],
            USER_NAME: row[2],
            VEHICLE_NO: row[3],
            MAKE: row[4],
            MODEL: row[5],
            METER_READING_PRESENT: row[6],
            METER_READING_PREVIOUS: row[7],
            MAINTENANCE_INTERVAL: row[8],
            MAINTENANCE_DETAIL: row[9],
            ESTIMATED_COST: row[10],
            SUBMITTED_BY: row[11],
            LOCATION: row[12],
            VENDOR_TYPE: row[13],
            STANDARD_VENDOR: row[14],
            LOCAL_VENDOR: row[15],
            STATUS: row[16],
            GATE_PASS_GENERATED: row[17]
        }));

        res.status(200).json(records);
    } catch (err) {
        console.error('Error fetching vehicle maintenance records:', err);
        res.status(500).json({ message: 'Error fetching vehicle maintenance records', error: err.message });
    }
}

async function updateVehicleMaintenance(req, res) {
    const { id } = req.params;
    const {
        maintenanceDate,
        userName,
        vehicleNo,
        make,
        model,
        meterReadingPresent,
        meterReadingPrevious,
        maintenanceInterval,
        maintenanceDetail,
        estimatedCost,
        submittedBy,
        location,
        vendorType,
        standardVendor,
        localVendor,
        signature
    } = req.body;

    const user = req.userName || 'Unknown User'; // Use the user from session

    if (!maintenanceDate) {
        return res.status(400).json({ message: 'Maintenance Date is required' });
    }

    try {
        const connection = await getOracleConnection();
        const sql = `
            UPDATE vehicle_maintenance
            SET
                maintenance_date = TO_DATE(:maintenanceDate, 'YYYY-MM-DD'),
                user_name = :userName,
                vehicle_no = :vehicleNo,
                make = :make,
                model = :model,
                meter_reading_present = :meterReadingPresent,
                meter_reading_previous = :meterReadingPrevious,
                maintenance_interval = :maintenanceInterval,
                maintenance_detail = :maintenanceDetail,
                estimated_cost = :estimatedCost,
                submitted_by = :submittedBy,
                location = :location,
                vendor_type = :vendorType,
                standard_vendor = :standardVendor,
                local_vendor = :localVendor,
                signature = EMPTY_BLOB()
            WHERE id = :id
            RETURNING signature INTO :signature`;

        const binds = {
            id,
            maintenanceDate,
            userName,
            vehicleNo,
            make,
            model,
            meterReadingPresent,
            meterReadingPrevious,
            maintenanceInterval,
            maintenanceDetail,
            estimatedCost,
            submittedBy,
            location,
            vendorType,
            standardVendor,
            localVendor,
            signature: { type: oracledb.BLOB, dir: oracledb.BIND_OUT }
        };

        console.log("SQL Query:", sql); // Debug line
        console.log("Binds:", binds); // Debug line

        const result = await connection.execute(sql, binds, { autoCommit: true });

        await logAction('UPDATE', 'VEHICLE_MAINTENANCE', id, user); // Log action with the correct user

        await connection.close();

        res.status(200).json({ message: 'Vehicle maintenance record updated successfully' });
    } catch (err) {
        console.error('Error updating vehicle maintenance record:', err);
        res.status(500).json({ message: 'Error updating vehicle maintenance record', error: err.message });
    }
}

async function deleteVehicleMaintenance(req, res) {
    const { id } = req.params;
    const { remarks } = req.body;

    const user = req.userName || 'Unknown User'; // Use the user from session

    if (!remarks) {
        return res.status(400).json({ message: 'Remarks are required for deletion' });
    }

    try {
        const connection = await getOracleConnection();
        await connection.execute('DELETE FROM vehicle_maintenance WHERE id = :id', { id }, { autoCommit: true });

        // Log the deletion action with remarks
        await connection.execute(
            `INSERT INTO deletion_logs (vehicle_id, remarks) VALUES (:id, :remarks)`,
            { id, remarks },
            { autoCommit: true }
        );

        await logAction('DELETE', 'VEHICLE_MAINTENANCE', id, user); // Log action with the correct user

        await connection.close();

        res.status(200).json({ message: 'Vehicle maintenance record deleted successfully' });
    } catch (err) {
        console.error('Error deleting vehicle maintenance record:', err);
        res.status(500).json({ message: 'Error deleting vehicle maintenance record', error: err.message });
    }
}

const getVehicleMaintenanceById = async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await getOracleConnection();
        const result = await connection.execute(
            `SELECT id, TO_CHAR(maintenance_date, 'YYYY-MM-DD') as maintenance_date, user_name, vehicle_no, make, model, meter_reading_present, meter_reading_previous,
                    maintenance_interval, maintenance_detail, estimated_cost, submitted_by, location,
                    vendor_type, standard_vendor, local_vendor, status, gate_pass_generated
             FROM vehicle_maintenance WHERE id = :id`,
            { id }
        );
        
        await connection.close();

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }

        const record = result.rows[0];
        const formattedRecord = {
            id: record[0],
            date: record[1],
            userName: record[2],
            vehicleNo: record[3],
            make: record[4],
            model: record[5],
            meterReadingPresent: record[6],
            meterReadingPrevious: record[7],
            maintenanceInterval: record[8],
            maintenanceDetail: record[9],
            estimatedCost: record[10],
            submittedBy: record[11],
            location: record[12],
            vendorType: record[13],
            standardVendor: record[14],
            localVendor: record[15],
            status: record[16],  // Add status field
            gate_pass_generated: record[17]  // Add gate_pass_generated field
        };

        res.status(200).json(formattedRecord);
    } catch (err) {
        console.error('Error fetching vehicle maintenance record:', err);
        res.status(500).json({ message: 'Error fetching vehicle maintenance record', error: err.message });
    }
};

async function generateGatePass(req, res) {
    const { id } = req.params;

    try {
        const connection = await getOracleConnection();
        
        // Check if the vehicle maintenance request is approved and gate pass is not already generated
        const result = await connection.execute(
            `SELECT status, gate_pass_generated FROM vehicle_maintenance WHERE id = :id`,
            { id }
        );

        const record = result.rows[0];
        if (!record) {
            await connection.close();
            return res.status(404).json({ message: 'Vehicle maintenance record not found' });
        }

        if (record[0] !== 'approved') {
            await connection.close();
            return res.status(400).json({ message: 'Gate pass can only be generated after approval' });
        }

        if (record[1] === 'YES') {
            await connection.close();
            return res.status(400).json({ message: 'Gate pass has already been generated' });
        }

        // Update the gate_pass_generated field
        await connection.execute(
            `UPDATE vehicle_maintenance SET gate_pass_generated = 'YES' WHERE id = :id`,
            { id },
            { autoCommit: true }
        );

        await connection.close();
        res.status(200).json({ message: 'Gate pass generated successfully' });
    } catch (err) {
        console.error('Error generating gate pass:', err);
        res.status(500).json({ message: 'Error generating gate pass', error: err.message });
    }
}

module.exports = {
    addVehicleMaintenance,
    getAllVehicleMaintenance,
    getVehicleMaintenanceById,
    updateVehicleMaintenance,
    deleteVehicleMaintenance,
    generateGatePass // Export the new function
};
