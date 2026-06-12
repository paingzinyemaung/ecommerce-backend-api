const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const redisClient = require("../config/redisClient");
const redisKey = require("../utils/redisKey");

// create user profile
const createUser = asyncHandler(async (req, res, next) => {
  const account = req.user.id;
  const { name, phone, address } = req.body;
  const user = await User.findOne({ account });

  if (user) {
    return next(
      new AppError("User profile already exists for this account", 400),
    );
  }

  const newUser = new User({
    account, // connection by FK
    name,
    phone,
    address,
  });

  await newUser.save();
  res.status(201).json({
    ok: true,
    message: "User profile created successfully",
    user: newUser,
  });
});

// get all users by admin
const getAllUsers = asyncHandler(async (req, res, next) => {
  let users = {};
  users = JSON.parse(await redisClient.get(redisKey.users));

  if (!users) {
    users = await User.find().populate("account", "email role");
    await redisClient.set(redisKey.users, JSON.stringify(users), {
      EX: 10,
    });
  }

  res.status(200).json({
    ok: true,
    message: "User retrieved successfully",
    count: users.length,
    users,
  });
});

// get single user by id (admin)
const getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  let user = [];
  user = JSON.parse(await redisClient.get(redisKey.user(id)));

  if (!user) {
    user = await User.findById(id).populate("account");
    await redisClient.set(redisKey.user(id), JSON.stringify(user), {
      EX: 10,
    });
  }
  res.status(200).json({
    ok: true,
    message: "User profile retrieved success",
    user,
  });
});

// update user profile
const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userToUpdate = await User.findById(id);
  // console.log(userToUpdate);
  if (
    userToUpdate.account_id.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new AppError("You are not allowed to update other people's profile", 403),
    );
  }
  const updatedUser = await User.findByIdAndUpdate(id, req.body, {
    new: true, // return new data
    runValidators: true, // validate schema
  });

  if (!updatedUser) {
    return next(new AppError("User profile not found", 404));
  }

  res.status(200).json({
    ok: true,
    message: "User updated successful",
  });
});

// delete user
const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const deleteUser = await User.findByIdAndDelete(id);

  if (!deleteUser) {
    return next(new AppError("User profile not found", 404));
  }

  res.status(200).json({
    ok: true,
    message: "User profile deleted successfully",
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
