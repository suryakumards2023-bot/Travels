
import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const token = req.cookies?.mk_token;

  if (!token) {
    return res.status(401).json({
      message: "Please login to continue.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Session expired or invalid. Please login again.",
    });
  }
}
