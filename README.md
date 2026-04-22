# 🛡️ RAKSHAKPATH
*Guarded Routes for Every Woman*

**Hackathon Team Repository for Neural Nexus**  
*[HackIndia Ignite - North Region Neural Nexus]*

![RakshakPath Banner](https://img.shields.io/badge/Status-Hackathon_Ready-success?style=for-the-badge)
![Web3 Enabled](https://img.shields.io/badge/Web3-MetaMask_Verified-blue?style=for-the-badge)
![PWA](https://img.shields.io/badge/App-Progressive_Web_App-orange?style=for-the-badge)

## 📌 The Problem
Navigating unknown cities safely remains a core challenge for women globally. Current map systems calculate routes primarily based on time and distance, largely ignoring the dynamic safety context of neighborhoods (e.g., lighting, recent incidents, time of day). Furthermore, emergency reporting is often slow, requires too many taps, or can inadvertently escalate dangerous situations if an attacker realizes an alarm is being triggered.

## 💡 The Solution
**RakshakPath** is an AI-powered, mobile-first Web3 Progressive Web App (PWA) designed to fuse real-time spatial awareness with decentralized community verification.
We don't just route you faster; we route you **safer**.

### ✨ Core Features
- 🎙️ **Voice-Triggered SOS:** Background microphone processing utilizing the Native Web Speech API automatically triggers a countdown and dispatches emergency emails (via EmailJS) the moment you shout keywords like "Help" or "Bachao".
- 🥷 **Silent SOS (Stealth Mode):** An alternate emergency trigger that intentionally blacks out the user's phone screen instantly while silencing alarms, sending a stealth distress signal without alerting the attacker.
- 🌙 **Time-Aware Maps API (AI):** Using Leaflet & Geolocation mapping, our system dynamically updates area "Danger Values". A zone flagged for "Poor Lighting" turns from a safe green to a hazardous red on the map only after sunset.
- 🔗 **Blockchain Immutable Reports:** Users can bind their MetaMask wallets and cryptographically sign their Danger Zone reports. Fusing Web2 speed with Web3 security natively guarantees that reports are authentic and tamper-proof.
- 📱 **Progressive Web App:** Installable directly to a mobile device's home screen without needing app store approval, guaranteeing offline resilience and full-screen interaction.
- 🌐 **Tier 2/3 Localization:** Fully supports instant English to Hindi toggling to prioritize hyper-local Indian demographics.

---

## 🛠️ Architecture & Tech Stack

| Domain | Technology |
|---|---|
| **Frontend UI** | React 19, Vite, Tailwind CSS (Dark/Glass UI) |
| **Backend API** | Node.js, Express.js |
| **Database** | Firebase Firestore (Real-time NoSQL) |
| **Maps & Routing** | Leaflet, React-Leaflet, OpenStreetMap, Nominatim |
| **Web3 / Blockchain** | MetaMask (`window.ethereum` personal_sign injection) |
| **Testing** | Supertest, Jest, Vitest, React Testing Library |

### Backend API Endpoints (Express)
- `POST /api/report` - Allows signed/unsigned danger zone submissions.
- `GET  /api/dangers` - Hydrates the frontend map with community incidents.
- `POST /api/sos` - Securely logs distress instances asynchronously.

---

## 🚦 Running Locally

### 1. Clone & Setup
```bash
git clone https://github.com/HackIndiaXYZ/hackindia-spark-7-north-region-neural-nexus.git
cd hackindia-spark-7-north-region-neural-nexus
```

### 2. Backend Boot
Requires a valid `serviceAccountKey.json` inside the Firebase configs.
```bash
cd backend
npm install
npm run start
```

### 3. Frontend Boot
```bash
cd frontend
npm install
npm run dev
```

### 4. Run Automated Tests
```bash
# In backend
npx jest

# In frontend
npx vitest
```

---

## 🤝 The Team: Neural Nexus
We built this inside a 24-48 hour Hackathon sprint with extreme focus on UI/UX excellence, cryptographic edge cases, and robust software architecture. 

**"Navigate Smart. Stay Safe."**
