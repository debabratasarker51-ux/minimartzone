/**
 * Shop configuration — WhatsApp receives order messages from Confirm Order.
 * whatsappNumber: country code + number, digits only (no + or spaces).
 * 01733488751 -> 8801733488751
 */
window.MiniMartConfig = {
  whatsappNumber: "8801733488751",
  deliveryFeeInsideBdt: 60,
  deliveryFeeOutsideBdt: 120,
  insideDeliveryAreas: ["Shaheb Bazar", "Laxmipur", "Kazla"],
  outsideDeliveryAreaValue: "Other (Rajshahi — outside listed zones)",
};
