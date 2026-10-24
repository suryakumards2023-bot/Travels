
import { Router } from "express";
import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import { requireAuth } from "../middleware/auth.js";

import { requireAdmin } from "../middleware/requireAdmin.js";

import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const paymentUploadDir = path.resolve(
  __dirname,
  "../uploads/payment-screenshots"
);

fs.mkdirSync(paymentUploadDir, { recursive: true });

const paymentStorage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, paymentUploadDir);
  },

  filename: (_req, file, callback) => {
    const extensionByMime = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };

    callback(
      null,
      `${randomUUID()}${extensionByMime[file.mimetype] || ".img"}`
    );
  },
});

const paymentScreenshotUpload = multer({
  storage: paymentStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return callback(
        new Error("Only JPG, PNG, and WebP screenshots are allowed.")
      );
    }

    callback(null, true);
  },
});

function deleteUploadedFile(filePath) {
  if (filePath) {
    fs.promises.unlink(filePath).catch(() => {});
  }
}

// All booking routes require authentication.
router.use(requireAuth);


/**
 * GET /api/bookings/admin/payment-requests
 * Admin-only: list payments awaiting manual verification.
 */
router.get(
  "/admin/payment-requests",
  requireAdmin,
  async (req, res) => {
    try {
      const bookings = await Booking.find({
  paymentVerificationStatus: "pending_verification",
})
      
    
        .populate("user", "name email phone")
        .sort({ paymentSubmittedAt: 1 })
        .lean();

      return res.status(200).json({
        count: bookings.length,
        bookings,
      });
    } catch (error) {
      console.error("Admin payment requests error:", error.message);

      return res.status(500).json({
        message: "Unable to fetch payment requests.",
      });
    }
  }
);


/**
 * GET /api/bookings/admin/payment-requests/:id/screenshot
 * Serve uploaded screenshot to an authenticated admin only.
 */
router.get(
  "/admin/payment-requests/:id/screenshot",
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid booking ID.",
        });
      }

      const booking = await Booking.findOne({
  _id: id,
  paymentVerificationStatus: {
    $in: ["pending_verification", "verified", "rejected"],
  },
})
  .select("paymentScreenshot")
  .lean();

      if (!booking || !booking.paymentScreenshot) {
        return res.status(404).json({
          message: "Payment screenshot not found.",
        });
      }

      // Only allow a filename, never a path supplied by a request.
      const filename = path.basename(booking.paymentScreenshot);
      const screenshotPath = path.resolve(paymentUploadDir, filename);

      if (path.dirname(screenshotPath) !== paymentUploadDir) {
        return res.status(400).json({
          message: "Invalid screenshot path.",
        });
      }

      try {
        await fs.promises.access(screenshotPath, fs.constants.R_OK);
      } catch {
        return res.status(404).json({
          message: "Screenshot file is missing from the server.",
        });
      }

      const contentTypes = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
      };

      res.setHeader(
        "Content-Type",
        contentTypes[path.extname(filename).toLowerCase()] ||
          "application/octet-stream"
      );
      res.setHeader("Cache-Control", "private, no-store");
      res.setHeader("X-Content-Type-Options", "nosniff");

      return res.sendFile(screenshotPath);
    } catch (error) {
      console.error("Payment screenshot fetch error:", error.message);

      return res.status(500).json({
        message: "Unable to open payment screenshot.",
      });
    }
  }
);


