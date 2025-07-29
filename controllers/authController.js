import mongoose from "mongoose";
import { User } from "../models/auth.model.js";
import AppError from "../utils/error.utils.js";
import cloudinary from 'cloudinary'
import fs from 'fs'
import sendEmail from "../utils/sendEmail.util.js";
import crypto from 'crypto'

const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: true
}
const signUp = async (req, res, next) => {
  const { name, email, password } = req.body;

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
      avatar: {
        public_id: email,
        secure_url: 'https://res.cloudinary.com/demo/image/upload/v16920000/lms/abc123.jpg'
      }
    })

    try {
      if (req.file) {

        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: 'lms',
          width: 250,
          height: 250,
          gravity: 'faces',
          crop: 'fill'
        })
        if (result) {
          user.avatar.public_id = result.public_id;
          user.avatar.secure_url = result.secure_url
        }

        fs.rmSync(`./uploads/${req.file.filename}`)
      }
    } catch (error) {
      console.log(error.message)
      return next(new AppError('file not uploaded,Try again !', 400))
    }
    user.save()

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

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email })

  if (!user) {
    return next(new AppError('Email not valid', 500))
  }
  const resetToken = await user.generateResettoken();
  
  await user.save()

  const resetUrl = `${req.protocol}://${req.get('host')}/api/user/reset-password/${resetToken}`;

  const message = `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
      <h2 style="color: #333;">🔐 Reset Your Password</h2>
      <p style="font-size: 16px; color: #555;">
        Hello, <br /><br />
        We received a request to reset your password. Click the button below to create a new password:
      </p>
      <a href="${resetUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Reset Password
      </a>
      <p style="font-size: 14px; color: #999; margin-top: 30px;">
        If you didn't request this, you can safely ignore this email.<br />
        This link will expire in 15 minutes.
      </p>
      <p style="font-size: 14px; color: #999;">
        — The LMS Team
      </p>
    </div>
  </div>
`;

  try {
    await sendEmail({
      email: user.email,
      subject: "password reset request",
      message
    })
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email}`,
    });
  } catch (error) {
    user.forgotPassword = undefined
    user.expiryForgotPassword = undefined

    await user.save();

    return next(new AppError('Email could not be sent', 500))
  }
}

const resetPassword = async (req, res, next) => {
  const resetToken = req.params.token;

  const hashToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  const user = await User.findOne({
    forgotPassword: hashToken,
    expiryForgotPassword: { $gt: Date.now() }
  })

  if (!user) {
    return next(new AppError('Invalid or expired token', 400))
  }

  user.password = req.body.password
  user.forgotPassword = undefined
  user.expiryForgotPassword = undefined

  await user.save()

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
  });
}
export { signUp, signIn, logout, getProfile, resetPassword, forgotPassword }