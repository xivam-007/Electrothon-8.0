const express = require("express");

const {updateProfile, checkPhone, requestOTP,verifyOTPSignUp, verifyOTPLogin, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/request-otp", requestOTP);
router.post("/check-phone", checkPhone);
router.post("/verify-otp-login", verifyOTPLogin);
router.post("/verify-otp-signup", verifyOTPSignUp);

router.get("/me", protect, getMe);
router.put("/update-profile", protect, updateProfile);

module.exports = router;