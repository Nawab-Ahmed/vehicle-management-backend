const express = require('express');
const router = express.Router();
const {
    getVehicleMaintenanceRequests,
    getTransportRequests,
    getPickAndDropRequests,
    getContractualServiceRequests,
    getAllRequests,
    approveRequest,
    rejectRequest
} = require('../controllers/requestController');

// Removed the `verifyToken` middleware

router.get('/vehicle-maintenance', getVehicleMaintenanceRequests);
router.get('/transport-requests', getTransportRequests);
router.get('/pick-and-drop', getPickAndDropRequests);
router.get('/contractual-service', getContractualServiceRequests);
router.get('/', getAllRequests);
router.post('/:id/approve', approveRequest);
router.post('/:id/reject', rejectRequest);

module.exports = router;
