import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const COOKIE_NAME = "mk_token";
const TOKEN_EXPIRY = "7d";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
};

function createToken(userId) {
  return jwt.sign({ userId: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: COOKIE_MAX_AGE,
  });
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    address: user.address || "",
    state: user.state || "",
    city: user.city || "",
    pincode: user.pincode || "",
    townVillage: user.townVillage || "",
    profilePhoto: user.profilePhoto || "",
    role: user.role || "customer",
    createdAt: user.createdAt,
  };
}

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body ?? {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2 || cleanName.length > 80) {
      return res.status(400).json({
        message: "Name must be between 2 and 80 characters.",
      });
    }

    if (
      cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({
        message: "Password must be between 8 and 128 characters.",
      });
    }

    if (
      phone !== undefined &&
      (typeof phone !== "string" || phone.length > 20)
    ) {
      return res.status(400).json({
        message: "Invalid phone number.",
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      role: role,
      phone: phone?.trim() || "",
    });

    const token = createToken(user._id);
    setAuthCookie(res, token);

    return res.status(201).json({
      message: "Registration successful.",
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Please check your registration details.",
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Unable to register right now.",
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      email.trim().length > 254 ||
      password.length > 128
    ) {
      return res.status(400).json({
        message: "Please enter a valid email and password.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = createToken(user._id);
    setAuthCookie(res, token);

    return res.status(200).json({
      message: "Login successful.",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Unable to login right now.",
    });
  }
});

// CURRENT LOGGED-IN USER

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.json({
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Load profile error:", error);

    return res.status(500).json({
      message: "Unable to load profile.",
    });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);

  return res.status(200).json({
    message: "Logout successful.",
  });
});

router.put("/profile", requireAuth, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      state,
      city,
      pincode,
      townVillage,
      profilePhoto,
    } = req.body;

    if (typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({
        message: "Name must contain at least 2 characters.",
      });
    }

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (
      phone !== undefined &&
      phone !== "" &&
      (typeof phone !== "string" || !/^\+?[0-9\s()-]{7,20}$/.test(phone.trim()))
    ) {
      return res.status(400).json({
        message: "Please enter a valid phone number.",
      });
    }

    if (
      pincode !== undefined &&
      pincode !== "" &&
      (typeof pincode !== "string" || !/^[0-9]{6}$/.test(pincode))
    ) {
      return res.status(400).json({
        message: "Pincode must contain exactly 6 digits.",
      });
    }

    if (
      profilePhoto !== undefined &&
      profilePhoto !== "" &&
      (typeof profilePhoto !== "string" ||
        !/^data:image\/(jpeg|png|webp|gif);base64,/.test(profilePhoto) ||
        profilePhoto.length > 3_000_000)
    ) {
      return res.status(400).json({
        message:
          "Invalid photo or photo is too large. Please choose a smaller image.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.userId },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    user.name = name.trim();
    user.email = normalizedEmail;
    user.phone = phone?.trim() || "";
    user.address = address?.trim() || "";
    user.state = state?.trim() || "";
    user.city = city?.trim() || "";
    user.pincode = pincode?.trim() || "";
    user.townVillage = townVillage?.trim() || "";

    if (profilePhoto !== undefined) {
      user.profilePhoto = profilePhoto;
    }

    await user.save();

    return res.json({
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        state: user.state || "",
        city: user.city || "",
        pincode: user.pincode || "",
        townVillage: user.townVillage || "",
        profilePhoto: user.profilePhoto || "",
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Please check the profile details and try again.",
      });
    }

    console.error("Profile update error:", error);

    return res.status(500).json({
      message: "Unable to update profile right now.",
    });
  }
});

export default router;
