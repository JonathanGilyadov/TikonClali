// middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error("🚨 Error:", err);

  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ error: message });
};
