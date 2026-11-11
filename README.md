# Courses API

SQLite-backed Express API for course management. The API listens on port `4000`
by default and enables CORS for a separate frontend. Course records are stored
in `Data/courses.sqlite`. On the first run, existing courses from
`Data/courses.json` are imported once; future changes are saved in SQLite.

## Project structure

```text
server.js                          Starts the HTTP server and handles shutdown
src/
  app.js                           Configures Express middleware and routes
  config/database.js               Opens SQLite and imports legacy JSON once
  config/seedDemoUsers.js          Creates demo users on first startup
  controllers/authController.js    Handles login and current-user requests
  controllers/courseController.js  Handles course HTTP requests and responses
  middleware/authenticateToken.js  Verifies bearer tokens
  middleware/errorHandler.js       Handles unknown routes and API errors
  repositories/courseRepository.js Runs course queries against SQLite
  repositories/userRepository.js   Runs user queries against SQLite
  routes/authRoutes.js             Maps authentication URLs to the controller
  routes/courseRoutes.js           Maps course URLs to the controller
  services/passwordService.js      Hashes and verifies passwords
  services/tokenService.js         Signs and verifies login tokens
  validation/course.js             Validates course payloads and IDs
Data/
  courses.sqlite                   SQLite database
  courses.json                     Original data used for one-time import
```

## Run

```sh
npm install
npm start
```

Requires Node.js 22.13 or newer. Set the `PORT` environment variable to use a
different port.

## Course endpoints

All endpoints are under `http://localhost:4000/api/courses`.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | List all courses |
| GET | `/:id` | Get one course |
| POST | `/` | Create a course |
| PUT | `/:id` | Replace a course |
| PATCH | `/:id` | Update supplied course fields |
| DELETE | `/:id` | Delete a course |

Course objects use `title`, `category`, `instructor`, `duration`, `level`,
`description`, `color`, `icon`, and `lessons` (an array of strings). IDs are
assigned by the server. Create and update requests must use JSON.

## Login

The `users` table stores a username, role, and scrypt password hash; plaintext
passwords are never stored. Existing databases are migrated to add the `role`
column automatically. Two demo accounts are inserted if they do not already
exist:

| Username | Password | Role |
| --- | --- | --- |
| `admin` | `admin123` | `admin` |
| `user` | `user123` | `user` |

Send a login request from the frontend:

```http
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

On success, the response includes a one-hour signed bearer token and the
authenticated user's ID, username, and role. The frontend can use `user.role`
to navigate admins and regular users to their respective views. To validate a
token and retrieve the current user, send it as
`Authorization: Bearer YOUR_TOKEN` to `GET /api/auth/me`. The role currently
supports frontend redirects only; course endpoints remain public and do not
enforce role-based permissions.

For local development, the API generates a temporary signing secret if
`JWT_SECRET` is not set, so tokens stop working after a server restart. Set a
stable secret before starting the server when testing persistent tokens:

```powershell
$env:JWT_SECRET = "replace-with-a-long-random-secret"
npm start
```

Production mode requires `JWT_SECRET` to be set. The demo credentials are for
local testing only; change or remove them before deployment.

## View the database

The database file is `Data/courses.sqlite`. To browse it visually, open that
file with [DB Browser for SQLite](https://sqlitebrowser.org/), choose **Browse
Data**, then select either the `courses` or `users` table. The users table
contains usernames, roles, and password hashes—not plaintext passwords.

You can print course rows from PowerShell in the project folder:

```powershell
node -e "const { DatabaseSync } = require('node:sqlite'); const db = new DatabaseSync('Data/courses.sqlite', { readOnly: true }); console.table(db.prepare('SELECT id, title, category, instructor FROM courses').all()); db.close();"
```

Stop the server before making direct database edits in another application.
