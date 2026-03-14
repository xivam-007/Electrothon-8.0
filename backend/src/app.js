const express = require("express");
const cors = require("cors");

const moveRoutes = require("./routes/moveRoutes");
const whatsappRoutes = require("./routes/whatsappRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/moves", moveRoutes);
app.use("/api/whatsapp", whatsappRoutes);

module.exports = app;