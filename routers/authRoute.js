import express from 'express'
import { getProfile, logout, signIn, signUp } from '../controllers/authController.js'
import { isLoggedIn } from '../middlewares/auth.middleware.js'
const route = express.Router()

route.post('/user/signUp',signUp)
route.post('/user/signIn',signIn)
route.get('/user/logout',logout)
route.get('/user/profile',isLoggedIn,getProfile)

export {route}