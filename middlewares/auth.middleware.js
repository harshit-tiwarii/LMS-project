import jwt from "jsonwebtoken"
import AppError from "../utils/error.utils.js"

const isLoggedIn = async (req, res, next) => {
  try {
    const { token } = req.cookies

    if (!token) {
      next(new AppError('Please login again', 400))
    }
    const userDetails = await jwt.verify(token, process.env.SECRET)
    req.user = userDetails

  } catch (error) {
    next(error)
  }

  next()
}
const authorizedAccess = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('permission not granted', 401))
    }
    next()
  }
}

export { isLoggedIn, authorizedAccess }