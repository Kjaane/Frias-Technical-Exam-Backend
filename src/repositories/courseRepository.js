const { database } = require("../config/database");
const { courseFields } = require("../validation/course");

const listCoursesStatement = database.prepare(
  "SELECT * FROM courses ORDER BY id",
);
const findCourseStatement = database.prepare(
  "SELECT * FROM courses WHERE id = ?",
);
const insertCourseStatement = database.prepare(`
  INSERT INTO courses (${courseFields.join(", ")})
  VALUES (${courseFields.map(() => "?").join(", ")})
`);
const deleteCourseStatement = database.prepare(
  "DELETE FROM courses WHERE id = ?",
);

function courseFromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    instructor: row.instructor,
    duration: row.duration,
    level: row.level,
    description: row.description,
    color: row.color,
    icon: row.icon,
    lessons: JSON.parse(row.lessons),
  };
}

function courseValues(course, fields = courseFields) {
  return fields.map((field) =>
    field === "lessons" ? JSON.stringify(course[field]) : course[field],
  );
}

function findAll() {
  return listCoursesStatement.all().map(courseFromRow);
}

function findById(id) {
  return courseFromRow(findCourseStatement.get(id));
}

function create(course) {
  const result = insertCourseStatement.run(...courseValues(course));
  return findById(Number(result.lastInsertRowid));
}

function update(id, course, { partial = false } = {}) {
  const fields = partial
    ? courseFields.filter((field) => Object.hasOwn(course, field))
    : courseFields;

  if (fields.length > 0) {
    const assignments = fields.map((field) => `${field} = ?`).join(", ");
    database
      .prepare(`UPDATE courses SET ${assignments} WHERE id = ?`)
      .run(...courseValues(course, fields), id);
  }

  return findById(id);
}

function remove(id) {
  return deleteCourseStatement.run(id).changes > 0;
}

module.exports = { create, findAll, findById, remove, update };
