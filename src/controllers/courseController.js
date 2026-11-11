const courseRepository = require("../repositories/courseRepository");
const { parseCourseId, validateCourse } = require("../validation/course");

function listCourses(req, res) {
  res.json(courseRepository.findAll());
}

function getCourse(req, res) {
  const id = parseCourseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "Invalid course id." });

  const course = courseRepository.findById(id);
  if (!course) return res.status(404).json({ error: "Course not found." });

  return res.json(course);
}

function createCourse(req, res) {
  const validationError = validateCourse(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  return res.status(201).json(courseRepository.create(req.body));
}

function updateCourse(req, res, { partial = false } = {}) {
  const id = parseCourseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "Invalid course id." });

  const validationError = validateCourse(req.body, { partial });
  if (validationError) return res.status(400).json({ error: validationError });
  if (req.body.id !== undefined && req.body.id !== id) {
    return res.status(400).json({ error: "Course id cannot be changed." });
  }

  const course = courseRepository.update(id, req.body, { partial });
  if (!course) return res.status(404).json({ error: "Course not found." });

  return res.json(course);
}

function replaceCourse(req, res) {
  return updateCourse(req, res);
}

function patchCourse(req, res) {
  return updateCourse(req, res, { partial: true });
}

function deleteCourse(req, res) {
  const id = parseCourseId(req.params.id);
  if (id === null) return res.status(400).json({ error: "Invalid course id." });
  if (!courseRepository.remove(id)) {
    return res.status(404).json({ error: "Course not found." });
  }

  return res.status(204).end();
}

module.exports = {
  createCourse,
  deleteCourse,
  getCourse,
  listCourses,
  patchCourse,
  replaceCourse,
};
