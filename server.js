const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the project root
app.use(express.static(path.join(__dirname)));

// POST /api/quote — receive quote form and send email
app.post('/api/quote', async (req, res) => {
  const { name, email, phone, service, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Name and email are required.' });
  }

  // Configure transporter using environment variables
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"Kent Clothing Lab Website" <${process.env.SMTP_USER}>`,
    to: 'kentclothinglab@gmail.com',
    replyTo: email,
    subject: `KCL Enquiry — ${service || 'General'} — ${name}`,
    text: [
      `New quote request from the Kent Clothing Lab website.`,
      ``,
      `Name:     ${name}`,
      `Email:    ${email}`,
      `Phone:    ${phone || 'Not provided'}`,
      `Service:  ${service || 'Not specified'}`,
      ``,
      `Project details:`,
      message || 'No details provided.',
      ``,
      `---`,
      `Reply directly to this email to respond to ${name}.`,
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:32px;border-radius:8px;">
        <div style="background:#1961FF;padding:20px 32px;border-radius:6px 6px 0 0;margin:-32px -32px 32px;">
          <h1 style="color:#fff;margin:0;font-size:20px;letter-spacing:.05em;">NEW QUOTE REQUEST</h1>
          <p style="color:rgba(255,255,255,.7);margin:4px 0 0;font-size:13px;">Kent Clothing Lab Website</p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.1em;width:120px;">Name</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-size:15px;">${name}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.1em;">Email</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-size:15px;"><a href="mailto:${email}" style="color:#1961FF;">${email}</a></td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.1em;">Phone</td><td style="padding:10px 0;border-bottom:1px solid #eee;font-size:15px;">${phone || '<em style="color:#aaa">Not provided</em>'}</td></tr>
          <tr><td style="padding:10px 0;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.1em;">Service</td><td style="padding:10px 0;font-size:15px;">${service || '<em style="color:#aaa">Not specified</em>'}</td></tr>
        </table>
        <div style="background:#fff;border:1px solid #eee;border-radius:6px;padding:20px;">
          <p style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.1em;margin:0 0 10px;">Project Details</p>
          <p style="font-size:15px;line-height:1.7;margin:0;white-space:pre-wrap;">${message || '<em style="color:#aaa">No details provided.</em>'}</p>
        </div>
        <p style="margin-top:24px;font-size:13px;color:#888;">Reply directly to this email to respond to ${name}.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: 'Your enquiry has been sent! We\'ll be in touch within 24 hours.' });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ success: false, error: 'Failed to send email. Please try again or contact us directly.' });
  }
});

// Fallback: serve index.html for any unmatched route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Kent Clothing Lab server running on port ${PORT}`);
});
