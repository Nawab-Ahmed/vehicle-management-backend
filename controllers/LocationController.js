const { logAction } = require('../utils/logUtil'); // Import log utility

const { getOracleConnection } = require('../config/db');

async function getLocations(req, res) {
    try {
        const connection = await getOracleConnection();
        
        console.log('Connection established with the database.'); // Log the connection

        const result = await connection.execute(
            'SELECT ID, LOCATION_NAME, REGION, LOCATION_ADDRESS, LOCATION_PHONE, ADDED_BY FROM LOCATIONS'
        );

        console.log('Raw data fetched from DB:', result.rows); // Log the raw fetched rows

        await connection.close();
        console.log('Database connection closed.'); // Log the connection closure

        const locations = result.rows.map(row => ({
            id: row[0],
            locationName: row[1],
            region: row[2],
            locationAddress: row[3],
            locationPhone: row[4],
            addedBy: row[5]
        }));

        console.log('Formatted Locations:', locations); // Log the formatted locations

        res.status(200).json(locations);
    } catch (err) {
        console.error('Error fetching locations:', err);
        res.status(500).json({ message: 'Error fetching locations', error: err.message });
    }
}

async function addLocation(req, res) {
    const { locationName, region, locationAddress, locationPhone } = req.body;
    const userName = req.userName || 'Unknown User';  // Get the username from the session

    try {
        const connection = await getOracleConnection();
        await connection.execute(
            `INSERT INTO LOCATIONS (LOCATION_NAME, REGION, LOCATION_ADDRESS, LOCATION_PHONE, ADDED_BY) 
            VALUES (:locationName, :region, :locationAddress, :locationPhone, :addedBy)`,
            { locationName, region, locationAddress, locationPhone, addedBy: userName }, // Use userName from session
            { autoCommit: true }
        );

        await logAction('ADD', 'LOCATIONS', null, userName); // Log the add action with the username
        await connection.close();

        res.status(201).json({ message: 'Location added successfully' });
    } catch (err) {
        console.error('Error adding location:', err);
        res.status(500).json({ message: 'Error adding location', error: err.message });
    }
}

async function updateLocation(req, res) {
    const { locationName, region, locationAddress, locationPhone } = req.body;
    const { id } = req.params;
    const userName = req.userName || 'Unknown User';  // Get the username from the session

    try {
        const connection = await getOracleConnection();
        await connection.execute(
            `UPDATE LOCATIONS SET LOCATION_NAME = :locationName, REGION = :region, LOCATION_ADDRESS = :locationAddress, LOCATION_PHONE = :locationPhone WHERE ID = :id`,
            { locationName, region, locationAddress, locationPhone, id },
            { autoCommit: true }
        );

        await logAction('UPDATE', 'LOCATIONS', id, userName); // Log the update action with the username
        await connection.close();

        res.status(200).json({ message: 'Location updated successfully' });
    } catch (err) {
        console.error('Error updating location:', err);
        res.status(500).json({ message: 'Error updating location', error: err.message });
    }
}

async function deleteLocation(req, res) {
    const { id } = req.params;
    const userName = req.userName || 'Unknown User';  // Get the username from the session

    try {
        const connection = await getOracleConnection();
        await connection.execute(
            `DELETE FROM LOCATIONS WHERE ID = :id`,
            { id },
            { autoCommit: true }
        );

        await logAction('DELETE', 'LOCATIONS', id, userName); // Log the delete action with the username
        await connection.close();

        res.status(200).json({ message: 'Location deleted successfully' });
    } catch (err) {
        console.error('Error deleting location:', err);
        res.status(500).json({ message: 'Error deleting location', error: err.message });
    }
}

module.exports = { getLocations, addLocation, updateLocation, deleteLocation };
