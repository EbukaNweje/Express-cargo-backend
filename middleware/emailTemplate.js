const WATERMARK_URL =
  "https://res.cloudinary.com/dfefiap2l/image/upload/v1761935062/Email_footer_banner_1_iyfoix.png";
const LOGO_URL =
  "https://expresscargoshippinglogistics.vercel.app/assets/expLogo-C-_JBLZo.png";
const LINKEDIN_URL =
  "https://res.cloudinary.com/dbzzkaa97/image/upload/v1754433533/linkedIn_ggxxm4.png";
const INSTAGRAM_URL =
  "https://res.cloudinary.com/dbzzkaa97/image/upload/v1754433533/instagram_p8byzw.png";
const FACEBOOK_URL =
  "https://res.cloudinary.com/dbzzkaa97/image/upload/v1754433532/facebook_rjeokq.png";

const getDate = new Date().getFullYear();

const PRIMARY_BLUE = "#05157e";
const SUCCESS_GREEN = "#002611";
const WARNING_ORANGE = "#E9C46A";
const ALERT_RED = "#E76F51";

const baseEmailTemplate = (title, mainContent, accentColor = PRIMARY_BLUE) => {
  const containerStyle = `
    max-width: 600px;
    margin: 0 auto;
    background-color: rgba(255, 254, 254, 1);
    font-family: 'Poppins', sans-serif;
    padding: 20px 0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 38, 17, 0.82);
  `;
  const footerBgStyle = `
    background: url(${WATERMARK_URL}) center / cover no-repeat;
    padding: 40px 0;
    text-align: center;
    color: #fff;
  `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body, table, td, a { margin: 0; padding: 0; border-collapse: collapse; line-height: 1.6; }
    img { border: none; -ms-interpolation-mode: bicubic; }
    a { text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .full-width { width: 100% !important; }
      .content-padding { padding: 20px !important; }
      .header-logo img { width: 100px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #fff; font-family: 'Poppins', sans-serif;">
  <center style="width: 100%;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4;">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="${containerStyle}" class="full-width">

            <!-- Accent Bar -->
            <tr>
              <td style="height: 5px; background-color: ${accentColor};"></td>
            </tr>

            <!-- Logo -->
            <tr>
              <td style="padding: 25px 30px; text-align: center; border-bottom: 1px solid #eeeeee;" class="header-logo">
                <img src="${LOGO_URL}" width="140" alt="Yaticare Logo" style="display: block; margin: 0 auto;">
              </td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td style="padding: 30px;" class="content-padding">
                ${mainContent}
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
  `;
};
exports.contactConfirmation = (contact) => {
  const mainContent = `
    <h1 style="font-size: 24px; color: #002611; margin-bottom: 20px;">We've Received Your Message</h1>
    <p style="font-size: 16px; margin-bottom: 15px; color: #333;">Hi ${contact.fullName},</p>
    <p style="font-size: 16px; margin-bottom: 25px; color: #333;">
      Thank you for reaching out to us! We've received your message and our team will review it shortly.
    </p>
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${PRIMARY_BLUE};">
      <p style="font-size: 14px; color: #666; margin: 5px 0;"><strong>Your Details:</strong></p>
      <p style="font-size: 14px; color: #666; margin: 8px 0;">Email: ${contact.email}</p>
      <p style="font-size: 14px; color: #666; margin: 8px 0;">Phone: ${contact.phone}</p>
      ${contact.company ? `<p style="font-size: 14px; color: #666; margin: 8px 0;">Company: ${contact.company}</p>` : ""}
      <p style="font-size: 14px; color: #666; margin: 8px 0;">Preferred Contact: ${contact.preferredContactMethod === "email" ? "Email" : "Phone"}</p>
    </div>
    <p style="font-size: 16px; margin-bottom: 15px; color: #333;">
      We'll respond to you as soon as possible using your preferred contact method.
    </p>
    <p style="font-size: 16px; margin-top: 20px; color: #333;">Best regards,</p>
    <p style="font-size: 16px; font-weight: 600; color: ${PRIMARY_BLUE}; margin: 0;">Express Cargo Shipping Team</p>
  `;
  return baseEmailTemplate("Message Received - Express Cargo", mainContent);
};

exports.contactNotificationAdmin = (contact) => {
  const mainContent = `
    <h1 style="font-size: 24px; color: #002611; margin-bottom: 20px;">New Contact Message</h1>
    <p style="font-size: 16px; margin-bottom: 15px; color: #333;">A new contact message has been submitted:</p>
    
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${PRIMARY_BLUE};">
      <p style="font-size: 14px; color: #333; margin: 8px 0;"><strong>Name:</strong> ${contact.fullName}</p>
      <p style="font-size: 14px; color: #333; margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${contact.email}" style="color: ${PRIMARY_BLUE};">${contact.email}</a></p>
      <p style="font-size: 14px; color: #333; margin: 8px 0;"><strong>Phone:</strong> <a href="tel:${contact.phone}" style="color: ${PRIMARY_BLUE};">${contact.phone}</a></p>
      ${contact.company ? `<p style="font-size: 14px; color: #333; margin: 8px 0;"><strong>Company:</strong> ${contact.company}</p>` : ""}
      <p style="font-size: 14px; color: #333; margin: 8px 0;"><strong>Preferred Contact Method:</strong> ${contact.preferredContactMethod === "email" ? "Email" : "Phone"}</p>
      <p style="font-size: 14px; color: #333; margin: 8px 0;"><strong>Status:</strong> <span style="color: ${SUCCESS_GREEN}; font-weight: 600;">${contact.status.toUpperCase()}</span></p>
    </div>

    <div style="margin: 25px 0;">
      <p style="font-size: 14px; color: #333; margin: 0 0 10px 0;"><strong>Message:</strong></p>
      <div style="background-color: #fffbf0; padding: 15px; border-radius: 6px; border-left: 4px solid ${WARNING_ORANGE}; color: #333; font-size: 14px; line-height: 1.6;">
        ${contact.message.replace(/\n/g, "<br>")}
      </div>
    </div>

    <p style="font-size: 13px; color: #999; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px;">
      <strong>Message ID:</strong> ${contact._id}
    </p>
  `;
  return baseEmailTemplate(
    "New Contact Submission",
    mainContent,
    WARNING_ORANGE,
  );
};
exports.shipmentConfirmation = (shipment) => {
  const mainContent = `
    <h1 style="font-size: 24px; color: #002611; margin-bottom: 20px;">Shipment Request Confirmed</h1>
    <p style="font-size: 16px; margin-bottom: 15px; color: #333;">Dear ${shipment.fullName},</p>
    <p style="font-size: 16px; margin-bottom: 25px; color: #333;">
      Thank you for choosing Express Cargo Shipping Logistics! Your shipment request has been received and confirmed.
    </p>
    
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${PRIMARY_BLUE};">
      <p style="font-size: 16px; color: #333; margin: 0 0 15px 0;"><strong>Shipment Details:</strong></p>
      <p style="font-size: 14px; color: #666; margin: 8px 0;"><strong>Shipment Number:</strong> ${shipment.shipmentNumber}</p>
      <p style="font-size: 14px; color: #666; margin: 8px 0;"><strong>From:</strong> ${shipment.origin}</p>
      <p style="font-size: 14px; color: #666; margin: 8px 0;"><strong>To:</strong> ${shipment.destination}</p>
      <p style="font-size: 14px; color: #666; margin: 8px 0;"><strong>Weight:</strong> ${shipment.weight} kg</p>
      <p style="font-size: 14px; color: #666; margin: 8px 0;"><strong>Dimensions:</strong> ${shipment.formattedDimensions || `${shipment.dimensions.length}x${shipment.dimensions.width}x${shipment.dimensions.height} cm`}</p>
      <p style="font-size: 14px; color: #666; margin: 8px 0;"><strong>Cargo Type:</strong> ${shipment.cargoType}</p>
      <p style="font-size: 14px; color: #666; margin: 8px 0;"><strong>Preferred Ship Date:</strong> ${new Date(shipment.preferredShipDate).toLocaleDateString()}</p>
      <p style="font-size: 14px; color: #666; margin: 8px 0;"><strong>Status:</strong> <span style="color: ${SUCCESS_GREEN}; font-weight: 600;">${shipment.status}</span></p>
    </div>

    <div style="background-color: #e8f5e8; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${SUCCESS_GREEN};">
      <p style="font-size: 16px; color: #333; margin: 0;"><strong>Estimated Cost: $${shipment.estimatedCost}</strong></p>
      <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">*Final cost may vary based on actual measurements and additional services</p>
    </div>

    <p style="font-size: 16px; margin-bottom: 15px; color: #333;">
      Our team will contact you within 24 hours to confirm the details and arrange pickup.
    </p>
    <p style="font-size: 16px; margin-bottom: 15px; color: #333;">
      You can track your shipment using the shipment number: <strong>${shipment.shipmentNumber}</strong>
    </p>
    
    <p style="font-size: 16px; margin-top: 20px; color: #333;">Best regards,</p>
    <p style="font-size: 16px; font-weight: 600; color: ${PRIMARY_BLUE}; margin: 0;">Express Cargo Shipping Team</p>
  `;
  return baseEmailTemplate(
    "Shipment Request Confirmed",
    mainContent,
    SUCCESS_GREEN,
  );
};

exports.shipmentNotificationAdmin = (shipment) => {
  const mainContent = `
    <h1 style="font-size: 24px; color: #002611; margin-bottom: 20px;">New Shipment Request</h1>
    <p style="font-size: 16px; margin-bottom: 15px; color: #333;">A new shipment request has been submitted:</p>
    
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${PRIMARY_BLUE};">
      <p style="font-size: 16px; color: #333; margin: 0 0 15px 0;"><strong>Customer Information:</strong></p>
      <p style="font-size: 14px; color: #333; margin: 8px 0;"><strong>Name:</strong> ${shipment.fullName}</p>
      <p style="font-size: 14px; color: #333; margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${shipment.email}" style="color: ${PRIMARY_BLUE};">${shipment.email}</a></p>
      <p style="font-size: 14px; color: #333; margin: 8px 0;"><strong>Phone:</strong> <a href="tel:${shipment.phone}" style="color: ${PRIMARY_BLUE};">${shipment.phone}</a></p>
      ${shipment.company ? `<p style="font-size: 14px; color: #333; margin: 8px 0;"><strong>Company:</strong> ${shipment.company}</p>` : ""}
    </div>

    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${WARNING_ORANGE};">
      <p style="font-size: 16px; color: #333; margin: 0 0 15px 0;"><strong>Shipment Details:</strong></p>
      <p style="font-size: 14px; color: #333; margin: 8px 0;"><strong>Shipment Number:</strong> ${shipment.shipmentNumber}</p>
      <p style="font-size: 14px; color: #333; margin: 8px 0;"><strong>From:</strong> ${shipment.origin}</p>
      <p style="font-size: 14px; color: #333; margin: 8px 0;"><strong>To:</strong> ${shipment.destination}</p>
      <p style="font-size: 14px; color: #333; margin: 8px 0;"><strong>Weight:</strong> ${shipment.weight} kg</p>
      <p style="font-size: 14px; color: #333; margin: 8px 0;"><strong>Dimensions:</strong> ${shipment.formattedDimensions || `${shipment.dimensions.length}x${shipment.dimensions.width}x${shipment.dimensions.height} cm`}</p>
      <p style="font-size: 14px; color: #333; margin: 8px 0;"><strong>Cargo Type:</strong> ${shipment.cargoType}</p>
      <p style="font-size: 14px; color: #333; margin: 8px 0;"><strong>Preferred Ship Date:</strong> ${new Date(shipment.preferredShipDate).toLocaleDateString()}</p>
      <p style="font-size: 14px; color: #333; margin: 8px 0;"><strong>Estimated Cost:</strong> $${shipment.estimatedCost}</p>
    </div>

    ${
      shipment.notes
        ? `
    <div style="margin: 25px 0;">
      <p style="font-size: 14px; color: #333; margin: 0 0 10px 0;"><strong>Additional Notes:</strong></p>
      <div style="background-color: #fffbf0; padding: 15px; border-radius: 6px; border-left: 4px solid ${WARNING_ORANGE}; color: #333; font-size: 14px; line-height: 1.6;">
        ${shipment.notes.replace(/\n/g, "<br>")}
      </div>
    </div>
    `
        : ""
    }

    <p style="font-size: 13px; color: #999; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px;">
      <strong>Request ID:</strong> ${shipment._id}<br>
      <strong>Submitted:</strong> ${new Date(shipment.createdAt).toLocaleString()}
    </p>
  `;
  return baseEmailTemplate("New Shipment Request", mainContent, WARNING_ORANGE);
};
