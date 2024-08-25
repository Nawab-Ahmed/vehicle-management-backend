const express = require('express');
const router = express.Router();
const checkRights = require('../middleware/checkRights');
const someController = require('../controllers/someController');

router.get('/some-data', checkRights('can_execute'), someController.getData);
router.post('/some-data', checkRights('can_add'), someController.addData);
router.put('/some-data', checkRights('can_edit'), someController.editData);
router.delete('/some-data', checkRights('can_delete'), someController.deleteData);

module.exports = router;
