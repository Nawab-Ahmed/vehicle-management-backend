const express = require('express');
const router = express.Router();
const {
    searchDrivers,
    getDriverHistory,
    getDriverReports
} = require('../controllers/DriverReportController');

router.get('/search', searchDrivers);
router.get('/history/:id', getDriverHistory);
router.get('/', getDriverReports);

module.exports = router;
