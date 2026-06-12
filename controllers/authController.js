const { ok } = require('assert');
const Account = require('../models/accountModel');
const bcrypt = require('bcryptjs');
const { log } = require('console');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/sendMail');
const AppError = require('../utils/AppError');
const asyncHandler = require('express-async-handler');
const { token } = require('morgan');

const register = asyncHandler(async (req, res, next) => {
  //   res.send("HaHa");
  const { email, password } = req.body;
  const account = await Account.findOne({ email });

  if (account && account?.isVerified === true) {
    // ? -> if the account is undefined, not enter condition
    const error = new AppError('Email is already registered', 404);
    next(error);
  }

  // throw new Error("test error");

  const hashPassword = await bcrypt.hash(password, 10); // second param is salt (random)
  console.log(hashPassword);

  const otp = crypto.randomInt(100000, 1000000);
  console.log(otp);

  // const newAcc = await Account.create(req.body);
  // const newAcc = new Account({
  //   email,
  //   password: hashPassword,
  //   otp,
  //   otpExpiration: new Date(Date.now() + 10 * 60 * 1000), // 10 min
  // });
  // const saveAcc = await newAcc.save();

  const newAcc = await Account.findOneAndUpdate(
    { email },
    {
      email,
      password: hashPassword,
      otp,
      otpExpiration: new Date(Date.now() + 10 * 60 * 1000),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  // send otp to registered account to verify the email
  // await sendMail(email, "Verify your email", `Your OTP is ${otp}`);

  return res.status(201).json({
    message: 'Register successfully',
  });
});

const verifyOtp = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  const account = await Account.findOne({ email });
  // console.log(account);

  // console.log(otp);
  // console.log(account.otp);

  if (!account) {
    return next(new AppError('Email is not exist', 400));
  }

  if (account.otp !== otp) {
    return next(new AppError('Invalid OTP', 400));
  }

  if (account.otpExpiration < new Date()) {
    return next(new AppError('OTP is expired', 400));
  }

  account.isVerified = true;
  account.otp = null;
  account.otpExpiration = null;

  await account.save();

  return res.status(200).json({
    ok: true,
    message: 'OTP verified successfully',
  });
});

const resendOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const account = await Account.findOne({ email });

  if (!account) {
    return next(new AppError('Email is not exist', 400));
  }

  if (account.isVerified === true) {
    return next(new AppError('Account is already verified', 400));
  }

  const newOtp = crypto.randomInt(100000, 1000000);

  account.otp = newOtp;
  account.otpExpiration = new Date(Date.now() + 10 * 60 * 1000);
  await account.save();

  await sendMail(email, 'Verify your email', `Your new OTP is ${otp}`);

  return res.status(200).json({
    ok: true,
    message: 'Resend OTP successfully',
  });
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const account = await Account.findOne({ email });

  if (!account) {
    return next(new AppError('Email is not exist', 400));
  }

  const token = crypto.randomBytes(32).toString('hex');
  console.log(token);

  account.resetPasswordToken = token;
  account.resetPasswordTokenExpiration = new Date(Date.now() + 30 * 60 * 1000);
  await account.save();

  await sendMail(
    email,
    'Reset Password Token',
    `Your reset password token is ${token}`,
  );

  return res.status(200).json({
    ok: true,
    message: 'Reset password token generated successfully',
  });
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;
  const account = await Account.findOne({ resetPasswordToken: token });

  if (!account) {
    return next(new AppError('Invalid token', 400));
  }

  if (password !== confirmPassword) {
    return next(new AppError('Passwords does not match', 400));
  }

  if (account.resetPasswordTokenExpiration < new Date()) {
    return next(new AppError('Token is expired', 400));
  }

  const hashPassword = await bcrypt.hash(password, 10);
  // console.log(hashPassword);

  account.password = hashPassword;

  account.resetPasswordToken = null;
  account.save();

  return res.status(200).json({
    ok: true,
    message: 'Password reset successfully',
  });
});

const login = asyncHandler(async (req, res, next) => {
  const { password, email } = req.body;
  const account = await Account.findOne({ email });
  console.log(account);

  if (!account || !account.isVerified) {
    return next(new AppError('Account is not exist or verified', 400));
  }

  const isMatch = await bcrypt.compare(password, account.password);
  if (!isMatch) {
    return next(new AppError('Invalid credentials', 400));
  }

  const token = jwt.sign(
    { id: account._id, tokenVersion: account.tokenVersion },
    process.env.JWT_SECRET,
    {
      expiresIn: '365d',
    },
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    expiresIn: '365d',
  });

  return res.status(200).json({
    ok: true,
    message: 'Login successfully',
    token,
  });
});

// test route
const testController = asyncHandler(async (req, res) => {
  console.log(req.user.id);
  const account = await Account.findById(req.user.id);
  console.log(account.email);
  return res.status(200).json({
    ok: true,
    message: 'UserId: ' + req.user.id,
  });
});

// admin route
const onlyAdmin = asyncHandler(async (req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'Only admin can access this route',
  });
});

// logout
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({
    ok: true,
    message: 'Logout successful!',
  });
});

// logout all devices
const logoutAll = asyncHandler(async (req, res) => {
  const account = await Account.findById(req.user.id);
  account.tokenVersion += 1;
  // console.log(abcd);
  await account.save();
  res.clearCookie('token');
  const token = jwt.sign(
    { id: account._id, tokenVersion: account.tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: '365d' },
  );
  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    expiresIn: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  });
  return res.status(200).json({
    ok: true,
    message: 'Logout all successful',
    new_token: token,
  });
});

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  login,
  logout,
  logoutAll,
  testController,
  onlyAdmin,
};
