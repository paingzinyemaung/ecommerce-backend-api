const router = require("express").Router();
const { verifyJwt, allowTo } = require("../middlewares/authMiddleware");
const { all } = require("./authRoutes");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

// const { validate } = require("../models/productModel");
const { validate } = require("../middlewares/validate");
const { userSchema } = require("../schemas/userSchema");

router.get("/", verifyJwt, allowTo("admin"), getAllUsers);
router.get("/:id", verifyJwt, allowTo("admin"), getUserById);
router.post("/", validate(userSchema), verifyJwt, createUser);
router.patch("/:id", verifyJwt, updateUser);
router.delete("/:id", verifyJwt, deleteUser);

module.exports = router;
