import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import db from './firebase.js';
import fs from 'fs';


const app = express();
app.use(cors());
app.use(express.json());

// --- PERSISTENCE HELPERS ---
const DATA_FILE = './data.json';

const loadData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (err) {
    console.error("❌ Error loading data.json:", err);
  }
  return { users: {}, otpStore: {}, reports: [] };
};

const saveData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Error saving data.json:", err);
  }
};

let localData = loadData();
let users = localData.users;
let otpStore = localData.otpStore;
let reports = localData.reports || [];

// MAIL SETUP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ✅ REGISTER
app.post('/api/register', async (req, res) => {
  const { email, password, name, address, contactNumber, emergencyContact1, emergencyContact2 } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  
  const userData = { 
    email, 
    password: password || "", // Firebase handles password, but we store it if provided
    name: name || "User", 
    address: address || "Not provided", 
    contactNumber: contactNumber || "0000000000", 
    emergencyContact1: emergencyContact1 || "", 
    emergencyContact2: emergencyContact2 || "",
    isVerified: false
  };

  // Save to Firestore if available
  if (db) {
    try {
      await db.collection('users').doc(email).set(userData, { merge: true });
    } catch (err) {
      console.error("❌ Firestore Save Error:", err);
    }
  }

  // Always save to local store for fallback/demo
  users[email] = userData;
  saveData({ users, otpStore });

  console.log(`✅ User registered/updated: ${email}`);
  res.json({ message: "Registered successfully", user: userData });
});

// ✅ LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  let user = users[email];

  // Try fetching from Firestore if not in local store
  if (!user && db) {
    try {
      const doc = await db.collection('users').doc(email).get();
      if (doc.exists) {
        user = doc.data();
        users[email] = user; // Sync to local
        saveData({ users, otpStore, reports });
      }
    } catch (err) {
      console.error("❌ Firestore Fetch Error:", err);
    }
  }

  if (!user) return res.status(404).json({ error: "User not found" });
  
  // Basic password check (for demo, if password was stored)
  if (password && user.password && user.password !== password) {
     return res.status(401).json({ error: "Invalid password" });
  }

  console.log(`✅ User logged in: ${email}`);
  res.json({ message: "Login successful", user });
});

// ✅ UPDATE PROFILE
app.put('/api/update-profile', (req, res) => {
  const { email, ...fields } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  if (!users[email]) return res.status(404).json({ error: "User not found" });
  users[email] = { ...users[email], ...fields };
  
  if (db) {
    db.collection('users').doc(email).update(fields).catch(err => console.error("❌ Firestore Update Error:", err));
  }
  
  saveData({ users, otpStore, reports });
  console.log(`✏️ Profile updated: ${email}`);
  res.json({ message: "Profile updated", user: users[email] });
});


// ✅ DELETE ACCOUNT
app.delete('/api/delete-account', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });
  if (!users[email]) return res.status(404).json({ message: "User not found" });
  delete users[email];
  delete otpStore[email];
  console.log(`🗑️ Account deleted: ${email}`);
  res.json({ message: "Account deleted successfully" });
});

// ✅ SEND EMAIL OTP
app.post('/api/send-email-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;
    saveData({ users, otpStore, reports }); // Persist OTP
    const mailOptions = {
      from: `"RakshakPath" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP is ${otp}`
    };
    await transporter.sendMail(mailOptions);
    console.log(`📧 OTP sent to ${email}: ${otp}`);
    res.json({ success: true });
  } catch (error) {
    console.error("OTP send error:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// ✅ VERIFY EMAIL OTP
app.post('/api/verify-email-otp', (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] && otpStore[email] == otp) {
    delete otpStore[email];
    
    // Update verification status in local store
    if (users[email]) {
      users[email].isVerified = true;
      if (db) {
        db.collection('users').doc(email).update({ isVerified: true }).catch(err => console.error("❌ Firestore Update Error:", err));
      }
    }
    
    saveData({ users, otpStore, reports });
    return res.json({ success: true });
  }
  res.json({ success: false, error: "Invalid OTP" });
});

