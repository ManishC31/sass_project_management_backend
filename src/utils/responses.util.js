export function ApiError(res, code, message) {
  return res.status(code || 400).json({
    success: false,
    message: message || "something went wrong",
  });
}

export function ApiResponse(res, code, message, details) {
  const response = {
    success: true,
    ...(message && { message }),
    ...(details !== undefined && { details }),
  };

  return res.status(code || 200).json(response);
}