// POST /api/bookings/payment-request
// Saves payment proof for manual verification.
// Uploading a screenshot never confirms payment.
router.post(
  "/payment-request",
  (req, res, next) => {
    paymentScreenshotUpload.single("paymentScreenshot")(
      req,
      res,
      (error) => {
        if (!error) return next();

        const statusCode =
          error instanceof multer.MulterError &&
          error.code === "LIMIT_FILE_SIZE"
            ? 400
            : 400;

        return res.status(statusCode).json({
          message:
            error instanceof multer.MulterError &&
            error.code === "LIMIT_FILE_SIZE"
              ? "Screenshot size maximum 5 MB ho sakta hai."
              : error.message ||
                "Screenshot upload nahi ho paya.",
        });
      }
    );
  },
  async (req, res) => {
    let uploadedFilePath = req.file?.path;

    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Payment screenshot upload karein.",
        });
      }

      let bookingData;

      try {
        bookingData = JSON.parse(req.body.bookingData || "{}");
      } catch {
        deleteUploadedFile(uploadedFilePath);

        return res.status(400).json({
          message: "Invalid booking data.",
        });
      }

      const {
        type,
        title,
        destination = "",
        travelDate,
        endDate,
        travellers = 1,
        amount,
        currency = "INR",
        details = {},
      } = bookingData;

      const allowedTypes = [
        "tour",
        "bus",
        "hotel",
        "cab",
        "insurance",
      ];

      if (!allowedTypes.includes(type)) {
        deleteUploadedFile(uploadedFilePath);

        return res.status(400).json({
          message: "Invalid booking type.",
        });
      }

      if (
        typeof title !== "string" ||
        !title.trim() ||
        title.trim().length > 200
      ) {
        deleteUploadedFile(uploadedFilePath);

        return res.status(400).json({
          message: "Valid booking title is required.",
        });
      }

      if (
        typeof destination !== "string" ||
        destination.length > 200
      ) {
        deleteUploadedFile(uploadedFilePath);

        return res.status(400).json({
          message: "Invalid destination.",
        });
      }

      if (
        !Number.isInteger(travellers) ||
        travellers < 1 ||
        travellers > 50
      ) {
        deleteUploadedFile(uploadedFilePath);

        return res.status(400).json({
          message: "Travellers must be between 1 and 50.",
        });
      }

      if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        amount > 10000000 ||
        currency !== "INR"
      ) {
        deleteUploadedFile(uploadedFilePath);

        return res.status(400).json({
          message: "Invalid booking amount or currency.",
        });
      }

      if (
        !details ||
        typeof details !== "object" ||
        Array.isArray(details)
      ) {
        deleteUploadedFile(uploadedFilePath);

        return res.status(400).json({
          message: "Invalid booking details.",
        });
      }

      const parseOptionalDate = (value, fieldName) => {
        if (value === undefined || value === null || value === "") {
          return null;
        }

        if (
          typeof value !== "string" ||
          Number.isNaN(Date.parse(value))
        ) {
          throw new Error(`Invalid ${fieldName}.`);
        }

        const date = new Date(value);

        if (!Number.isFinite(date.getTime())) {
          throw new Error(`Invalid ${fieldName}.`);
        }

        return date;
      };

      let parsedTravelDate;
      let parsedEndDate;

      try {
        parsedTravelDate = parseOptionalDate(
          travelDate,
          "travel date"
        );

        parsedEndDate = parseOptionalDate(
          endDate,
          "end date"
        );
      } catch (error) {
        deleteUploadedFile(uploadedFilePath);

        return res.status(400).json({
          message: error.message,
        });
      }

      if (
        parsedTravelDate &&
        parsedEndDate &&
        parsedEndDate < parsedTravelDate
      ) {
        deleteUploadedFile(uploadedFilePath);

        return res.status(400).json({
          message: "End date cannot be before travel date.",
        });
      }

      const booking = await Booking.create({
        user: new mongoose.Types.ObjectId(req.userId),
        type,
        title: title.trim(),
        destination: destination.trim(),
        travelDate: parsedTravelDate,
        endDate: parsedEndDate,
        travellers,
        details,
        amount,
        currency: "INR",

        // Never confirm payment just because a screenshot was uploaded.
        status: "pending",
        paymentStatus: "pending",
        paymentVerificationStatus: "pending_verification",
        paymentScreenshot: path
          .relative(paymentUploadDir, uploadedFilePath)
          .replace(/\\/g, "/"),
        paymentSubmittedAt: new Date(),
      });

      return res.status(201).json({
        message:
          "Payment screenshot submitted. Booking is pending manual verification.",
        booking: {
          _id: booking._id,
          bookingReference: booking.bookingReference,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          paymentVerificationStatus:
            booking.paymentVerificationStatus,
          amount: booking.amount,
          currency: booking.currency,
          paymentSubmittedAt: booking.paymentSubmittedAt,
        },
      });
    } catch (error) {
      deleteUploadedFile(uploadedFilePath);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: "Please check the booking details.",
        });
      }

      console.error("Payment request error:", error.message);

      return res.status(500).json({
        message: "Unable to submit payment screenshot.",
      });
    }
  }
);

