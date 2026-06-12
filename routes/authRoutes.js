const router = require("express").Router();
const {
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
} = require("../controllers/authController");
const { validate } = require("../middlewares/validate");
const {
  registerSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  loginSchema,
} = require("../schemas/authSchema");

const { verifyJwt, allowTo } = require("../middlewares/authMiddleware");
const { verify } = require("jsonwebtoken");

router.post("/register", validate(registerSchema), register);

router.post("/verifyOtp", validate(verifyOtpSchema), verifyOtp);

router.post("/resendOtp", validate(resendOtpSchema), resendOtp);

router.post("/forgotPassword", validate(forgotPasswordSchema), forgotPassword);

router.post(
  "/resetPassword/:token",
  validate(resetPasswordSchema),
  resetPassword,
);

router.post("/login", validate(loginSchema), login);

router.post("/logout", verifyJwt, logout);

router.post("/logoutAll", verifyJwt, logoutAll);

router.post("/test", verifyJwt, testController);

router.post("/only-admin", verifyJwt, allowTo("admin"), onlyAdmin);

module.exports = router;
