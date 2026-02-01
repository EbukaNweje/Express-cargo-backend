const Tracking = require("../models/Tracking");
const mongoose = require("mongoose");

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
    console.log("Database connected in tracking controller");
  } catch (error) {
    console.error("Tracking controller DB connection error:", error);
    throw error;
  }
};

exports.createTracking = async (req, res) => {
  try {
    await ensureConnection();

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const {
      trackingNumber,
      currentLocation,
      deliveryLocation,
      estimatedDelivery,
      status,
      progress,
      events,
      sender,
      receiver,
      productName,
      typeOfShipment,
      weight,
      quantity,
      totalFreight,
    } = req.body;

    // Status validation
    const validStatuses = ["Pending", "In Transit", "Delivered"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Progress validation (allow string numbers)
    if (progress !== undefined) {
      const prog = Number(progress);
      if (Number.isNaN(prog) || prog < 0 || prog > 100) {
        return res.status(400).json({
          success: false,
          message: "Progress must be a number between 0 and 100",
        });
      }
    }

    // Estimated delivery date validation
    let parsedEstimatedDelivery;
    if (estimatedDelivery) {
      parsedEstimatedDelivery = new Date(estimatedDelivery);
      if (isNaN(parsedEstimatedDelivery.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Estimated delivery must be a valid date",
        });
      }
    }

    // Email validation helper
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (sender && sender.email && !emailRegex.test(sender.email)) {
      return res
        .status(400)
        .json({ success: false, message: "Sender email is invalid" });
    }
    if (receiver && receiver.email && !emailRegex.test(receiver.email)) {
      return res
        .status(400)
        .json({ success: false, message: "Receiver email is invalid" });
    }

    // Numeric validations (weight, quantity, totalFreight)
    if (weight !== undefined) {
      const w = Number(weight);
      if (Number.isNaN(w) || w < 0) {
        return res.status(400).json({
          success: false,
          message: "Weight must be a positive number",
        });
      }
    }
    if (quantity !== undefined) {
      const q = Number(quantity);
      if (!Number.isInteger(q) || q < 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be a non-negative integer",
        });
      }
    }
    if (totalFreight !== undefined) {
      const tf = Number(totalFreight);
      if (Number.isNaN(tf) || tf < 0) {
        return res.status(400).json({
          success: false,
          message: "Total freight must be a non-negative number",
        });
      }
    }

    // Validate events array structure if provided and parse dates (date optional; defaults to now)
    let parsedEvents = [];
    if (events && Array.isArray(events)) {
      for (const event of events) {
        if (!event.status) {
          return res.status(400).json({
            success: false,
            message: "Each event must have a status",
          });
        }

        let d;
        if (event.date) {
          d = new Date(event.date);
          if (isNaN(d.getTime())) {
            return res.status(400).json({
              success: false,
              message: "Each event must have a valid date",
            });
          }
        } else {
          d = new Date();
        }

        parsedEvents.push({
          date: d,
          status: event.status,
          location: event.location || undefined,
          completed: !!event.completed,
          note: event.note || undefined,
        });
      }
    }

    // Build tracking data object only with provided values
    const trackingData = {
      ...(trackingNumber ? { trackingNumber } : {}),
      ...(currentLocation ? { currentLocation } : {}),
      ...(deliveryLocation ? { deliveryLocation } : {}),
      ...(parsedEstimatedDelivery
        ? { estimatedDelivery: parsedEstimatedDelivery }
        : {}),
      status: status || "Pending",
      progress: progress !== undefined ? Number(progress) : 0,
      ...(sender ? { sender } : {}),
      ...(receiver ? { receiver } : {}),
      ...(productName ? { productName } : {}),
      ...(typeOfShipment ? { typeOfShipment } : {}),
      ...(weight !== undefined ? { weight: Number(weight) } : {}),
      ...(quantity !== undefined ? { quantity: Number(quantity) } : {}),
      ...(totalFreight !== undefined
        ? { totalFreight: Number(totalFreight) }
        : {}),
      events: parsedEvents,
    };

    const tracking = await Tracking.create(trackingData);

    res.status(201).json({
      success: true,
      message: "Tracking created successfully",
      data: tracking,
    });
  } catch (error) {
    console.error("Error creating tracking:", error);

    // Handle duplicate tracking number error
    if (
      error.code === 11000 &&
      error.keyPattern &&
      error.keyPattern.trackingNumber
    ) {
      return res.status(409).json({
        success: false,
        message: "Tracking number already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating tracking",
      error: error.message,
    });
  }
};

