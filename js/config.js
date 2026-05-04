/**
 * Shop configuration — WhatsApp receives order messages from Confirm Order.
 * whatsappNumber: country code + number, digits only (no + or spaces).
 *
 * serviceWards: RCC wards available at checkout (must match wardDeliveryBdt keys).
 * wardDeliveryBdt: delivery charge (BDT) per ward — 30 / 40 / 50 zones as you defined.
 *
 * Zone guide (approximate mapping to wards):
 * ৳30 — Laxmipur, Rajpara, Shaheb Bazar area & nearby old-town (Horogram, Masterpara).
 * ৳40 — C&B Mor, New Market, Railgate, Court Station, Upashahar, Talaimari, Kazihata, Sapura, Chandipur, Kashiadanga.
 * ৳50 — RU / Binodpur side, Shalbagan, Katakhali, Shah Makhdum, Paba edge & outer wards.
 */
window.MiniMartConfig = {
  whatsappNumber: "8801733488751",
  serviceWards: [
    "Ward 1 – Horogram",
    "Ward 2 – Horogram (South)",
    "Ward 3 – Boalia",
    "Ward 4 – Kazihata",
    "Ward 5 – C&B (C and B Area)",
    "Ward 6 – Laxmipur",
    "Ward 7 – Masterpara",
    "Ward 8 – Shaheb Bazar",
    "Ward 9 – Rajpara",
    "Ward 10 – Court Station",
    "Ward 11 – Sapura",
    "Ward 12 – Shalbagan",
    "Ward 13 – Upashahar",
    "Ward 14 – Chandipur",
    "Ward 15 – Kashiadanga",
    "Ward 16 – Budhpara",
    "Ward 17 – Talaimari",
    "Ward 18 – Katakhali",
    "Ward 19 – Shah Makhdum",
    "Ward 20 – Baliapukur",
    "Ward 21 – Nowdapara",
    "Ward 22 – Darikhurbona",
    "Ward 23 – Paba Adjacent Area",
    "Ward 24 – Bhadra",
    "Ward 25 – Bhatapara",
    "Ward 26 – Kadirganj",
    "Ward 27 – Barind",
    "Ward 28 – Kharkhari",
    "Ward 29 – Tikapara",
    "Ward 30 – Daulatpur",
  ],
  wardDeliveryBdt: {
    "Ward 1 – Horogram": 30,
    "Ward 2 – Horogram (South)": 30,
    "Ward 3 – Boalia": 40,
    "Ward 4 – Kazihata": 40,
    "Ward 5 – C&B (C and B Area)": 40,
    "Ward 6 – Laxmipur": 30,
    "Ward 7 – Masterpara": 30,
    "Ward 8 – Shaheb Bazar": 30,
    "Ward 9 – Rajpara": 30,
    "Ward 10 – Court Station": 40,
    "Ward 11 – Sapura": 40,
    "Ward 12 – Shalbagan": 50,
    "Ward 13 – Upashahar": 40,
    "Ward 14 – Chandipur": 40,
    "Ward 15 – Kashiadanga": 40,
    "Ward 16 – Budhpara": 50,
    "Ward 17 – Talaimari": 40,
    "Ward 18 – Katakhali": 50,
    "Ward 19 – Shah Makhdum": 50,
    "Ward 20 – Baliapukur": 50,
    "Ward 21 – Nowdapara": 50,
    "Ward 22 – Darikhurbona": 50,
    "Ward 23 – Paba Adjacent Area": 50,
    "Ward 24 – Bhadra": 50,
    "Ward 25 – Bhatapara": 50,
    "Ward 26 – Kadirganj": 50,
    "Ward 27 – Barind": 50,
    "Ward 28 – Kharkhari": 50,
    "Ward 29 – Tikapara": 50,
    "Ward 30 – Daulatpur": 50,
  },
};
