const express = require('express');
const Stripe = require('stripe');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.json());

const YOUR_DOMAIN = 'https://yume-api.onrender.com';

app.post('/create-secure-checkout', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Secure Source (Calculator System)'
        },
        unit_amount: 1000,
      },
      quantity: 1,
    }],
    success_url: `${YOUR_DOMAIN}/download?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${YOUR_DOMAIN}/cancel`,
  });

  res.json({ id: session.id });
});

app.post('/create-fullsource-checkout', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Full Source (Calculator System)'
        },
        unit_amount: 3000,
      },
      quantity: 1,
    }],
    success_url: `${YOUR_DOMAIN}/download?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${YOUR_DOMAIN}/cancel`,
  });

  res.json({ id: session.id });
});

app.get('/download', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

  if (!session || session.payment_status !== 'paid') {
    return res.status(403).send("❌ Payment not completed.");
  }

  const fileName = session.amount_total === 1000
    ? 'calculator-source.zip'
    : 'fullsource.zip';

  const filePath = path.join(__dirname, 'files', fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("❌ File not found.");
  }

  res.download(filePath);
});

app.get('/cancel', (req, res) => {
  res.send('⛔ Payment canceled. You can go back and try again.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
