module.exports = anonIdMiddleware = (req, res, next) => {
  const anonId = req.header("x-anon-id");
  if (!anonId) {
    return res.status(400).json({ error: "Missing anon ID" });
  }
  req.anonId = anonId;
  next();
};
