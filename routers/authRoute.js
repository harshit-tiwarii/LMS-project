import express from 'express'
import { forgotPassword, getProfile, logout, resetPassword, signIn, signUp } from '../controllers/authController.js'
import { isLoggedIn } from '../middlewares/auth.middleware.js'
import upload from '../middlewares/multer.middleware.js'
const userRoute = express.Router()

userRoute.post('/signIn',signIn)
userRoute.get('/logout',logout)
userRoute.get('/profile',isLoggedIn,getProfile)
userRoute.post('/forgot-password',forgotPassword)
userRoute.post('/signUp',upload.single('avatar'),signUp)
userRoute.post('/reset-password/:token',resetPassword)

export {userRoute}