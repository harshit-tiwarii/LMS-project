import mongoose from "mongoose";
import { User } from "../models/auth.model.js";
import AppError from "../utils/error.utils.js";
import { compare } from "bcrypt";

const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: true
}
const signUp = async (req, res, next) => {
  const { name, email, password } = req.body;
  console.log(name, email, password)

  if (!name || !email || !password) {
    return next(new AppError('All fields are required', 400));
  }
  const userExist = await User.findOne({ email })

  if (userExist) {
    return next(new AppError('user already existed', 401))
  }
  try {
    const user = await User.create({
      name,
      email,
      password,

    })
    const token = user.generateJWTtoken();
    res.cookie('token', token, cookieOptions)

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}

const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('All fields are required', 400));
    }
    const user = await User.findOne({ email }).select("+password")

    if (!user || ! await user.comparePassword(password)) {
      return next(new AppError('Email or password is incorrect', 400))
    }

    const token = await user.generateJWTtoken();
    res.cookie('token', token, cookieOptions)

    user.password = undefined
    return res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const logout = async (req, res, next) => {
  try {
    res.cookie('token', null, {
      httpOnly: true,
      secure: true,
      maxAge: 0
    });
    res.status(200).json({
      success: true,
      message: 'Logout successfully'
    })
  } catch (error) {
    next(error)
  }
}

const getProfile = async (req, res, next) => {
  try {
    const userid = req.user.id;

    const user = await User.findById(userid);

    res.status(200).json({
      success: true,
      message: 'User details',
      user
    })
  } catch (error) {
    return next(new AppError('failed to fetch user profile', 400))
  }
}
export { signUp, signIn, logout, getProfile }