// POST /api/bookings
router.post("/", async (req, res) => {
  try {
    const {
      type,
      title,
      destination,
      travelDate,
      endDate,
      travellers,
      details,
    } = req.body ?? {};

    const allowedTypes = ["bus", "hotel", "cab", "insurance"];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid booking type.",
      });
    }

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 200
    ) {
      return res.status(400).json({
        message: "A valid booking title is required.",
      });
    }

    if (
      destination !== undefined &&
      (typeof destination !== "string" ||
        destination.length > 200)
    ) {
      return res.status(400).json({
        message: "Invalid destination.",
      });
    }

    const travellerCount = travellers ?? 1;

    if (
      !Number.isInteger(travellerCount) ||
      travellerCount < 1 ||
      travellerCount > 50
    ) {
      return res.status(400).json({
        message: "Travellers must be between 1 and 50.",
      });
    }

    function parseDate(value, fieldName) {
      if (value === undefined || value === null || value === "") {
        return null;
      }

      if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
        throw new Error(`Invalid ${fieldName}.`);
      }

      const date = new Date(value);

      if (!Number.isFinite(date.getTime())) {
        throw new Error(`Invalid ${fieldName}.`);
      }

      return date;
    }

    let parsedTravelDate;
    let parsedEndDate;

    try {
      parsedTravelDate = parseDate(travelDate, "travel date");
      parsedEndDate = parseDate(endDate, "end date");
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (
      parsedTravelDate &&
      parsedEndDate &&
      parsedEndDate < parsedTravelDate
    ) {
      return res.status(400).json({
        message: "End date cannot be before travel date.",
      });
    }

    if (
      details !== undefined &&
      (details === null ||
        typeof details !== "object" ||
        Array.isArray(details))
    ) {
      return res.status(400).json({
        message: "Booking details must be an object.",
      });
    }

    // Do not accept amount, status, paymentStatus, or user
    // from the request body.
    //
    // This draft endpoint intentionally does not finalize a price.
    // Server-side pricing/quote validation must be implemented
    // before this can become a payable booking.
    const booking = await Booking.create({
      user: new mongoose.Types.ObjectId(req.userId),
      type,
      title: title.trim(),
      destination: destination?.trim() || "",
      travelDate: parsedTravelDate,
      endDate: parsedEndDate,
      travellers: travellerCount,
      details: details ?? {},
      amount: 0,
      currency: "INR",
      status: "pending",
      paymentStatus: "pending",
    });

    return res.status(201).json({
      message: "Booking draft created. Price and availability are not yet confirmed.",
      booking,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Please check the booking details.",
      });
    }

    console.error("Create booking error:", error.message);

    return res.status(500).json({
      message: "Unable to create booking.",
    });
  }
});


// GET /api/bookings
// Current user's bookings only.
router.get("/", async (req, res) => {
  try {
    
    const records = await Booking.find({
      user: req.userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    const bookings = records.map((booking) => ({
      ...booking,
      paymentScreenshotUrl: booking.paymentScreenshot
        ? `/api/bookings/${booking._id}/screenshot`
        : "",
    }));


    return res.status(200).json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Fetch bookings error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch bookings.",
    });
  }
});


