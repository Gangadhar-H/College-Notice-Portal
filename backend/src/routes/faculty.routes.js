const express = require("express");
const router = express.Router();
const facultyController = require("../controllers/faculty.controller");
const { authenticateToken, authorizeRole } = require("../middleware/auth");

router.use(authenticateToken);
router.use(authorizeRole(["faculty", "admin"]));

router.get("/dashboard", facultyController.getDashboard);
router.get("/notices", facultyController.getNotices);
router.post("/notices", facultyController.createNotice);
router.put("/notices/:id", facultyController.updateNotice);
router.delete("/notices/:id", facultyController.deleteNotice);
router.get("/students", facultyController.getStudents);
router.get("/departments", facultyController.getAllClasses);
router.get("/classes", facultyController.getMyClasses); // Changed from /departments

module.exports = router;
