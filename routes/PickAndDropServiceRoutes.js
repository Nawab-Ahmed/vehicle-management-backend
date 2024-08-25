const express = require('express');
const router = express.Router();
const {
    addPickAndDropService,
    getAllPickAndDropServices,
    getPickAndDropServiceById,
    updatePickAndDropService,
    deletePickAndDropService
} = require('../controllers/pickAndDropServiceController');

router.post('/', addPickAndDropService);
router.get('/', getAllPickAndDropServices);
router.get('/:id', getPickAndDropServiceById);
router.put('/:id', updatePickAndDropService);
router.delete('/:id', deletePickAndDropService);

module.exports = router;
