import dotenv from 'dotenv'
dotenv.config();
import express from 'express'
import emailjs from '@emailjs/nodejs';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ─── MIDDLEWARE ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── ROUTES ──────────────────────────────────────────────────────────────────

// Serve the HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Explicitly handle POST requests on /send-email
app.route('/send-email')
  .get((req, res) => {
    res.status(405).json({ success: false, message: 'Method Not Allowed. Use POST.' });
  })
  .post(async (req, res) => {
    console.log('POST /send-email received — body:', req.body);

    const { name, email, number, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Missing required fields: name, email, message' });
    }

    try {
      const templateParams = { name, email, number, message };

      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_TEMPLATE_ID,
        templateParams,
        {
          publicKey: process.env.EMAILJS_PUBLIC_KEY,
          privateKey: process.env.EMAILJS_PRIVATE_KEY,
        }
      );

      return res.status(200).json({ success: true, message: 'Email sent successfully!' });
    } catch (error) {
      console.error('EmailJS error:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Failed to send email. Please try again.' });
      }
    }
  });

// ─── STATIC FILES (must come after all routes) ───────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── START SERVER ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});