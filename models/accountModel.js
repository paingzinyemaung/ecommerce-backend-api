const mongoose = require('mongoose'); // လို့ခေါ်လိုက်တိုင်း သူက mongoose instance တစ်ခုတည်းကိုပဲ Project တစ်ခုလုံးမှာမျှသုံး၊
const validator = require('validator');

// based on mongoose library
const accountSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: [true, 'Email already exists'],
      validate: [validator.isEmail, 'Invalid email format'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      maxlength: 100,
      validate: [validator.isStrongPassword, 'Password is not strong enough'], // isLength, isUppercase, isLowercase, isNumber, isSymbol
      // select: false, // password ကို query ထဲမှာမပါအောင်၊
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'user', 'manager'],
        message: 'Invalid role',
      },
      default: 'user',
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiration: {
      type: Date,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordTokenExpiration: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Account', accountSchema); // Account -> accounts collection from database

// export default mongoose.Model("Account", accountSchema); // react style
