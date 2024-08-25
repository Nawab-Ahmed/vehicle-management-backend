const express = require('express');
const { getAllRequests, approveRequest, disapproveRequest } = require('../controllers/adminController');

const router = express.Router();

// Only admin can access these routes (commenting out the role-based middleware)
// router.get('/all-requests', roleMiddleware('admin'), getAllRequests);
// router.put('/approve/:id', roleMiddleware('admin'), approveRequest);
// router.put('/disapprove/:id', roleMiddleware('admin'), disapproveRequest);

// Allow access without role-based middleware
router.get('/all-requests', getAllRequests);
router.put('/approve/:id', approveRequest);
router.put('/disapprove/:id', disapproveRequest);

module.exports = router;
