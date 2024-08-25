const express = require('express');
const {
    addTransportRequest,
    getAllTransportRequests,
    getTransportRequestById,
    updateTransportRequest,
    deleteTransportRequest
} = require('../controllers/TransportRequestController');

const router = express.Router();

router.post('/', addTransportRequest);
router.get('/', getAllTransportRequests);
router.get('/:id', getTransportRequestById);
router.put('/:id', updateTransportRequest);
router.delete('/:id', deleteTransportRequest);

module.exports = router;
