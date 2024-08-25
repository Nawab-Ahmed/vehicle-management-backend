const express = require('express');
const {
    addContractualService,
    getAllContractualServices,
    getContractualServiceById,
    updateContractualService,
    deleteContractualService
} = require('../controllers/contractualServiceController');
// const authorize = require('../middleware/authorize'); // Remove authorization

const router = express.Router();

router.post('/', addContractualService);
router.get('/', getAllContractualServices);
router.get('/:id', getContractualServiceById);
router.put('/:id', updateContractualService);
router.delete('/:id', deleteContractualService);

module.exports = router;
