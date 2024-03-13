import express from 'express'
import { middlewareProtect } from '../core/middlewares/auth.js'
import { getName } from '../controllers/user.js'

const router = express.Router()

router.get('/getname', middlewareProtect, getName)

export default router