/**
 * POST /api/bookings/demo-confirm
 *
 * DEMO ONLY — does not verify or process real payments.
 */
router.post("/demo-confirm", async (req, res) => {
  try {
    const {
      type,
      title,
      destination = "",
      travelDate,
      endDate,
      travellers = 1,
      details = {},
      amount,
      paymentMethod = "demo",
    } = req.body ?? {};

    const allowedTypes = ["tour", "bus", "hotel", "cab", "insurance"];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid booking type." });
    }

    if (typeof title !== "string" || !title.trim() || title.length > 200) {
      return res.status(400).json({ message: "Valid booking title is required." });
    }

    if (
      !Number.isInteger(travellers) ||
      travellers < 1 ||
      travellers > 50
    ) {
      return res.status(400).json({ message: "Invalid traveller count." });
    }

    if (!Number.isFinite(amount) || amount <= 0 || amount > 10000000) {
      return res.status(400).json({ message: "Invalid booking amount." });
    }

    if (!details || typeof details !== "object" || Array.isArray(details)) {
      return res.status(400).json({ message: "Invalid booking details." });
    }

    const parseOptionalDate = (value, field) => {
      if (!value) return null;
      const date = new Date(value);
      if (typeof value !== "string" || Number.isNaN(date.getTime())) {
        throw new Error(`Invalid ${field}.`);
      }
      return date;
    };

    let parsedTravelDate;
    let parsedEndDate;

    try {
      parsedTravelDate = parseOptionalDate(travelDate, "travel date");
      parsedEndDate = parseOptionalDate(endDate, "end date");
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    if (
      parsedTravelDate &&
      parsedEndDate &&
      parsedEndDate < parsedTravelDate
    ) {
      return res.status(400).json({
        message: "End date cannot be before travel date.",
      });
    }

    const booking = await Booking.create({
      user: new mongoose.Types.ObjectId(req.userId),
      type,
      title: title.trim(),
      destination:
        typeof destination === "string" ? destination.trim().slice(0, 200) : "",
      travelDate: parsedTravelDate,
      endDate: parsedEndDate,
      travellers,
      details: {
        ...details,
        paymentMethod,
        demoPayment: true,
      },
      amount,
      currency: "INR",
      status: "confirmed",
      paymentStatus: "paid",
      paymentReference: `DEMO-${new mongoose.Types.ObjectId().toString()}`,
    });

    return res.status(201).json({
      message: "Demo booking saved successfully.",
      booking,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Please check the booking details.",
      });
    }

    console.error("Demo booking confirmation error:", error.message);
    return res.status(500).json({
      message: "Unable to save booking.",
    });
  }
});


/**
 * GET /api/bookings/admin/bookings
 * Admin-only: fetch all bookings for dashboard management.
 */
router.get("/admin/bookings", requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Admin all bookings error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch all bookings.",
    });
  }
});


/**
 * GET /api/bookings/:id/screenshot
 * Customer can view only their own booking screenshot.
 */
router.get("/:id/screenshot", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid booking ID.",
      });
    }

    const booking = await Booking.findOne({
      _id: id,
      user: req.userId,
    })
      .select("paymentScreenshot")
      .lean();

    if (!booking || !booking.paymentScreenshot) {
      return res.status(404).json({
        message: "Payment screenshot not found.",
      });
    }

    // Database value se sirf filename use karo.
    const filename = path.basename(booking.paymentScreenshot);

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const extension = path.extname(filename).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return res.status(400).json({
        message: "Invalid screenshot file type.",
      });
    }

    const screenshotPath = path.resolve(paymentUploadDir, filename);

    if (path.dirname(screenshotPath) !== paymentUploadDir) {
      return res.status(400).json({
        message: "Invalid screenshot path.",
      });
    }

    try {
      await fs.promises.access(screenshotPath, fs.constants.R_OK);
    } catch {
      return res.status(404).json({
        message: "Screenshot file is missing from the server.",
      });
    }

    const contentTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
    };

    res.setHeader("Content-Type", contentTypes[extension]);
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");

    return res.sendFile(screenshotPath);
  } catch (error) {
    console.error("Customer screenshot error:", error.message);

    return res.status(500).json({
      message: "Unable to open payment screenshot.",
    });
  }
});




