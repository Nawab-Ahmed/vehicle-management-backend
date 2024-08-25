const { getOracleConnection } = require('../config/db');
const { logAction } = require('../utils/logUtil'); // Import log utility

async function getVehicles(req, res) {
    try {
        const connection = await getOracleConnection();
        const result = await connection.execute(`
            SELECT REGN_NO, RECORD_DATE, OWNER_NAME, FATHER_HUSBAND_NAME, ADDRESS, CLASS_OF_VEHICLE, MAKER_NAME, TYPE_OF_BODY, YEAR_OF_MANUFACTURE, COLOR, NUMBER_OF_CYLINDER, CHASSIS_NO, ENGINE_NO, HORSE_POWER, SEATING_CAPACITY, LOCATION, TRACKING_ID, TRACKING_COMPANY 
            FROM VEHICLE_MANAGEMENT
        `);
        await connection.close();

        console.log('Fetched vehicles:', result.rows); // Debug log
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching vehicles:', err);
        res.status(500).json({ message: 'Error fetching vehicles' });
    }
}
async function addVehicle(req, res) {
    const {
        regn_no,
        record_date,
        owner_name,
        father_husband_name,
        address,
        class_of_vehicle,
        maker_name,
        type_of_body,
        year_of_manufacture,
        color,
        number_of_cylinder,
        chassis_no,
        engine_no,
        horse_power,
        seating_capacity,
        location,
        tracking_company
    } = req.body;

    console.log('Received Data:', req.body);

    const userName = req.userName || 'Unknown User';

    try {
        const connection = await getOracleConnection();

        // Bind variables for the SQL insert statement
        const bindVariables = {
            regn_no,
            record_date,
            owner_name,
            father_husband_name,
            address,
            class_of_vehicle,
            maker_name,
            type_of_body,
            year_of_manufacture: parseInt(year_of_manufacture, 10),
            color,
            number_of_cylinder: parseInt(number_of_cylinder, 10),
            chassis_no,
            engine_no,
            horse_power: parseInt(horse_power, 10),
            seating_capacity: parseInt(seating_capacity, 10),
            location, // Ensuring that location is included and bound properly
            tracking_company // Can be NULL
        };

        console.log('Binding Variables:', bindVariables);

        const result = await connection.execute(
            `INSERT INTO VEHICLE_MANAGEMENT 
            (REGN_NO, RECORD_DATE, OWNER_NAME, FATHER_HUSBAND_NAME, ADDRESS, CLASS_OF_VEHICLE, MAKER_NAME, TYPE_OF_BODY, YEAR_OF_MANUFACTURE, COLOR, NUMBER_OF_CYLINDER, CHASSIS_NO, ENGINE_NO, HORSE_POWER, SEATING_CAPACITY, LOCATION, TRACKING_COMPANY) 
            VALUES (:regn_no, TO_DATE(:record_date, 'YYYY-MM-DD'), :owner_name, :father_husband_name, :address, :class_of_vehicle, :maker_name, :type_of_body, :year_of_manufacture, :color, :number_of_cylinder, :chassis_no, :engine_no, :horse_power, :seating_capacity, :location, :tracking_company)`,
            bindVariables,
            { autoCommit: true }
        );

        console.log('Insert Result:', result);

        const vehicleId = result.lastRowid;

        await logAction('ADD', 'VEHICLE_MANAGEMENT', vehicleId, userName);

        await connection.close();
        res.status(201).json({ message: 'Vehicle added successfully' });
    } catch (err) {
        console.error('Error adding vehicle:', err);
        res.status(500).json({ message: 'Error adding vehicle', error: err });
    }
}
async function updateVehicle(req, res) {
    const { regn_no } = req.params;
    const {
        record_date,
        owner_name,
        father_husband_name,
        address,
        class_of_vehicle,
        maker_name,
        type_of_body,
        year_of_manufacture,
        color,
        number_of_cylinder,
        chassis_no,
        engine_no,
        horse_power,
        seating_capacity,
        location,
        tracking_company
    } = req.body;

    // Log or throw an error if critical parameters are missing
    if (!regn_no) {
        return res.status(400).json({ message: 'REGN_NO is required for updating a vehicle.' });
    }

    if (!tracking_company) {
        console.warn('Tracking company is undefined, make sure this is intentional.');
    }

    const userName = req.userName || 'Unknown User';

    try {
        const connection = await getOracleConnection();

        // Bind variables for the SQL update statement
        const bindVariables = {
            regn_no,
            record_date,
            owner_name,
            father_husband_name,
            address,
            class_of_vehicle,
            maker_name,
            type_of_body,
            year_of_manufacture: parseInt(year_of_manufacture, 10),
            color,
            number_of_cylinder: parseInt(number_of_cylinder, 10),
            chassis_no,
            engine_no,
            horse_power: parseInt(horse_power, 10),
            seating_capacity: parseInt(seating_capacity, 10),
            location,
            tracking_company: tracking_company || null  // Allow tracking_company to be null if undefined
        };

        console.log('Binding Variables:', bindVariables);

        const result = await connection.execute(
            `UPDATE VEHICLE_MANAGEMENT 
            SET RECORD_DATE=TO_DATE(:record_date, 'YYYY-MM-DD'), 
                OWNER_NAME=:owner_name, 
                FATHER_HUSBAND_NAME=:father_husband_name, 
                ADDRESS=:address, 
                CLASS_OF_VEHICLE=:class_of_vehicle, 
                MAKER_NAME=:maker_name, 
                TYPE_OF_BODY=:type_of_body, 
                YEAR_OF_MANUFACTURE=:year_of_manufacture, 
                COLOR=:color, 
                NUMBER_OF_CYLINDER=:number_of_cylinder, 
                CHASSIS_NO=:chassis_no, 
                ENGINE_NO=:engine_no, 
                HORSE_POWER=:horse_power, 
                SEATING_CAPACITY=:seating_capacity, 
                LOCATION=:location, 
                TRACKING_COMPANY=:tracking_company 
            WHERE REGN_NO=:regn_no`,
            bindVariables,
            { autoCommit: true }
        );

        console.log('Update Result:', result);

        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: 'No vehicle found with this registration number' });
        }

        await logAction('UPDATE', 'VEHICLE_MANAGEMENT', regn_no, userName);

        await connection.close();
        res.status(200).json({ message: 'Vehicle updated successfully' });
    } catch (err) {
        console.error('Error updating vehicle:', err);
        res.status(500).json({ message: 'Error updating vehicle', error: err });
    }
}

async function deleteVehicle(req, res) {
    const { regn_no } = req.params;
    const { remarks } = req.body;

    const userName = req.userName || 'Unknown User'; // Get the username from the request

    if (!remarks) {
        return res.status(400).json({ message: 'Remarks are required for deletion' });
    }

    try {
        const connection = await getOracleConnection();
        const result = await connection.execute(
            'DELETE FROM VEHICLE_MANAGEMENT WHERE REGN_NO = :regn_no',
            { regn_no },
            { autoCommit: true }
        );

        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        // Log the deletion action with remarks
        await connection.execute(
            `INSERT INTO deletion_logs (vehicle_id, remarks) VALUES (:regn_no, :remarks)`,
            { regn_no, remarks },
            { autoCommit: true }
        );

        await logAction('DELETE', 'VEHICLE_MANAGEMENT', regn_no, userName); // Log action with the correct user
        await connection.close();

        res.status(200).json({ message: 'Vehicle deleted successfully' });
    } catch (err) {
        console.error('Error deleting vehicle:', err);
        res.status(500).json({ message: 'Error deleting vehicle' });
    }
}

module.exports = { getVehicles, addVehicle, updateVehicle, deleteVehicle };
