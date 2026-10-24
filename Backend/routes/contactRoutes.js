
import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

const ALLOWED_CALL_TIMES = [
  "Anytime",
  "9 AM - 12 PM",
  "12 PM - 3 PM",
  "3 PM - 6 PM",
  "6 PM - 9 PM",
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobilePattern = /^[6-9]\d{9}$/;

function cleanText(value, maxLength = 150) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

router.post("/callback", async (req, res) => {
  try {
    const name = cleanText(req.body?.name, 80);
    const phone = cleanText(req.body?.phone, 10);
    const email = cleanText(req.body?.email, 254);
    const destination = cleanText(req.body?.destination, 150);
    const preferredTime = cleanText(req.body?.preferredTime, 30);

    if (name.length < 2) {
      return res.status(400).json({
        message: "Please enter your name.",
      });
    }

    if (!mobilePattern.test(phone)) {
      return res.status(400).json({
        message: "Please enter a valid 10-digit Indian mobile number.",
      });
    }

    if (email && !emailPattern.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    if (!destination) {
      return res.status(400).json({
        message: "Please select a destination.",
      });
    }

    if (!ALLOWED_CALL_TIMES.includes(preferredTime)) {
      return res.status(400).json({
        message: "Please select a valid callback time.",
      });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;
    const notificationEmail =
      process.env.CALLBACK_NOTIFICATION_EMAIL || gmailUser;

    if (!gmailUser || !gmailPassword || !notificationEmail) {
      console.error("Callback email environment variables are missing.");

      return res.status(500).json({
        message: "Callback service is not configured. Please try again later.",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPassword.replace(/\s/g, ""),
      },
    });

    const receivedAt = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

    await transporter.sendMail({
      from: `"MK Travels Website" <${gmailUser}>`,
      to: notificationEmail,
      replyTo: email || undefined,
      subject: `Callback Request - ${destination}`,
      text: [
        "New callback request received from MK Travels website.",
        "",
        `Customer Name: ${name}`,
        `Mobile Number: ${phone}`,
        `Email: ${email || "Not provided"}`,
        `Destination: ${destination}`,
        `Preferred Callback Time: ${preferredTime}`,
        `Received At: ${receivedAt} IST`,
      ].join("\n"),
    });

    return res.status(200).json({
      message: "Callback request submitted successfully. Our team will contact you soon.",
    });
  } catch (error) {
    console.error("Callback email failed:", error.message);

    return res.status(500).json({
      message: "Unable to submit your callback request right now. Please try again later.",
    });
  }
});

export default router;
