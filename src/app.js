const express = require("express");
const cors = require("cors");
const courseRoutes = require("./routes/courseRoutes");
const authRoutes = require("./routes/authRoutes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
