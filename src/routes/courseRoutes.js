const express = require("express");
const courseController = require("../controllers/courseController");

const router = express.Router();

router.get("/", courseController.listCourses);
router.get("/:id", courseController.getCourse);
router.post("/", courseController.createCourse);
router.put("/:id", courseController.replaceCourse);
router.patch("/:id", courseController.patchCourse);
router.delete("/:id", courseController.deleteCourse);

module.exports = router;
