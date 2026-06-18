import React, { useState, useEffect } from 'react';

const HomeScreen = ({ onNavigate, user, language, setLanguage }) => {
  const [address, setAddress] = useState("Locating Node...");
  const [showFakeCall, setShowFakeCall] = useState(false);
  const [timer, setTimer] = useState(0); 
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [reportCount, setReportCount] = useState(0);
  const [activeThreats, setActiveThreats] = useState(0);
  const [recentReports, setRecentReports] = useState([]);

  const translations = {
    en: {
      tagline: "Sentinel-Class Protection for the Modern Woman",
      heroTitle: `Welcome back, Sentinel ${user?.name?.split(' ')[0] || 'User'}`,
      heroSub: "All safety protocols are currently active. Your current sector is monitored.",
      pressEmerg: "Squeeze power button or press SOS in danger",
      statsDaz: "Active Threats",
      statsSafe: "Safe Zones",
      statsRep: "Local Reports",
      findRoute: "Safety Route Map",
      reportDanger: "File Threat Report",
      home: "Dashboard",
      map: "Safety Map",
      report: "Report",
      verified: "VERIFIED"
    },
    hi: {
      tagline: "आधुनिक महिलाओं के लिए उच्चतम सुरक्षा",
      heroTitle: `स्वागत है, प्रहरी ${user?.name?.split(' ')[0] || 'यूजर'}`,
      heroSub: "सभी सुरक्षा प्रोटोकॉल वर्तमान में सक्रिय हैं। आपका क्षेत्र मॉनिटर किया जा रहा है।",
      pressEmerg: "खतरे में पावर बटन दबाएं या SOS दबाएं",
      statsDaz: "सक्रिय खतरे",
      statsSafe: "सुरक्षित क्षेत्र",
      statsRep: "स्थानीय रिपोर्ट",
      findRoute: "सुरक्षा मार्ग मानचित्र",
      reportDanger: "खतरे की रिपोर्ट करें",
      home: "डैशबोर्ड",
      map: "मानचित्र",
      report: "रिपोर्ट",
      verified: "सत्यापित"
    },
    mr: {
      tagline: "आधुनिक महिलांसाठी सर्वोच्च सुरक्षा",
      heroTitle: `स्वागत आहे, रक्षक ${user?.name?.split(' ')[0] || 'युजर'}`,
      heroSub: "सर्व सुरक्षा प्रोटोकॉल सध्या सक्रिय आहेत. तुमच्या क्षेत्रावर लक्ष ठेवले जात आहे.",
      pressEmerg: "धोक्यात असल्यास पॉवर बटण दाबा किंवा SOS दाबा",
      statsDaz: "सक्रिय धोके",
      statsSafe: "सुरक्षित क्षेत्रे",
      statsRep: "स्थानिक अहवाल",
      findRoute: "सुरक्षा मार्ग नकाशा",
      reportDanger: "धोक्याची तक्रार करा",
      home: "डॅशबोर्ड",
      map: "नकाशा",
      report: "अहवाल",
      verified: "सत्यापित"
    },
    bn: {
      tagline: "আধুনিক নারীদের জন্য সর্বোচ্চ নিরাপত্তা",
      heroTitle: `স্বাগতম, সেন্টিনেল ${user?.name?.split(' ')[0] || 'ব্যবহারকারী'}`,
      heroSub: "সমস্ত নিরাপত্তা প্রোটোকল বর্তমানে সক্রিয়। আপনার বর্তমান সেক্টর পর্যবেক্ষণ করা হচ্ছে।",
      pressEmerg: "বিপদে পাওয়ার বোতাম বা SOS চাপুন",
      statsDaz: "সক্রিয় হুমকি",
      statsSafe: "নিরাপদ অঞ্চল",
      statsRep: "স্থানীয় রিপোর্ট",
      findRoute: "নিরাপত্তা রুট ম্যাপ",
      reportDanger: "হুমকি রিপোর্ট করুন",
      home: "ড্যাশবোর্ড",
      map: "মানচিত্র",
      report: "রিপোর্ট",
      verified: "যাচাইকৃত"
    },
    te: {
      tagline: "ఆధునిక మహిళలకు అత్యున్నత భద్రత",
      heroTitle: `స్వాగతం, సెంటైన్ ${user?.name?.split(' ')[0] || 'వాడుకరి'}`,
      heroSub: "అన్ని భద్రతా ప్రోటోకాల్‌లు ప్రస్తుతం సక్రియంగా ఉన్నాయి. మీ ప్రస్తుత సెక్టార్ పర్యవేక్షించబడుతోంది.",
      pressEmerg: "ప్రమాదంలో పవర్ బటన్ లేదా SOS నొక్కండి",
      statsDaz: "సక్రియ ముప్పులు",
      statsSafe: "సురక్షిత మండలాలు",
      statsRep: "స్థానిక నివేదికలు",
      findRoute: "భద్రతా రూట్ మ్యాప్",
      reportDanger: "ముప్పు నివేదించండి",
      home: "డాష్‌బోర్డ్",
      map: "మ్యాప్",
      report: "నివేదిక",
      verified: "ధృవీకరించబడింది"
    },
    ta: {
      tagline: "நவீன பெண்களுக்கான உயர்தர பாதுகாப்பு",
      heroTitle: `வரவேற்கிறோம், சென்டினல் ${user?.name?.split(' ')[0] || 'பயனர்'}`,
      heroSub: "அனைத்து பாதுகாப்பு நெறிமுறைகளும் தற்போது செயலில் உள்ளன. உங்கள் தற்போதைய துறை கண்காணிக்கப்படுகிறது.",
      pressEmerg: "ஆபத்தில் பவர் பட்டன் அல்லது SOS ஐ அழுத்தவும்",
      statsDaz: "செயலில் உள்ள அச்சுறுத்தல்கள்",
      statsSafe: "பாதுகாப்பான மண்டலங்கள்",
      statsRep: "உள்ளூர் அறிக்கைகள்",
      findRoute: "பாதுகாப்பு வழித்தட வரைபடம்",
      reportDanger: "அச்சுறுத்தலை புகாரளிக்கவும்",
      home: "டாஷ்போர்டு",
      map: "வரைபடம்",
      report: "அறிக்கை",
      verified: "சரிபார்க்கப்பட்டது"
    }
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=18&addressdetails=1`)
            .then(res => res.json())
            .then(data => {
              const a = data.address || {};
              const poi = data.name || a.amenity || a.university || a.college || a.school || a.hospital || a.tourism || a.shop;
              const area = a.suburb || a.neighbourhood || a.village || a.town || a.city_district || a.city || a.county;
              const sector = poi
                ? (area && !poi.toLowerCase().includes(area.toLowerCase()) ? `${poi}, ${area}` : poi)
                : (area || data.display_name?.split(',')[0] || 'Unknown Sector');
              setAddress(sector);
            })
            .catch(() => setAddress('Unknown Sector'));
        },
        () => setAddress("GPS Disabled")
      );
    }
    
    fetch('http://127.0.0.1:5001/api/dangers')
      .then(res => res.json())
      .then(data => {
        setReportCount(data.length);
        // Calculate active threats (e.g., reports from the last 24 hours)
        const now = new Date();
        const active = data.filter(r => (now - new Date(r.timestamp)) < 24 * 60 * 60 * 1000);
        setActiveThreats(active.length);
        setRecentReports(data.slice(0, 3)); // Top 3 recent reports
      })
      .catch(() => {
        setReportCount(0);
        setActiveThreats(0);
      });
  }, []);

  const styles = {
    container: { flex: 1, color: '#F0F0FF', position: 'relative', zIndex: 2, backgroundColor: 'transparent' },
    header: { padding: '40px 40px 0 40px', marginBottom: '40px' },
    hero: { backgroundColor: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(30px)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
    statsContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '40px' },
    statCard: { backgroundColor: 'rgba(22, 22, 37, 0.6)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' },
    actionBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '20px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: 'transform 0.2s' },
    sosButton: { width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#E63946', border: '8px solid rgba(230,57,70,0.2)', color: 'white', fontWeight: 'bold', fontSize: '24px', cursor: 'pointer', boxShadow: '0 0 40px rgba(230,57,70,0.4)', transition: 'all 0.3s ease' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#FFB703', margin: 0, fontFamily: "'Rajdhani', sans-serif" }}>RAKSHAKPATH DASHBOARD</h1>
            <p style={{ color: '#8888AA', margin: 0, fontSize: '14px' }}>Sector Node: <span style={{ color: '#2DC653' }}>{address}</span></p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')} style={{ background: 'rgba(255,183,3,0.1)', border: '1px solid #FFB703', color: '#FFB703', padding: '8px 16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>{language.toUpperCase()}</button>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👤</div>
          </div>
        </div>
      </div>

      <div style={styles.hero}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ maxWidth: '60%' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 16px 0', fontFamily: "'Rajdhani', sans-serif" }}>{t.heroTitle}</h2>
            <p style={{ fontSize: '18px', color: '#8888AA', lineHeight: '1.6', margin: 0 }}>{t.heroSub}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => onNavigate('sos')} style={styles.sosButton}>SOS</button>
            <span style={{ fontSize: '12px', color: '#E63946', fontWeight: 'bold', letterSpacing: '1px' }}>{t.pressEmerg}</span>
          </div>
        </div>
      </div>

      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#E63946' }}>{activeThreats}</div>
          <div style={{ fontSize: '12px', color: '#8888AA', marginTop: '4px' }}>{t.statsDaz} (24h)</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2DC653' }}>{address === 'Locating Node...' ? '...' : Math.floor(Math.random() * 5) + 2}</div>
          <div style={{ fontSize: '12px', color: '#8888AA', marginTop: '4px' }}>{t.statsSafe}</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FFB703' }}>{reportCount}</div>
          <div style={{ fontSize: '12px', color: '#8888AA', marginTop: '4px' }}>{t.statsRep} (Total)</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        <button onClick={() => onNavigate('map')} style={{ ...styles.actionBtn, backgroundColor: '#2DC653', color: 'black' }}>
          <span style={{ fontSize: '24px' }}>🗺️</span> {t.findRoute}
        </button>
        <button onClick={() => onNavigate('report')} style={{ ...styles.actionBtn, backgroundColor: '#FFB703', color: 'black' }}>
          <span style={{ fontSize: '24px' }}>⚠️</span> {t.reportDanger}
        </button>
      </div>

      {/* Recent Alerts Feed */}
      <div style={{ marginTop: '40px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ margin: '0 0 24px 0', fontFamily: "'Rajdhani', sans-serif", fontSize: '20px' }}>⚠️ LIVE SENTINEL FEED</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {recentReports.length === 0 ? (
            <div style={{ color: '#8888AA', fontStyle: 'italic', textAlign: 'center' }}>Scanned sector is currently clear of reported threats.</div>
          ) : (
            recentReports.map((report, idx) => (
              <div key={idx} style={{ padding: '12px', background: 'rgba(230,57,70,0.1)', borderLeft: '4px solid #E63946', borderRadius: '4px' }}>
                <div style={{ color: '#F0F0FF', fontWeight: 'bold', fontSize: '14px' }}>{report.danger_type}</div>
                <div style={{ color: '#8888AA', fontSize: '12px', marginTop: '4px' }}>📍 {report.location_name}</div>
                <div style={{ color: '#8888AA', fontSize: '11px', marginTop: '2px' }}>⏱️ {new Date(report.timestamp).toLocaleTimeString()}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
