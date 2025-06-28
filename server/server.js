const express = require("express");
const app = express();
const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.use(express.static("public"));

app.get("/download", async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId) return res.status(400).send("Missing session ID.");

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const filePath = path.join(__dirname, "files", "calculator-secured.zip");
      return res.download(filePath);
    } else {
      return res.status(403).send("Payment not verified.");
    }
  } catch (err) {
    console.error("Error verifying session:", err.message);
    return res.status(500).send("Something went wrong.");
  }
});
