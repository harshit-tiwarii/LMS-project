import mongoose from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt"
import crypto from 'crypto'

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is required'],
        trim: true,
        minLength: [3,'name must be minimum 3 character'],
        maxLength: [20,'name must be lower than 20 character']
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'pasword is required'],
        select: false,
        minLength: [8,'Minimum 8 character required']
    },
    avatar: {
        public_id:{
            type: String
        },
        secure_url:{
            type: String
        }
    },
    role:{
        type:'String',
        enum:['User','Admin'],
        default:'User'
    },
    forgotPassword: String,
    expiryForgotPassword: Date
},
{
    timestamps : true
})
 
userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return
    try {
        this.password = await bcrypt.hash(this.password,10);
    } catch (error) {
        next(error)
    }
    next()
})

userSchema.methods = {
     generateJWTtoken : async function (){
      return await jwt.sign(
        {
            id:this._id,email:this.email,subscription:this.subscription,role:this.role
        },
        process.env.SECRET,
        {
            expiresIn: process.env.JWT_EXPIRY
        }
       )
     },
    comparePassword : async function (plaintextPassword){
        return await bcrypt.compare(plaintextPassword,this.password)
    },
    generateResettoken : async function () {
        const resetToken = crypto.randomBytes(32).toString('hex');

         this.forgotPassword = crypto.createHash('sha256').update(resetToken).digest('hex');
         this.expiryForgotPassword = Date.now() + 15*60*1000;

         return resetToken;
    }
}

const User = mongoose.model('User',userSchema);


export {User}