import jwt from "jsonwebtoken";

export function protect(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Not authorized"
    });
  }

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(
  token,
  process.env.JWT_SECRET || "supersecret"
);
    req.admin = decoded;
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid token"
    });
  }
}

export function adminOnly(req, res, next) {
  if (!req.admin || req.admin.role !== "admin") {
    return res.status(403).json({
      message: "Admin access only"
    });
  }

  next();
}

// compatibility alias for your home routes
export const protectAdmin = protect;