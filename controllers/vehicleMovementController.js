const { getOracleConnection } = require('../config/db');
const { logAction } = require('../utils/logUtil'); // Ensure correct import for logAction

async function getAllVehicleMovements(req, res) {
    console.log("GET /api/vehicle-movement");
    try {
        const connection = await getOracleConnection();
        const result = await connection.execute('SELECT * FROM vehicle_movement');
        console.log("Vehicle movements fetched:", result.rows);
        await connection.close();
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching vehicle movements:", error);
        res.status(500).json({ message: 'Error fetching vehicle movements', error });
    }
}

async function addVehicleMovement(req, res) {
    console.log("POST /api/vehicle-movement", req.body);
    const { ownerName, assignedDate, carNumber, makerName, typeOfBody, chassisNo, cnicNo, transferredTo } = req.body;

    const user = req.userName || 'Unknown User'; // Use the user from session

    try {
        const connection = await getOracleConnection();
        const sql = `INSERT INTO vehicle_movement (
            id, owner_name, assigned_date, car_number, maker_name, type_of_body, chassis_no, cnic_no, transferred_to
        ) VALUES (
            vehicle_movement_seq.NEXTVAL, :owner_name, TO_DATE(:assigned_date, 'YYYY-MM-DD'), :car_number, :maker_name, :type_of_body, :chassis_no, :cnic_no, :transferred_to
        )`;

        const binds = {
            owner_name: ownerName,
            assigned_date: assignedDate,
            car_number: carNumber,
            maker_name: makerName,
            type_of_body: typeOfBody,
            chassis_no: chassisNo,
            cnic_no: cnicNo,
            transferred_to: transferredTo
        };

        await connection.execute(sql, binds, { autoCommit: true });
        await logAction('ADD', 'VEHICLE_MOVEMENT', null, user); // Log action with the correct user
        await connection.close();

        res.status(201).json({ message: 'Vehicle movement added successfully' });
    } catch (error) {
        console.error("Error adding vehicle movement:", error);
        res.status(500).json({ message: 'Error adding vehicle movement', error });
    }
}

async function getVehicleMovementById(req, res) {
    console.log("GET /api/vehicle-movement/:id", req.params);
    const { id } = req.params;

    try {
        const connection = await getOracleConnection();
        const result = await connection.execute('SELECT * FROM vehicle_movement WHERE id = :id', { id });
        await connection.close();

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Vehicle movement not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching vehicle movement by ID:", error);
        res.status(500).json({ message: 'Error fetching vehicle movement by ID', error });
    }
}

async function updateVehicleMovement(req, res) {
    console.log("PUT /api/vehicle-movement/:id", req.params, req.body);
    const { id } = req.params;
    const { ownerName, assignedDate, carNumber, makerName, typeOfBody, chassisNo, cnicNo, transferredTo } = req.body;

    const user = req.userName || 'Unknown User'; // Use the user from session

    try {
        const connection = await getOracleConnection();
        const sql = `UPDATE vehicle_movement
            SET owner_name = :owner_name, assigned_date = TO_DATE(:assigned_date, 'YYYY-MM-DD'), car_number = :car_number, maker_name = :maker_name,
                type_of_body = :type_of_body, chassis_no = :chassis_no, cnic_no = :cnic_no, transferred_to = :transferred_to
            WHERE id = :id`;

        const binds = {
            id,
            owner_name: ownerName,
            assigned_date: assignedDate,
            car_number: carNumber,
            maker_name: makerName,
            type_of_body: typeOfBody,
            chassis_no: chassisNo,
            cnic_no: cnicNo,
            transferred_to: transferredTo
        };

        await connection.execute(sql, binds, { autoCommit: true });
        await logAction('UPDATE', 'VEHICLE_MOVEMENT', id, user); // Log action with the correct user
        await connection.close();

        res.status(200).json({ message: 'Vehicle movement updated successfully' });
    } catch (error) {
        console.error("Error updating vehicle movement:", error);
        res.status(500).json({ message: 'Error updating vehicle movement', error });
    }
}

async function deleteVehicleMovement(req, res) {
    console.log("DELETE /api/vehicle-movement/:id", req.params, req.body);
    const { id } = req.params;
    const { reason } = req.body;

    const user = req.userName || 'Unknown User'; // Use the user from session

    if (!reason) {
        return res.status(400).json({ message: 'Reason for deletion is required' });
    }

    try {
        const connection = await getOracleConnection();
        await connection.execute('DELETE FROM vehicle_movement WHERE id = :id', { id: Number(id) }, { autoCommit: true });
        await logAction('DELETE', 'VEHICLE_MOVEMENT', id, user, reason); // Log action with the correct user
        await connection.close();

        res.status(200).json({ message: 'Vehicle movement deleted successfully' });
    } catch (error) {
        console.error("Error deleting vehicle movement:", error);
        res.status(500).json({ message: 'Error deleting vehicle movement', error });
    }
}

module.exports = {
    getAllVehicleMovements,
    addVehicleMovement,
    getVehicleMovementById,
    updateVehicleMovement,
    deleteVehicleMovement
};
