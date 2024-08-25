const express = require('express');
const router = express.Router();
const { getVehicleReports } = require('../controllers/vehicleReportController');

router.get('/', getVehicleReports);

module.exports = router;
