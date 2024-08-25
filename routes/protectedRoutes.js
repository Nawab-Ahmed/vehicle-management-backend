const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');
const someController = require('../controllers/someController'); // Adjust according to your controller

router.get('/protected-page-endpoint', authorize('Some Page Name', 'execute'), someController.viewPage);

module.exports = router;
