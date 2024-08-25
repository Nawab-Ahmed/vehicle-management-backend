const express = require('express');
const router = express.Router();
const { getLocations, addLocation, updateLocation, deleteLocation } = require('../controllers/LocationController');

// Removed the `verifyToken` and `authorize` middlewares

router.get('/', getLocations);
router.post('/', addLocation);
router.put('/:id', updateLocation);
router.delete('/:id', deleteLocation);

module.exports = router;