exports.getAllTrackings = async (req, res) => {
  try {
    await ensureConnection();
    const trackings = await Tracking.find();
    res.status(200).json({
      success: true,
      data: trackings,
      count: trackings.length,
    });
  } catch (error) {
    console.error("Error fetching trackings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching trackings",
      error: error.message,
    });
  }
};

exports.getTracking = async (req, res) => {
  try {
    await ensureConnection();

    const { trackingNumber } = req.params;
    const tracking = await Tracking.findOne({ trackingNumber });
    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: "Tracking not found",
      });
    }
    res.status(200).json({
      success: true,
      data: tracking,
    });
  } catch (error) {
    console.error("Error fetching tracking:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tracking",
      error: error.message,
    });
  }
};

// Helper: parse flexible date strings (ISO, timestamp, or dd/mm/yyyy, dd-mm-yyyy)
function parseDateFlexible(input) {
  if (!input && input !== 0) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  if (typeof input === "number") return new Date(input);

  const str = String(input).trim();
  // Try native parsing first
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;

  // Try dd/mm/yyyy or d/m/yyyy or dd-mm-yyyy
  const m = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10);
    let year = parseInt(m[3], 10);
    if (year < 100) year += 2000;
    const dd = new Date(year, month - 1, day);
    return isNaN(dd.getTime()) ? null : dd;
  }

  return null;
}

exports.updateTracking = async (req, res) => {
  try {
    await ensureConnection();

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    // Shallow clone to safely mutate
    const updates = { ...req.body };

    // Parse and validate estimatedDelivery if present
    if (updates.estimatedDelivery !== undefined) {
      const parsed = parseDateFlexible(updates.estimatedDelivery);
      if (!parsed) {
        return res
          .status(400)
          .json({
            success: false,
            message: "estimatedDelivery must be a valid date",
          });
      }
      updates.estimatedDelivery = parsed;
    }

    // Validate progress if provided
    if (updates.progress !== undefined) {
      const p = Number(updates.progress);
      if (Number.isNaN(p) || p < 0 || p > 100) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Progress must be a number between 0 and 100",
          });
      }
      updates.progress = p;
    }

    // Numeric validations
    if (updates.weight !== undefined) {
      const w = Number(updates.weight);
      if (Number.isNaN(w) || w < 0) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Weight must be a positive number",
          });
      }
      updates.weight = w;
    }
    if (updates.quantity !== undefined) {
      const q = Number(updates.quantity);
      if (!Number.isInteger(q) || q < 0) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Quantity must be a non-negative integer",
          });
      }
      updates.quantity = q;
    }
    if (updates.totalFreight !== undefined) {
      const tf = Number(updates.totalFreight);
      if (Number.isNaN(tf) || tf < 0) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Total freight must be a non-negative number",
          });
      }
      updates.totalFreight = tf;
    }

    // Handle events if provided
    if (updates.events && Array.isArray(updates.events)) {
      const parsedEvents = [];
      for (const event of updates.events) {
        if (!event.status) {
          return res
            .status(400)
            .json({ success: false, message: "Each event must have a status" });
        }
        let dateObj;
        if (event.date) {
          dateObj = parseDateFlexible(event.date);
          if (!dateObj) {
            return res
              .status(400)
              .json({
                success: false,
                message: "Each event must have a valid date",
              });
          }
        } else {
          dateObj = new Date();
        }
        parsedEvents.push({
          date: dateObj,
          status: event.status,
          location: event.location || undefined,
          completed: !!event.completed,
          note: event.note || undefined,
        });
      }
      updates.events = parsedEvents;
    }

    const tracking = await Tracking.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: "Tracking not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Tracking updated successfully",
      data: tracking,
    });
  } catch (error) {
    console.error("Error updating tracking:", error);
    // Handle duplicate tracking number error
    if (
      error.code === 11000 &&
      error.keyPattern &&
      error.keyPattern.trackingNumber
    ) {
      return res.status(409).json({
        success: false,
        message: "Tracking number already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating tracking",
      error: error.message,
    });
  }
};

exports.deleteTracking = async (req, res) => {
  try {
    await ensureConnection();

    const tracking = await Tracking.findByIdAndDelete(req.params.id);
    if (!tracking) {
      return res.status(404).json({
        success: false,
        message: "Tracking not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Tracking deleted successfully",
      data: tracking,
    });
  } catch (error) {
    console.error("Error deleting tracking:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting tracking",
      error: error.message,
    });
  }
};
