// This is your secure Node.js backend server example using Express

const express = require('express');
const path = require('path');
const stripe = require('stripe')('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');
const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'myr',
          product_data: {
            name: 'Calculator Script Source',
          },
          unit_amount: 1000 * 100, // RM1000 in cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'https://yumegt.xyz/success',
    cancel_url: 'https://yourwebsite.com/cancel',
  });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/download', async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId) return res.status(400).send("Missing session ID");

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const filePath = path.join(__dirname, 'files', 'calculator-source.zip');
      res.download(filePath);
    } else {
      res.status(403).send("Payment not verified.");
    }
  } catch (err) {
    res.status(400).send("Invalid session.");
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