// GET /api/bookings/:id
// Fetch a booking only if it belongs to the current user.
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid booking ID.",
      });
    }

    const booking = await Booking.findOne({
      _id: id,
      user: req.userId,
    }).lean();

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    return res.status(200).json({ booking });
  } catch (error) {
    console.error("Fetch booking details error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch booking details.",
    });
  }
});

// PATCH /api/bookings/:id/cancel
// Customer can cancel pending or confirmed bookings.
// Payment/refund records are kept separate from cancellation.
router.patch("/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid booking ID.",
      });
    }

    const booking = await Booking.findOne({
      _id: id,
      user: req.userId,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    const currentStatus = String(booking.status || "")
      .toLowerCase()
      .trim();

    if (["cancelled", "canceled"].includes(currentStatus)) {
      return res.status(400).json({
        message: "This booking is already cancelled.",
      });
    }

    if (["completed", "rejected"].includes(currentStatus)) {
      return res.status(400).json({
        message: `This booking cannot be cancelled because its status is ${currentStatus}.`,
      });
    }

    if (
      String(booking.refundStatus || "").toLowerCase() ===
      "refund_pending"
    ) {
      return res.status(409).json({
        message: "A refund is already pending for this booking.",
      });
    }

    // Block cancellation if the travel date has already passed.
    if (booking.travelDate) {
      const travelDate = new Date(booking.travelDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (
        !Number.isNaN(travelDate.getTime()) &&
        travelDate < today
      ) {
        return res.status(400).json({
          message: "Past travel bookings cannot be cancelled.",
        });
      }
    }

    // Record customer cancellation without erasing payment history.
    booking.status = "cancelled";
    booking.cancellationDate = new Date();
    booking.cancellationSource = "customer";

    // Do not mark a refund as paid/refunded automatically.
    // Only verified, paid cancellations should enter Refund Management.
    await booking.save();

    return res.status(200).json({
      message:
        "Booking cancelled successfully. Any eligible refund will be handled separately.",
      booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error.message);

    return res.status(500).json({
      message: "Unable to cancel booking.",
    });
  }
});


/**
 * PATCH /api/bookings/admin/payment-requests/:id/approve
 * Approve only after verifying the actual payment.
 */
router.patch(
  "/admin/payment-requests/:id/approve",
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid booking ID.",
        });
      }

      const booking = await Booking.findOne({
  _id: id,
  paymentVerificationStatus: "pending_verification",
  paymentStatus: "pending",
});

      if (!booking) {
        return res.status(404).json({
          message: "Pending payment request not found.",
        });
      }

      booking.paymentVerificationStatus = "verified";
booking.paymentStatus = "paid";

if (booking.status !== "cancelled") {
  booking.status = "confirmed";
}

await booking.save();

      return res.status(200).json({
  message:
    booking.status === "cancelled"
      ? "Payment verified successfully. Booking remains cancelled."
      : "Payment verified and booking confirmed.",
  booking,
});
    } catch (error) {
      console.error("Approve payment error:", error.message);

      return res.status(500).json({
        message: "Unable to approve payment.",
      });
    }
  }
);

/**
 * PATCH /api/bookings/admin/payment-requests/:id/reject
 * Reject an unverified or invalid payment submission.
 */
