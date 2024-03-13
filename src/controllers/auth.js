import bcrypt from "bcryptjs";
import db from "../core/configs/database.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import { ErrorResponse } from "../core/universal-helper/utils/utils.js";

const hashPassword = async (password) => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
};

const generateToken = (data, secret, expiresIn) => (
  jwt.sign(data, secret, { expiresIn })
);

export const register = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next(new ErrorResponse("Please provide username and password", 400));
    return;
  }

  const sql = "SELECT * FROM users WHERE username = ? LIMIT 1";
  db.query(sql, [username], async (error, [user]) => {
    if (error)
      next(new ErrorResponse("Server error", 500));
    else if (user)
      next(new ErrorResponse("Username already exists", 400));
    else {
      const hashedPassword = await hashPassword(password);
      const newUserId = uuidv4();

      db.query(
        "INSERT INTO users (userId, username, password) VALUES (?, ?, ?)",
        [newUserId, username, hashedPassword],
        (error, result) => {
          if (error)
            next(new ErrorResponse("Server error", 500));
          else {
            const payload = { userId: newUserId };
            const accessToken = generateToken(payload, process.env.JWT_SECRET, "1d");
            const refreshToken = generateToken(
              payload,
              process.env.JWT_REFRESH_SECRET
            , "7d");

            db.query(
              "UPDATE users SET refreshToken = ? WHERE userId = ?",
              [refreshToken, newUserId],
              (error) => {
                if (error)
                  next(new ErrorResponse("Server error", 500));
                else
                  sendTokenResponse(accessToken, 200, res);
              }
            );
          }
        }
      );
    }
  });
};

export const authWithToken = async (req, res, next) => {
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
    } else {
      const accessToken = generateToken({ userId: refreshToken.userId }, process.env.JWT_SECRET, "1d");
      sendTokenResponse(accessToken, 200, res);
    }
  });
};

export const login = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new ErrorResponse("Please provide email and password", 400));
  }

  const query = "SELECT * FROM users WHERE username = ? LIMIT 1";
  db.query(query, [username], async (err, user) => {
    if (err || user.length === 0) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    const isMatch = await bcrypt.compare(password, user[0].password);

    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    const resultData = {
      userId: user[0].userId
    };

    const accessToken = generateToken(resultData, process.env.JWT_SECRET, "1d");
    const refreshToken = generateToken(resultData, process.env.JWT_REFRESH_SECRET, "7d");

    db.query("UPDATE users SET refreshToken = ? WHERE userId = ?", [refreshToken, user[0].userId], (error) => {
      if (error) {
        return next(new ErrorResponse(error.message, 404));
      }
      sendTokenResponse(accessToken, 200, res);
    });
  });
};

export const sendTokenResponse = (token, statusCode, res) => {
  res.status(statusCode).json({
    statusCode,
    token,
    timestamp: Date.now(),
  });

  return;
};
