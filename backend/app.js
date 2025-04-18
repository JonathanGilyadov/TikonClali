const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const apiRoutes = require("./routes/api");
const errorHandler = require("./middleware/errorHandler");
const anonIdMiddleware = require("./middleware/anonIdMiddleware");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(errorHandler);
app.use("/api", apiRoutes);

// Serve frontend static files

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.use(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
