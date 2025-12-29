const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.use(authenticateToken);
router.use(authorizeRole(['admin']));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/notices', adminController.getAllNotices);
router.post('/notices', adminController.createNotice);
router.put('/notices/:id', adminController.updateNotice);
router.delete('/notices/:id', adminController.deleteNotice);
router.get('/classes', adminController.getAllClasses);
router.post('/classes', adminController.createClass);
router.delete('/classes/:id', adminController.deleteClass);
router.post('/assign-faculty', adminController.assignFacultyToClass);
router.delete('/remove-faculty', adminController.removeFacultyFromClass);

module.exports = router;
