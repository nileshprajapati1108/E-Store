import express from "express";
import Contact from "../models/contactModel.js";

const router = express.Router();

// Submit a contact message (public)
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const contact = new Contact({ name, email, subject, message });
    await contact.save();

    res.status(201).json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error saving contact message:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
});

// Get all contact messages (admin only)
router.get("/", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
});

// Update message status (admin only)
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    res.json({ success: true, message: "Status updated", contact: message });
  } catch (error) {
    console.error("Error updating message status:", error);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
});

// Reply to a message (admin only)
router.put("/:id/reply", async (req, res) => {
  try {
    const { reply } = req.body;
    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      { adminReply: reply, status: "replied" },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    res.json({ success: true, message: "Reply sent", contact: message });
  } catch (error) {
    console.error("Error replying to message:", error);
    res.status(500).json({ success: false, message: "Failed to send reply" });
  }
});

// Delete a message (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const message = await Contact.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    res.json({ success: true, message: "Message deleted" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ success: false, message: "Failed to delete message" });
  }
});

// Get unread count (for admin badge)
router.get("/unread-count", async (req, res) => {
  try {
    const count = await Contact.countDocuments({ status: "unread" });
    res.json({ success: true, count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ success: false, message: "Failed to get count" });
  }
});

// Get messages by user email (for user to see their messages)
router.get("/user/:email", async (req, res) => {
  try {
    const messages = await Contact.find({ email: req.params.email }).sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching user messages:", error);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
});

export default router;
