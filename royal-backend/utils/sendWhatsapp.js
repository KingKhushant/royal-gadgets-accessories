const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);



const sendOrderWhatsapp = async (order) => {

   
  try {
    const itemsText = order.items
    .map(
        (item, index) =>
        `${index + 1}. ${item.product?.name || "Product"}
    Qty: ${item.quantity}
    Price: ₹${item.price}`
    )
    .join("\n\n");

    console.log("🚀 WhatsApp function called");
    console.log(order);

    const message = `
    🛒 NEW ORDER RECEIVED

    👤 Customer: ${order.customerName}
    📧 Email: ${order.email}
    📞 Phone: ${order.phone || "N/A"}

    🏠 Address:
    ${order.address || ""}
    ${order.city || ""}
    ${order.state || ""}
    ${order.pincode || ""}

    💰 Total: ₹${order.total}

    📦 Items:
    ${itemsText}

    📅 Order Time:
    ${new Date().toLocaleString()}
    `;

        await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: process.env.ADMIN_WHATSAPP_NUMBER,
        body: message,
        });

        console.log("✅ WhatsApp sent to admin");
    }catch (error) {
        console.log("❌ TWILIO ERROR");
        console.log(error.code);
        console.log(error.message);
        console.log(error);
    }
};

module.exports = sendOrderWhatsapp;