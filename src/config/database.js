const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");
const { courseFields, validateCourse } = require("../validation/course");

const dataDirectory = path.join(__dirname, "..", "..", "Data");
const databaseFile = path.join(dataDirectory, "courses.sqlite");
const legacyCoursesFile = path.join(dataDirectory, "courses.json");

const database = new DatabaseSync(databaseFile);
database.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    instructor TEXT NOT NULL,
    duration TEXT NOT NULL,
    level TEXT NOT NULL,
    description TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    lessons TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS database_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  );
`);

const userColumns = database.prepare("PRAGMA table_info(users)").all();
if (!userColumns.some((column) => column.name === "role")) {
  database.exec(`
    ALTER TABLE users
    ADD COLUMN role TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('admin', 'user'));
  `);
}

function importLegacyCourses() {
  const alreadyImported = database
    .prepare("SELECT value FROM database_meta WHERE key = ?")
    .get("legacy_courses_json_imported");
  if (alreadyImported || !fs.existsSync(legacyCoursesFile)) return;

  const courses = JSON.parse(fs.readFileSync(legacyCoursesFile, "utf8"));
  if (!Array.isArray(courses)) {
    throw new Error("Course data in Data/courses.json must be a JSON array.");
  }

  const insertCourse = database.prepare(`
    INSERT INTO courses (id, ${courseFields.join(", ")})
    VALUES (?, ${courseFields.map(() => "?").join(", ")})
  `);

  database.exec("BEGIN IMMEDIATE");
  try {
    for (const course of courses) {
      const validationError = validateCourse(course);
      if (validationError) {
        throw new Error(`Cannot import course data: ${validationError}`);
      }
      if (!Number.isSafeInteger(course.id) || course.id < 1) {
        throw new Error(
          "Cannot import course data: each course needs a positive integer id.",
        );
      }

      const values = courseFields.map((field) =>
        field === "lessons" ? JSON.stringify(course[field]) : course[field],
      );
      insertCourse.run(course.id, ...values);
    }

    database
      .prepare("INSERT INTO database_meta (key, value) VALUES (?, ?)")
      .run("legacy_courses_json_imported", new Date().toISOString());
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

importLegacyCourses();

function closeDatabase() {
  if (database.isOpen) database.close();
}

module.exports = { database, closeDatabase };