// ✅ REPORT DANGER
app.post('/api/report', async (req, res) => {
  const report = {
    ...req.body,
    id: Date.now(),
    timestamp: new Date().toISOString()
  };
  
  reports.push(report);
  
  if (db) {
    try {
      await db.collection('reports').add(report);
    } catch (err) {
      console.error("❌ Firestore Report Error:", err);
    }
  }
  
  saveData({ users, otpStore, reports });
  console.log("⚠️ Danger Report Saved:", report);

  // 🚨 SMS ALERT — Teammate/Authority ko SMS bhejna
  const alertPhone = process.env.REPORT_ALERT_PHONE;
  const twilioClient = (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN)
    ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

  if (twilioClient && alertPhone && alertPhone !== '+91XXXXXXXXXX') {
    const reporterName = report.user_name || 'Anonymous';
    const location = report.location_name || 'Unknown Location';
    const dangerType = report.danger_type || 'Unknown';
    const description = report.description || 'No description provided';
    const time = new Date(report.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const smsBody = 
`🚨 RakshakPath DANGER REPORT 🚨
------------------------------
📍 Location: ${location}
⚠️ Type: ${dangerType}
👤 Reported by: ${reporterName}
📝 Details: ${description}
🕐 Time: ${time}
------------------------------
Please verify and take action.`;

    try {
      await twilioClient.messages.create({
        body: smsBody,
        from: process.env.TWILIO_PHONE,
        to: alertPhone
      });
      console.log(`✅ Report Alert SMS sent to ${alertPhone}`);
    } catch (smsErr) {
      console.error(`❌ Report Alert SMS Failed: ${smsErr.message}`);
    }
  } else {
    if (!alertPhone || alertPhone === '+91XXXXXXXXXX') {
      console.log("ℹ️  REPORT_ALERT_PHONE not set in .env — SMS not sent");
    }
  }

  res.json({ message: "Report submitted", report });
});


// ✅ GET DANGERS (For Map)
app.get('/api/dangers', (req, res) => {
  res.json(reports);
});

// ✅ SOS EMERGENCY ENDPOINT (SMS & CALL)
app.post('/api/sos', async (req, res) => {
  try {
    const { latitude, longitude, location, time, user_name, contacts } = req.body;

    console.log(`🚨 SOS ALERT from ${user_name} at ${time}`);
    console.log(`📍 Location: ${location}`);
    console.log(`📞 Target Contacts: ${contacts?.join(', ') || 'NONE'}`);

    const twilioClient = (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN)
      ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
      : null;

    if (!twilioClient) {
      console.error("❌ CRITICAL: Twilio credentials missing in .env");
      return res.status(500).json({
        success: false,
        error: "SOS System not configured. Please add Twilio SID and Auth Token to .env"
      });
    }

      // Avoid URLs in trial SMS to India to prevent Carrier Spam Blocking (Error 30044)
      const messageBody = `Emergency! Please check on ${user_name}. Location: Lat ${latitude}, Lng ${longitude}`;

    if (!contacts || contacts.length === 0) {
      console.warn("⚠️ No contacts provided in SOS request");
      return res.status(400).json({ success: false, error: "No emergency contacts found in profile." });
    }

    for (const phone of contacts) {
      if (!phone) continue;
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

      // 1. Send SMS
      try {
        console.log(`📡 Attempting SMS to ${formattedPhone}...`);
        await twilioClient.messages.create({
          body: messageBody,
          from: process.env.TWILIO_PHONE,
          to: formattedPhone
        });
        console.log(`✅ SMS sent to ${formattedPhone}`);
      } catch (smsErr) {
        console.error(`❌ SMS Failed for ${formattedPhone}: ${smsErr.message}`);
      }

      // 2. Trigger CALL
      try {
        console.log(`📞 Attempting Call to ${formattedPhone}...`);
        await twilioClient.calls.create({
          twiml: `<Response><Say voice="alice">Emergency Alert for ${user_name}! A distress signal was triggered. Location details have been sent to you via SMS. Please check and respond immediately.</Say></Response>`,
          from: process.env.TWILIO_PHONE,
          to: formattedPhone
        });
        console.log(`✅ Call triggered for ${formattedPhone}`);
      } catch (callErr) {
        console.error(`❌ Call Failed for ${formattedPhone}: ${callErr.message}`);
      }
    }

    res.json({ success: true, message: "SOS alerts processed. Check server logs for delivery status." });

  } catch (err) {
    console.error("❌ Twilio SOS Master Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 5001;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
