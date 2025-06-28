// This is your secure Node.js backend server example using Express
const express = require('express');
const path = require('path');
const stripe = require('stripe')('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');

const app = express();
app.use(express.static('public'));

app.get('/download', async (req, res) => {
  const sessionId = req.query.session_id;

  if (!sessionId) return res.status(400).send('Missing session ID.');

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const filePath = path.join(__dirname, 'files', 'calculator-source.zip');
      return res.download(filePath);
    } else {
      return res.status(403).send('You must complete payment to access this file.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error.');
  }
});

// Optional: homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
