export function notFoundHandler(req, res) {
  res.status(404).json({ message: "Route not found" });
}
export function errorHandler(err, req, res, next) {
  console.error("[ERROR]", err);
  const status = err.status || 500;
  res
    .status(status)
    .json({
      message:
        status === 500 ? "Internal server error" : err.message || "Error",
    });
}
