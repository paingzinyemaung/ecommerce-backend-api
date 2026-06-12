const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    res.status(err.status || 500).json({
      ok: false,
      message: err.message || "Internal Server Error",
      stack: err.stack,
    });
  } else {
    res.status(err.status || 500).json({
      ok: false,
      message: err.message || "Internal Server Error",
    });
  }
};

module.exports = { errorHandler };
