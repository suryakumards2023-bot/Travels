
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: 20,
    },
    
address: {
  type: String,
  trim: true,
  maxlength: 300,
  default: "",
},
state: {
  type: String,
  trim: true,
  maxlength: 100,
  default: "",
},
city: {
  type: String,
  trim: true,
  maxlength: 100,
  default: "",
},
pincode: {
  type: String,
  trim: true,
  match: [/^[0-9]{6}$/, "Please enter a valid 6-digit pincode."],
  default: "",
},
townVillage: {
  type: String,
  trim: true,
  maxlength: 100,
  default: "",
},
profilePhoto: {
  type: String,
  default: "",
},
role: {
  type: String,
  enum: ["customer", "admin"],
  default: "customer",
},

  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
