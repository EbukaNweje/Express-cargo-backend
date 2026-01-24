const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const admin = require("./routes/admin");
const tracking = require("./routes/tracking.router");
const contactRouter = require("./routes/contact.router");
const morgan = require("morgan");
const fileUploader = require("express-fileupload");
const bodyParser = require("body-parser");

const app = express();

app.use(cors({ origin: "*" }));
app.use(
  fileUploader({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    createParentPath: true,
  }),
);
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());

app.use("/api/admin", admin);
app.use("/api/tracking", tracking);
app.use("/api/contact", contactRouter);

app.use("/", (req, res, next) => {
  res.status(200).send("Server is running");
});

module.exports = app;
