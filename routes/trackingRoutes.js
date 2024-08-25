const express = require('express');
const { getTrackingOptions, createTracking, getTrackingRecords, updateTracking, deleteTracking } = require('../controllers/trackingController');

const router = express.Router();

// Removed the `verifyToken` and `authorize` middlewares

// Route to handle adding new tracking entries
router.post('/', createTracking);

// Route to handle getting tracking records
router.get('/', getTrackingRecords);

// New route specifically for 'Tracking Records' page
router.get('/records', getTrackingRecords);

// Route to handle updating tracking records
router.put('/:id', updateTracking);

// Route to handle deleting tracking records
router.delete('/:id', deleteTracking);

// Route to handle getting tracking options
router.get('/tracking-options', getTrackingOptions);

module.exports = router;
