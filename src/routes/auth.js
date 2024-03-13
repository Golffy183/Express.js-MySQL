import express from "express";
import { register, login, authWithToken } from '../controllers/auth.js'
import { rateLimiter } from "../core/middlewares/rateLimiter.js";

const router = express.Router()

router.post('/register', rateLimiter, register)
router.post('/login', rateLimiter, login)
router.get('/token', rateLimiter, authWithToken)

export default router