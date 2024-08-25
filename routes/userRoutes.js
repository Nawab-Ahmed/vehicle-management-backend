const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// const authorize = require('../middleware/authorize');
// const { verifyToken } = require('../middleware/authMiddleware'); // Comment out these imports

// User routes
router.post('/add', userController.addUser);
router.get('/', userController.getUsers);
router.put('/update', userController.updateUser);
router.delete('/delete/:id', userController.deleteUser);

// User rights routes
router.get('/:userId/rights', userController.getUserRights); // Route to get user rights
router.get('/rights', userController.getAllUserRights); // Route to get all user rights
router.put('/:userId/rights', userController.updateUserRights);
router.get('/rights/preview', userController.getUserRightsPreview);

module.exports = router;
