import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
export function authmiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.headers["authorization"];
    if (!token) {
      throw new Error("no token provided");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.userid = decoded.userid;
    next();
  } catch (e) {
    console.log(e);
    res.status(401).json({ message: "not authorized" });
  }
}
