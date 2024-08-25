const oracledb = require('oracledb');
const { getOracleConnection } = require('../config/db');
const { logAction } = require('../utils/logUtil'); // Import log utility

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
        unladen_weight,
        regd_laden_weight,
        counter_no,
        transferred_to,
        cnic_no,
        transferred_father_husband_name,
        transferred_address,
        location,
        user_name // Add this to the request body
    } = req.body;

    try {
        const connection = await getOracleConnection();
        const sql = `
            INSERT INTO vehicle_management (
                REGN_NO, RECORD_DATE, OWNER_NAME, FATHER_HUSBAND_NAME, ADDRESS, CLASS_OF_VEHICLE, MAKER_NAME, TYPE_OF_BODY,
                YEAR_OF_MANUFACTURE, COLOR, NUMBER_OF_CYLINDER, CHASSIS_NO, ENGINE_NO, HORSE_POWER, SEATING_CAPACITY,
                UNLADEN_WEIGHT, REGD_LADEN_WEIGHT, COUNTER_NO, TRANSFERRED_TO, CNIC_NO, TRANSFERRED_FATHER_HUSBAND_NAME,
                TRANSFERRED_ADDRESS, LOCATION
            ) VALUES (
                :regn_no, TO_DATE(:record_date, 'YYYY-MM-DD'), :owner_name, :father_husband_name, :address, :class_of_vehicle, :maker_name, :type_of_body,
                :year_of_manufacture, :color, :number_of_cylinder, :chassis_no, :engine_no, :horse_power, :seating_capacity,
                :unladen_weight, :regd_laden_weight, :counter_no, :transferred_to, :cnic_no, :transferred_father_husband_name,
                :transferred_address, :location
            )`;

        const binds = {
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
            unladen_weight,
            regd_laden_weight,
            counter_no,
            transferred_to,
            cnic_no,
            transferred_father_husband_name,
            transferred_address,
            location
        };

        const result = await connection.execute(sql, binds, { autoCommit: true });
        const vehicleId = result.lastRowid;

        // Log action
        await logAction('ADD', 'VEHICLE_MANAGEMENT', vehicleId, user_name);

        await connection.close();

        res.status(201).json({ message: 'Vehicle record added successfully' });
    } catch (err) {
        console.error('Error adding vehicle record:', err);
        res.status(500).json({ message: 'Error adding vehicle record', error: err.message });
    }
}

async function getAllVehicles(req, res) {
    try {
        const connection = await getOracleConnection();
        const result = await connection.execute(`
            SELECT ID, REGN_NO, TO_CHAR(RECORD_DATE, 'YYYY-MM-DD') as RECORD_DATE, OWNER_NAME, FATHER_HUSBAND_NAME, ADDRESS,
                   CLASS_OF_VEHICLE, MAKER_NAME, TYPE_OF_BODY, YEAR_OF_MANUFACTURE, COLOR, NUMBER_OF_CYLINDER, CHASSIS_NO,
                   ENGINE_NO, HORSE_POWER, SEATING_CAPACITY, UNLADEN_WEIGHT, REGD_LADEN_WEIGHT, COUNTER_NO, TRANSFERRED_TO,
                   CNIC_NO, TRANSFERRED_FATHER_HUSBAND_NAME, TRANSFERRED_ADDRESS, LOCATION
            FROM vehicle_management
        `);

        await connection.close();

        const records = result.rows.map(row => ({
            id: row[0],
            regn_no: row[1],
            record_date: row[2],
            owner_name: row[3],
            father_husband_name: row[4],
            address: row[5],
            class_of_vehicle: row[6],
            maker_name: row[7],
            type_of_body: row[8],
            year_of_manufacture: row[9],
            color: row[10],
            number_of_cylinder: row[11],
            chassis_no: row[12],
            engine_no: row[13],
            horse_power: row[14],
            seating_capacity: row[15],
            unladen_weight: row[16],
            regd_laden_weight: row[17],
            counter_no: row[18],
            transferred_to: row[19],
            cnic_no: row[20],
            transferred_father_husband_name: row[21],
            transferred_address: row[22],
            location: row[23],
        }));

        // Log action
        await logAction('VIEW', 'VEHICLE_MANAGEMENT', null, req.userName || 'system'); // Use session username or 'system'

        res.status(200).json(records);
    } catch (err) {
        console.error('Error fetching vehicle records:', err);
        res.status(500).json({ message: 'Error fetching vehicle records', error: err.message });
    }
}

async function updateVehicle(req, res) {
    const { id } = req.params;
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
        unladen_weight,
        regd_laden_weight,
        counter_no,
        transferred_to,
        cnic_no,
        transferred_father_husband_name,
        transferred_address,
        location,
        user_name // Add this to the request body
    } = req.body;

    try {
        const connection = await getOracleConnection();
        const sql = `
            UPDATE vehicle_management
            SET REGN_NO = :regn_no, RECORD_DATE = TO_DATE(:record_date, 'YYYY-MM-DD'), OWNER_NAME = :owner_name, FATHER_HUSBAND_NAME = :father_husband_name,
                ADDRESS = :address, CLASS_OF_VEHICLE = :class_of_vehicle, MAKER_NAME = :maker_name, TYPE_OF_BODY = :type_of_body,
                YEAR_OF_MANUFACTURE = :year_of_manufacture, COLOR = :color, NUMBER_OF_CYLINDER = :number_of_cylinder, CHASSIS_NO = :chassis_no,
                ENGINE_NO = :engine_no, HORSE_POWER = :horse_power, SEATING_CAPACITY = :seating_capacity, UNLADEN_WEIGHT = :unladen_weight,
                REGD_LADEN_WEIGHT = :regd_laden_weight, COUNTER_NO = :counter_no, TRANSFERRED_TO = :transferred_to, CNIC_NO = :cnic_no,
                TRANSFERRED_FATHER_HUSBAND_NAME = :transferred_father_husband_name, TRANSFERRED_ADDRESS = :transferred_address, LOCATION = :location
            WHERE ID = :id
        `;
        const binds = {
            id,
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
            unladen_weight,
            regd_laden_weight,
            counter_no,
            transferred_to,
            cnic_no,
            transferred_father_husband_name,
            transferred_address,
            location
        };

        await connection.execute(sql, binds, { autoCommit: true });

        // Log action
        await logAction('UPDATE', 'VEHICLE_MANAGEMENT', id, user_name);

        await connection.close();

        res.status(200).json({ message: 'Vehicle record updated successfully' });
    } catch (err) {
        console.error('Error updating vehicle record:', err);
        res.status(500).json({ message: 'Error updating vehicle record', error: err.message });
    }
}

async function deleteVehicle(req, res) {
    const { id } = req.params;
    const { user_name } = req.body; // Add this to the request body

    try {
        const connection = await getOracleConnection();
        await connection.execute('DELETE FROM vehicle_management WHERE ID = :id', { id }, { autoCommit: true });

        // Log action
        await logAction('DELETE', 'VEHICLE_MANAGEMENT', id, user_name);

        await connection.close();

        res.status(200).json({ message: 'Vehicle record deleted successfully' });
    } catch (err) {
        console.error('Error deleting vehicle record:', err);
        res.status(500).json({ message: 'Error deleting vehicle record', error: err.message });
    }
}

module.exports = {
    addVehicle,
    getAllVehicles,
    updateVehicle,
    deleteVehicle
};
