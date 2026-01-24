const Shipment = require("../models/Shipment");
const mongoose = require("mongoose");
const brevo = require("../utilities/brevo");
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
    console.log("Database connected in shipment controller");
  } catch (error) {
    console.error("Shipment controller DB connection error:", error);
    throw error;
  }
};

exports.createShipment = async (req, res) => {
  try {
    await ensureConnection();

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const {
      origin,
      destination,
      weight,
      dimensions,
      preferredShipDate,
      cargoType,
      fullName,
      company,
      email,
      phone,
      notes,
    } = req.body;

    // Validate required fields
    if (
      !origin ||
      !destination ||
      !weight ||
      !preferredShipDate ||
      !cargoType ||
      !fullName ||
      !email ||
      !phone
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Validate dimensions
    if (
      !dimensions ||
      !dimensions.length ||
      !dimensions.width ||
      !dimensions.height
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete dimensions (length, width, height) are required",
      });
    }

    // Calculate estimated cost (simple calculation - you can make this more sophisticated)
    const estimatedCost = calculateShippingCost(
      weight,
      dimensions,
      origin,
      destination,
    );

    const shipmentData = {
      origin,
      destination,
      weight,
      dimensions,
      preferredShipDate: new Date(preferredShipDate),
      cargoType,
      fullName,
      company,
      email,
      phone,
      estimatedCost,
      notes,
    };

    const shipment = await Shipment.create(shipmentData);

    // Send confirmation email to customer
    try {
      await brevo.sendEmail({
        email: email,
        subject: `Shipment Request Confirmed - ${shipment.shipmentNumber}`,
        html: emailTemplates.shipmentConfirmation
          ? emailTemplates.shipmentConfirmation(shipment)
          : `<h2>Shipment Request Confirmed</h2>
           <p>Dear ${fullName},</p>
           <p>Your shipment request has been received and confirmed.</p>
           <p><strong>Shipment Number:</strong> ${shipment.shipmentNumber}</p>
           <p><strong>Estimated Cost:</strong> $${estimatedCost}</p>
           <p>We will contact you soon with further details.</p>`,
      });
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
    }

    // Send notification to admin
    try {
      const adminEmail =
        process.env.ADMIN_EMAIL || "expresscargoshippinglogisticss@gmail.com";
      await brevo.sendEmail({
        email: adminEmail,
        subject: `New Shipment Request - ${shipment.shipmentNumber}`,
        html: emailTemplates.shipmentNotificationAdmin
          ? emailTemplates.shipmentNotificationAdmin(shipment)
          : `<h2>New Shipment Request</h2>
           <p><strong>Shipment Number:</strong> ${shipment.shipmentNumber}</p>
           <p><strong>Customer:</strong> ${fullName}</p>
           <p><strong>From:</strong> ${origin}</p>
           <p><strong>To:</strong> ${destination}</p>
           <p><strong>Weight:</strong> ${weight} kg</p>
           <p><strong>Estimated Cost:</strong> $${estimatedCost}</p>`,
      });
    } catch (emailError) {
      console.error("Error sending admin notification:", emailError);
    }

    res.status(201).json({
      success: true,
      message: "Shipment request created successfully",
      data: shipment,
    });
  } catch (error) {
    console.error("Error creating shipment:", error);

    // Handle duplicate shipment number error
    if (error.code === 11000 && error.keyPattern?.shipmentNumber) {
      return res.status(409).json({
        success: false,
        message: "Shipment number already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating shipment request",
      error: error.message,
    });
  }
};

exports.getAllShipments = async (req, res) => {
  try {
    await ensureConnection();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    // Add filters based on query parameters
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.cargoType) {
      filter.cargoType = req.query.cargoType;
    }
    if (req.query.search) {
      filter.$or = [
        { shipmentNumber: { $regex: req.query.search, $options: "i" } },
        { fullName: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
        { origin: { $regex: req.query.search, $options: "i" } },
        { destination: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const shipments = await Shipment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Shipment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: shipments,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching shipments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching shipments",
      error: error.message,
    });
  }
};

exports.getShipment = async (req, res) => {
  try {
    await ensureConnection();

    const { shipmentNumber } = req.params;
    const shipment = await Shipment.findOne({ shipmentNumber });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    console.error("Error fetching shipment:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching shipment",
      error: error.message,
    });
  }
};

exports.updateShipment = async (req, res) => {
  try {
    await ensureConnection();

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipment ID",
      });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const shipment = await Shipment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Shipment updated successfully",
      data: shipment,
    });
  } catch (error) {
    console.error("Error updating shipment:", error);
    res.status(500).json({
      success: false,
      message: "Error updating shipment",
      error: error.message,
    });
  }
};

exports.deleteShipment = async (req, res) => {
  try {
    await ensureConnection();

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipment ID",
      });
    }

    const shipment = await Shipment.findByIdAndDelete(id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Shipment deleted successfully",
      data: shipment,
    });
  } catch (error) {
    console.error("Error deleting shipment:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting shipment",
      error: error.message,
    });
  }
};

exports.updateShipmentStatus = async (req, res) => {
  try {
    await ensureConnection();

    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipment ID",
      });
    }

    const validStatuses = [
      "Pending",
      "Confirmed",
      "In Transit",
      "Delivered",
      "Cancelled",
    ];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Valid status is required. Options: ${validStatuses.join(", ")}`,
      });
    }

    const shipment = await Shipment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    // Send status update email to customer
    try {
      await brevo.sendEmail({
        email: shipment.email,
        subject: `Shipment Status Update - ${shipment.shipmentNumber}`,
        html: `<h2>Shipment Status Update</h2>
               <p>Dear ${shipment.fullName},</p>
               <p>Your shipment <strong>${shipment.shipmentNumber}</strong> status has been updated to: <strong>${status}</strong></p>
               <p>Thank you for choosing Express Cargo Shipping Logistics.</p>`,
      });
    } catch (emailError) {
      console.error("Error sending status update email:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Shipment status updated successfully",
      data: shipment,
    });
  } catch (error) {
    console.error("Error updating shipment status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating shipment status",
      error: error.message,
    });
  }
};

// Helper function to calculate shipping cost
function calculateShippingCost(weight, dimensions, origin, destination) {
  // Basic calculation - you can make this more sophisticated
  const baseRate = 5; // $5 base rate
  const weightRate = 2; // $2 per kg
  const volumeRate = 0.001; // $0.001 per cubic cm

  const volume = dimensions.length * dimensions.width * dimensions.height;
  const weightCost = weight * weightRate;
  const volumeCost = volume * volumeRate;

  // Add distance multiplier (simplified)
  const distanceMultiplier =
    origin.toLowerCase() === destination.toLowerCase() ? 1 : 1.5;

  return (
    Math.round(
      (baseRate + weightCost + volumeCost) * distanceMultiplier * 100,
    ) / 100
  );
}

module.exports = exports;
