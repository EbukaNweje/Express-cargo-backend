const Contact = require("../models/Contact");
const mongoose = require("mongoose");
const { sendEmail } = require("../utilities/email");
const emailTemplates = require("../middleware/emailTemplate");

// Ensure connection before operations
const ensureConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return; // Already connected
  }

  const connectionOptions = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 1,
    maxIdleTimeMS: 30000,
    family: 4, // Force IPv4
  };

  try {
    await mongoose.connect(process.env.DATABASE, connectionOptions);
    console.log("Database connected in contact controller");
  } catch (error) {
    console.error("Contact controller DB connection error:", error);
    throw error;
  }
};

exports.createContact = async (req, res) => {
  try {
    await ensureConnection();

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const { fullName, company, email, phone, preferredContactMethod, message } =
      req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Full Name, Email, Phone, and Message are required",
      });
    }

    const contact = await Contact.create({
      fullName,
      company,
      email,
      phone,
      preferredContactMethod,
      message,
    });

    // Send confirmation email to user
    try {
      const userEmailTemplate = emailTemplates.contactConfirmation(contact);
      await sendEmail(
        email,
        "We've Received Your Message - Express Cargo",
        userEmailTemplate,
      );
    } catch (emailError) {
      console.error("Error sending confirmation email to user:", emailError);
      // Continue even if email fails
    }

    // Send notification email to admin
    try {
      const adminEmail =
        process.env.ADMIN_EMAIL || "expresscargoshippinglogisticss@gmail.com";
      const adminEmailTemplate =
        emailTemplates.contactNotificationAdmin(contact);
      await sendEmail(
        adminEmail,
        `New Contact Submission from ${fullName}`,
        adminEmailTemplate,
      );
    } catch (emailError) {
      console.error("Error sending notification email to admin:", emailError);
      // Continue even if email fails
    }

    res.status(201).json({
      success: true,
      message: "Contact message created successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error creating contact message",
    });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    await ensureConnection();

    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "All contacts retrieved successfully",
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching contacts",
    });
  }
};

exports.getContact = async (req, res) => {
  try {
    await ensureConnection();

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID",
      });
    }

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact retrieved successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Error fetching contact:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error fetching contact",
    });
  }
};

exports.updateContact = async (req, res) => {
  try {
    await ensureConnection();

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID",
      });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const contact = await Contact.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating contact",
    });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    await ensureConnection();

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID",
      });
    }

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting contact",
    });
  }
};

exports.updateContactStatus = async (req, res) => {
  try {
    await ensureConnection();

    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID",
      });
    }

    if (!status || !["new", "read", "replied", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required (new, read, replied, or closed)",
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact status updated successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Error updating contact status:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating contact status",
    });
  }
};
