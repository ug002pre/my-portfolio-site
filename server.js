import dotenv from 'dotenv'
dotenv.config();//load env variable
import express from 'express'
import emailjs from'@emailjs/nodejs';
import cors   from 'cors';
import path from'path';
import { fileURLToPath } from 'url';



//fix for _dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




const app = express ();
const PORT = process.env.PORT|| 3000;


//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extented:true }));

//serves the existing static website files
app.use(express.static('public'));


app,get('/', (req, res)=>{
  res.sendfile(path.join(__dirname, 'index.html'))
});

//backend point to send email
app.post('/send-email', async (req, res) => {
  console.log('Received POST request for /send-email');
  const { name, email, message } = req.body; // Adjust keys to match your form

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    const templateParams = {
      name,
      email,
      message,
      // Add more variables to match your EmailJS template
    };

    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );

   return res.json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Email send error:', error);

    if(!res.headersSent){
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
}
});

// Start server
app.listen(PORT,()=>{
  console.log(`server running on port ${PORT}`);
})