router.patch(
  "/admin/payment-requests/:id/reject",
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid booking ID.",
        });
      }

      const booking = await Booking.findOne({
        _id: id,
        paymentVerificationStatus: "pending_verification",
        paymentStatus: "pending",
      });

      if (!booking) {
        return res.status(404).json({
          message: "Pending payment request not found.",
        });
      }

      booking.paymentVerificationStatus = "rejected";
      booking.paymentStatus = "failed";

      // Customer ne pehle cancel kiya hai to uski details preserve karo.
      if (booking.status !== "cancelled") {
        booking.status = "cancelled";
        booking.cancellationDate = new Date();
        booking.cancellationSource = "admin";
      }

      await booking.save();

      return res.status(200).json({
        message: "Payment request rejected.",
        booking,
      });
    } catch (error) {
      console.error("Reject payment error:", error.message);

      return res.status(500).json({
        message: "Unable to reject payment request.",
      });
    }
  }
);


/* =========================================
   REFUND MANAGEMENT
   Admin-only routes
========================================= */

// GET /api/bookings/admin/refunds
// Only cancelled bookings with verified and paid payments.
router.get("/admin/refunds", requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find({
      paymentVerificationStatus: "verified",
      paymentStatus: "paid",
      status: "cancelled",
      refundStatus: {
        $in: ["not_requested", "refund_pending"],
      },
    })
      .populate("user", "name email phone")
      .sort({ cancellationDate: -1 })
      .lean();

    return res.status(200).json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Admin refund list error:", error.message);

    return res.status(500).json({
      message: "Unable to fetch refund records.",
    });
  }
});


// PATCH /api/bookings/admin/refunds/:id/request
// Mark refund pending; do NOT mark payment as refunded yet.
router.patch(
  "/admin/refunds/:id/request",
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const refundAmount = Number(req.body?.refundAmount);

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid booking ID.",
        });
      }

      if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
        return res.status(400).json({
          message: "Enter a valid refund amount.",
        });
      }

      const booking = await Booking.findOne({
        _id: id,
        paymentVerificationStatus: "verified",
        paymentStatus: "paid",
        status: "cancelled",
        refundStatus: "not_requested",
      });

      if (!booking) {
        return res.status(409).json({
          message:
            "Booking is not eligible, or its refund has already been started.",
        });
      }

      if (refundAmount > booking.amount) {
        return res.status(400).json({
          message: "Refund amount cannot exceed the booking amount.",
        });
      }

      booking.refundAmount = refundAmount;
      booking.refundStatus = "refund_pending";
      booking.refundRequestedAt = new Date();

      // Payment remains paid until money is actually refunded.
      booking.paymentStatus = "paid";

      await booking.save();

      return res.status(200).json({
        message: "Refund marked as pending. Money has not been sent automatically.",
        booking,
      });
    } catch (error) {
      console.error("Create refund request error:", error.message);

      return res.status(500).json({
        message: "Unable to start refund processing.",
      });
    }
  }
);


// PATCH /api/bookings/admin/refunds/:id/complete
// Use only AFTER the actual refund has been sent.
router.patch(
  "/admin/refunds/:id/complete",
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const refundReference =
        typeof req.body?.refundReference === "string"
          ? req.body.refundReference.trim()
          : "";

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: "Invalid booking ID.",
        });
      }

      if (!refundReference || refundReference.length > 200) {
        return res.status(400).json({
          message: "Enter a valid refund transaction reference.",
        });
      }

      const booking = await Booking.findOne({
        _id: id,
        paymentVerificationStatus: "verified",
        paymentStatus: "paid",
        status: "cancelled",
        refundStatus: "refund_pending",
        refundAmount: { $gt: 0 },
      });

      if (!booking) {
        return res.status(409).json({
          message:
            "Pending refund not found. Refresh the refund list and try again.",
        });
      }

      booking.refundReference = refundReference;
      booking.refundStatus = "refunded";
      booking.refundedAt = new Date();
      booking.paymentStatus = "refunded";

      // Keep cancellation status, date and source unchanged.
      await booking.save();

      return res.status(200).json({
        message: "Refund completion recorded successfully.",
        booking,
      });
    } catch (error) {
      console.error("Complete refund error:", error.message);

      return res.status(500).json({
        message: "Unable to complete refund record.",
      });
    }
  }
);



export default router;
