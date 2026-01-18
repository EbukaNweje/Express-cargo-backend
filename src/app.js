const express = require("express");
const cors = require("cors");
const trackingRoutes = require("./routes/tracking.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/tracking", trackingRoutes);

module.exports = app;
