
import User from "../models/User.js";

export async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.userId)
      .select("role")
      .lean();

    if (!user) {
      return res.status(401).json({
        message: "User account not found. Please login again.",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin permission required.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin authorization error:", error.message);

    return res.status(500).json({
      message: "Unable to verify admin permissions.",
    });
  }
}
