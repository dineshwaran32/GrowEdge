import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  console.log('[AUTH] Checking authorization...');
  const authHeader = req.header("Authorization");
  
  if (!authHeader) {
    console.log('[AUTH] No Authorization header found');
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  console.log('[AUTH] Authorization header:', authHeader);
  const token = authHeader.split(" ")[1];

  if (!token) {
    console.log('[AUTH] No token found in Authorization header');
    return res.status(401).json({ msg: "Token missing in Authorization header" });
  }

  try {
    console.log('[AUTH] Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[AUTH] Token verified, user:', decoded);
    req.user = decoded.userId;
    next();
  } catch (err) {
    console.error('[AUTH] JWT Error:', err.message);
    res.status(401).json({ msg: "Invalid token" });
  }
};

export default auth;
