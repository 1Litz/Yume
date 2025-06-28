const express = require('express');
const dotenv = require('dotenv');
const stripe = require('stripe');
const path = require('path');

dotenv.config();

const app = express();
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

app.get('/download', async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId) return res.status(400).send('Missing session ID');

  try {
    const session = await stripeClient.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Adjusted to use your actual folder: "files"
      const filePath = path.join(__dirname, 'files', 'calculator-source.zip');
      return res.download(filePath);
    } else {
      return res.status(403).send('Payment not completed');
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send('Invalid session');
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
