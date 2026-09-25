const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.role || !roles.includes(req.role)) {
      return res.status(403).json({
        message: "You do not have permission to access this resource",
      });
    }
    next();
  };
};

export default requireRole;
