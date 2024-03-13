import db from "../configs/database.js";
import { ErrorResponse } from "../universal-helper/utils/utils.js";
import jwt from "jsonwebtoken";

export const middlewareProtect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return next(new ErrorResponse("Not authorized", 401));

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return next(new ErrorResponse("Not authorized", 401));
  }

  const sql = "SELECT refreshToken FROM users WHERE userId = ? LIMIT 1";
  db.query(sql, [payload.userId], (err, results) => {
    if (err || results.length === 0) {
      return next(new ErrorResponse("Not authorized", 401));
    }

    let refreshToken;
    try {
      refreshToken = jwt.verify(results[0].refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return next(new ErrorResponse("Not authorized", 401));
    }

    if (payload.userId !== refreshToken.userId) {
      return next(new ErrorResponse("Not authorized", 401));
    }

    next();
  });
}
