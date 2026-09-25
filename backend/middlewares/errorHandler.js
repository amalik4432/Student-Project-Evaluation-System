import HttpError from "../models/HttpError.js";

export const notFoundHandler = (req, res) => {
  throw new HttpError("Could not find this route.", 404);
};

export const errorHandler = (error, req, res, next) => {
  if (res.headerSent) return next(error);

  const uploadError =
    error.name === "MulterError" ||
    error.message?.includes("Only PDF") ||
    error.message?.includes("Only PDF, Word");
  const status = uploadError ? 400 : error.code || error.status || 500;

  res.status(status).json({
    message: error.message || "An unknown error occurred!",
  });
};
