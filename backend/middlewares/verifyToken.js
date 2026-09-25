import "dotenv/config";
import { promisify } from "util";
import jwt from "jsonwebtoken";

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = req.cookies?.access_token || authHeader?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    req.userId = decoded._id;
    req.role = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default verifyToken;
