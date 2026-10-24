
import mongoose from "mongoose";
import { randomUUID } from "node:crypto";

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      default: () => `MK-${randomUUID().slice(0, 8).toUpperCase()}`,
      unique: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["tour","bus", "hotel", "cab", "insurance"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    destination: {
      type: String,
      trim: true,
      default: "",
      maxlength: 200,
    },

    travelDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },

    travellers: {
      type: Number,
      min: 1,
      default: 1,
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      enum: ["INR"],
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refund_pending", "refunded"],
      default: "pending",
    },

    paymentReference: {
      type: String,
      default: "",
      maxlength: 200,
    },
    paymentScreenshot: {
  type: String,
  default: "",
},

paymentSubmittedAt: {
  type: Date,
  default: null,
},

cancellationDate: {
  type: Date,
  default: null,
},

cancellationSource: {
  type: String,
  enum: ["customer", "admin"],
  default: null,
},

paymentVerificationStatus: {
  type: String,
  enum: ["not_submitted", "pending_verification", "verified", "rejected"],
  default: "not_submitted",
},

    // REFUND MANAGEMENT
    refundStatus: {
  type: String,
  enum: ["not_requested", "refund_pending", "refunded", "not_eligible"],
  default: "not_requested",
  index: true,
},
refundAmount: {
  type: Number,
  min: 0,
  default: 0,
},
refundReference: {
  type: String,
  default: "",
  maxlength: 200,
},
refundRequestedAt: {
  type: Date,
  default: null,
},
refundedAt: {
  type: Date,
  default: null,
},
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ user: 1, createdAt: -1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
