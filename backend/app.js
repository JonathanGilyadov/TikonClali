const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const apiRoutes = require("./routes/api");
const errorHandler = require("./middleware/errorHandler");
const anonIdMiddleware = require("./middleware/anonIdMiddleware");

const app = express();
app.use(anonIdMiddleware);
app.use(cors());
app.use(bodyParser.json());
app.use(errorHandler);
app.use("/api", apiRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
