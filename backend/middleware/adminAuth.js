// middleware/adminAuth.js
module.exports = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token || token !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  next();
};
