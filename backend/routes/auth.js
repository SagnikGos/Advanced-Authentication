import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import cookieParser from "cookie-parser";
import User from "../models/User.js";

const router = express.Router();
router.use(cookieParser());

// Helper: Send verification email
const sendVerificationEmail = async (user, req) => {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpires = Date.now() + 1000 * 60 * 60 * 24;

  user.verificationToken = verificationToken;
  user.verificationTokenExpires = verificationTokenExpires;
  await user.save();

  const verificationURL = `${process.env.SERVER_URL}/api/auth/verify-email?token=${verificationToken}`;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `Your App <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Verify Your Email",
      html: `<p>Hello ${user.name},</p><p>Please verify your email:</p><a href="${verificationURL}">${verificationURL}</a>`
    });
  } catch (emailErr) {
    console.error("Email sending failed:", emailErr);
    throw new Error("Failed to send verification email");
  }
};

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  console.log("Signup attempt:", { name, email });

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.warn("User already exists:", email);
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword });

    await sendVerificationEmail(user, req);

    res.status(201).json({ msg: "Signup successful. Please check your email to verify." });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Verify Email
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ msg: "Invalid or expired token" });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.redirect(`${process.env.CLIENT_URL}/verify-email-success`);
  } catch (err) {
    console.error("Email verification error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", email);

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    if (!user.isVerified) return res.status(403).json({ msg: "Please verify your email first" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ msg: "Logged out" });
});

export default router;
