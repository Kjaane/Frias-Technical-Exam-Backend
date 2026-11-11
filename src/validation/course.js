const courseFields = [
  "title",
  "category",
  "instructor",
  "duration",
  "level",
  "description",
  "color",
  "icon",
  "lessons",
];

function validateCourse(course, { partial = false } = {}) {
  if (!course || typeof course !== "object" || Array.isArray(course)) {
    return "Request body must be a JSON object.";
  }

  for (const field of courseFields) {
    if (!Object.hasOwn(course, field)) {
      if (partial) continue;
      return `Missing required field: ${field}.`;
    }

    if (field === "lessons") {
      if (
        !Array.isArray(course.lessons) ||
        course.lessons.some(
          (lesson) => typeof lesson !== "string" || lesson.trim() === "",
        )
      ) {
        return "Field 'lessons' must be an array of non-empty strings.";
      }
    } else if (
      typeof course[field] !== "string" ||
      course[field].trim() === ""
    ) {
      return `Field '${field}' must be a non-empty string.`;
    }
  }

  return null;
}

function parseCourseId(value) {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

module.exports = { courseFields, parseCourseId, validateCourse };
