const User = require("../models/userModel");
const OTP = require("../models/otpModel");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
const sendSMS = require("../services/smsService");


const requestOTP = async (req, res) => {
    try {
        const { phone, flow } = req.body; // flow: "login" | "signup"

        if (!phone) {
            return res.status(400).json({ success: false, message: "Phone number required" });
        }

        const user = await User.findOne({ phone });

        // Guard based on flow — one DB call does the job
        if (flow === "login" && !user) {
            return res.status(404).json({
                success: false,
                message: "Phone number not registered. Please sign up first."
            });
        }

        if (flow === "signup" && user) {
            return res.status(409).json({
                success: false,
                message: "Phone number already registered. Please log in."
            });
        }

        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
            alphabets: false
        });

        
        await OTP.create({
            phone,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000)
        });
        
        await sendSMS(phone, otp);
        
        console.log(`Generated OTP for ${phone}: ${otp}`); // For debugging
        res.json({ success: true, message: "OTP sent successfully" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// VERIFY OTP + LOGIN (user.findOne now purely for JWT payload, not re-validation)
const verifyOTPLogin = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ success: false, message: "Phone and OTP required" });
        }

        const otpRecord = await OTP.findOne({ phone }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: "OTP not found" });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        if (otpRecord.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "OTP expired" });
        }

        // User existence guaranteed — requestOTP already blocked unregistered numbers
        const user = await User.findOne({ phone });

        const token = jwt.sign(
            { id: user._id, name: user.name, phone: user.phone },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        await OTP.deleteMany({ phone });

        res.json({ success: true, message: "Login successful", token });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const verifyOTPSignUp = async (req, res) => {
    try {
        const { name, phone, otp } = req.body;

        if (!name || !phone || !otp) {
            return res.status(400).json({
                success: false,
                message: "Name, phone and OTP required"
            });
        }

        const otpRecord = await OTP.findOne({ phone }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: "OTP not found" });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        if (otpRecord.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "OTP expired" });
        }

        // ✅ No User.findOne check needed — requestOTP already blocked registered numbers
        const user = await User.create({ name, phone, isVerified: true });

        const token = jwt.sign(
            { id: user._id, name: user.name, phone: user.phone },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        await OTP.deleteMany({ phone });

        res.json({ success: true, message: "Signup successful", token });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET CURRENT USER
const getMe = async (req, res) => {
    return res.json({
        success: true,
        data: req.user
    });
};

const updateProfile = async (req, res) => {
  try {
    const { name, imageUrl } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update fields if they are provided in the request
    user.name = name || user.name;
    user.imageUrl = imageUrl || user.imageUrl;

    await user.save();

    // Generate a fresh token with the updated name
    const token = jwt.sign(
        { id: user._id, name: user.name, phone: user.phone },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    // Return the new token and updated user data
    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        name: user.name,
        imageUrl: user.imageUrl,
        newToken: token // We send this back so the frontend can replace the old token
      },
    });

  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile"
    });
  }
};


// Add to authController.js
const checkPhone = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ success: false, message: "Phone required" });

        const exists = !!(await User.exists({ phone }));
        res.json({ success: true, exists });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add to module.exports
module.exports = {updateProfile, requestOTP, verifyOTPLogin, verifyOTPSignUp, checkPhone, getMe };