const express = require('express');
const router = express.Router();

// Import all individual route files
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const locationRoutes = require('./locationRoutes');
const transportRequestRoutes = require('./transportRequestRoutes');
const driverRoutes = require('./driverRoutes');
const driverReportRoutes = require('./driverReportRoutes');
const vehicleRoutes = require('./vehicleRoutes');
const vehicleMaintenanceRoutes = require('./VehicleMaintenanceRoutes');
const vehicleMovementRoutes = require('./vehicleMovementRoutes');
const vehicleReportRoutes = require('./vehicleReportRoutes');
const trackingRoutes = require('./trackingRoutes');
const logsRoutes = require('./logsRoutes');
const contractualServiceRoutes = require('./contractualServiceRoutes');
const pickAndDropServiceRoutes = require('./pickAndDropServiceRoutes');
const requestRoutes = require('./requestRoutes');

// Use the imported routes
router.use('/auth', authRoutes); // Authentication routes
router.use('/users', userRoutes); // User management and rights routes
router.use('/locations', locationRoutes); // Location management routes
router.use('/transport-requests', transportRequestRoutes); // Transport request routes
router.use('/drivers', driverRoutes); // Driver management routes
router.use('/driver-reports', driverReportRoutes); // Driver report routes
router.use('/vehicles', vehicleRoutes); // Vehicle management routes
router.use('/vehicle-maintenance', vehicleMaintenanceRoutes); // Vehicle maintenance routes
router.use('/vehicle-movements', vehicleMovementRoutes); // Vehicle movement routes
router.use('/vehicle-reports', vehicleReportRoutes); // Vehicle report routes
router.use('/tracking', trackingRoutes); // Tracking routes
router.use('/logs', logsRoutes); // Logs routes
router.use('/contractual-services', contractualServiceRoutes); // Contractual service routes
router.use('/pick-and-drop-services', pickAndDropServiceRoutes); // Pick and drop service routes
router.use('/requests', requestRoutes); // Request management routes

module.exports = router;
