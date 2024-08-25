const { getOracleConnection } = require('../config/db');

const getVehicleMaintenanceRequests = async (req, res) => {
    try {
        const connection = await getOracleConnection();
        const result = await connection.execute(`
            SELECT id, user_name, maintenance_date, status, gate_pass_generated, vehicle_no, make, model, 
                   meter_reading_present, meter_reading_previous, maintenance_interval, maintenance_detail, 
                   estimated_cost, submitted_by, location, vendor_type, standard_vendor, local_vendor 
            FROM vehicle_maintenance
        `);
        await connection.close();

        // Format the result to include the field names for better frontend compatibility
        const formattedResult = result.rows.map(row => ({
            id: row[0],
            user_name: row[1],
            maintenance_date: row[2],
            status: row[3],
            gate_pass_generated: row[4],
            vehicle_no: row[5],
            make: row[6],
            model: row[7],
            meter_reading_present: row[8],
            meter_reading_previous: row[9],
            maintenance_interval: row[10],
            maintenance_detail: row[11],
            estimated_cost: row[12],
            submitted_by: row[13],
            location: row[14],
            vendor_type: row[15],
            standard_vendor: row[16],
            local_vendor: row[17],
        }));

        res.status(200).json(formattedResult);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vehicle maintenance requests', error });
    }
};

const getTransportRequests = async (req, res) => {
    try {
        const connection = await getOracleConnection();
        const result = await connection.execute('SELECT * FROM transport_requests');
        await connection.close();
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transport requests', error });
    }
};

const getPickAndDropRequests = async (req, res) => {
    try {
        const connection = await getOracleConnection();
        const result = await connection.execute('SELECT * FROM pick_drop_service');
        await connection.close();
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pick and drop requests', error });
    }
};

const getContractualServiceRequests = async (req, res) => {
    try {
        const connection = await getOracleConnection();
        const result = await connection.execute('SELECT * FROM contractual_service');
        await connection.close();
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contractual service requests', error });
    }
};

const getAllRequests = async (req, res) => {
    try {
        const connection = await getOracleConnection();
        const result = await connection.execute(`
            SELECT 'vehicle_maintenance' as type, id, user_name as requester, maintenance_date as request_date, status 
            FROM vehicle_maintenance
            UNION ALL
            SELECT 'transport_requests' as type, id, request_by as requester, request_date, status 
            FROM transport_requests
            UNION ALL
            SELECT 'pick_drop_service' as type, id, request_by as requester, service_date as request_date, status 
            FROM pick_drop_service
            UNION ALL
            SELECT 'contractual_service' as type, id, for_mr_ms as requester, service_date as request_date, status 
            FROM contractual_service
        `);
        await connection.close();
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching all requests:', error);
        res.status(500).json({ message: 'Error fetching all requests', error });
    }
};

const approveRequest = async (req, res) => {
    const { id } = req.params;
    const { type } = req.body;

    let table;
    let query = `UPDATE `;

    switch (type) {
        case 'vehicle_maintenance':
            table = 'vehicle_maintenance';
            query += `vehicle_maintenance SET status = 'approved', gate_pass_generated = 'NO' `;
            break;
        case 'transport_requests':
            table = 'transport_requests';
            query += `${table} SET status = 'approved', approved_by = 'YourApproverName' `; // Update approved_by as needed
            break;
        case 'pick_drop_service':
            table = 'pick_drop_service';
            query += `${table} SET status = 'approved' `;
            break;
        case 'contractual_service':
            table = 'contractual_service';
            query += `${table} SET status = 'approved' `;
            break;
        default:
            return res.status(400).json({ message: 'Invalid request type' });
    }

    query += ` WHERE id = :id`;

    try {
        const connection = await getOracleConnection();
        
        // Debug: Log the table and id
        console.log(`Approving request in table: ${table} for ID: ${id}`);
        
        const result = await connection.execute(query, { id }, { autoCommit: true });

        // Debug: Log the result of the update
        console.log('Update result:', result);

        await connection.close();
        res.status(200).json({ message: 'Request approved successfully' });
    } catch (error) {
        console.error('Error approving request:', error);  // Log the error
        res.status(500).json({ message: 'Error approving request', error });
    }
};

const rejectRequest = async (req, res) => {
    const { id } = req.params;
    const { type } = req.body;

    let table;
    switch (type) {
        case 'vehicle_maintenance':
            table = 'vehicle_maintenance';
            break;
        case 'transport_requests':
            table = 'transport_requests';
            break;
        case 'pick_drop_service':
            table = 'pick_drop_service';
            break;
        case 'contractual_service':
            table = 'contractual_service';
            break;
        default:
            return res.status(400).json({ message: 'Invalid request type' });
    }

    try {
        const connection = await getOracleConnection();
        await connection.execute(`UPDATE ${table} SET status = 'rejected' WHERE id = :id`, { id }, { autoCommit: true });
        await connection.close();
        res.status(200).json({ message: 'Request rejected successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting request', error });
    }
};

module.exports = {
    getVehicleMaintenanceRequests,
    getTransportRequests,
    getPickAndDropRequests,
    getContractualServiceRequests,
    getAllRequests,
    approveRequest,
    rejectRequest
};
