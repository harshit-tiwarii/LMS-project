import express from 'express'
import { forgotPassword, getProfile, logout, resetPassword, signIn, signUp } from '../controllers/authController.js'
import { isLoggedIn } from '../middlewares/auth.middleware.js'
import upload from '../middlewares/multer.middleware.js'
const route = express.Router()

route.post('/user/signUp',upload.single('avatar'),signUp)
route.post('/user/signIn',signIn)
route.get('/user/logout',logout)
route.get('/user/profile',isLoggedIn,getProfile)
route.post('/user/forgot-password',forgotPassword)
route.post('/user/reset-password/:token',resetPassword)

export {route}