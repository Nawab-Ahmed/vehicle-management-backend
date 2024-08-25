const express = require('express');
const { getLogs } = require('../controllers/logsController');

const router = express.Router();

// No authentication or authorization middleware
router.get('/', getLogs);

module.exports = router;
