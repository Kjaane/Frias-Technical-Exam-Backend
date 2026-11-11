const app = require("./src/app");
const { closeDatabase } = require("./src/config/database");
const { seedDemoUsers } = require("./src/config/seedDemoUsers");

const PORT = Number(process.env.PORT) || 4000;
let server;

function shutdown() {
  if (!server) {
    closeDatabase();
    return;
  }

  server.close((error) => {
    if (error) {
      console.error("Failed to close the HTTP server:", error);
      process.exitCode = 1;
    }

    closeDatabase();
  });
}

async function start() {
  await seedDemoUsers();
  server = app.listen(PORT, () => {
    console.log(`Courses API listening at http://localhost:${PORT}`);
  });
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

start().catch((error) => {
  console.error("Failed to start the server:", error);
  closeDatabase();
  process.exitCode = 1;
});
