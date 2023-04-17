const errorHandler = (req, res, next) => {
  console.log("ERROR");
  res.json({ success: false, error: "ERROR" });
  next();
};

module.exports = errorHandler;
